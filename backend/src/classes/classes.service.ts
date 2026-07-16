import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassStatus, ApplicationStatus, Role } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, data: any) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) throw new NotFoundException('Hồ sơ học sinh không tồn tại');

    return this.prisma.classRequest.create({
      data: {
        studentId: student.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        hourlyRate: Number(data.hourlyRate),
        sessionsPerWeek: Number(data.sessionsPerWeek),
        schedule: data.schedule,
        location: data.location,
        status: ClassStatus.OPEN,
      },
    });
  }

  async getAllRequests() {
    return this.prisma.classRequest.findMany({
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true, avatar: true },
            },
          },
        },
        applications: {
          include: {
            tutor: {
              include: {
                user: { select: { fullName: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestById(id: string) {
    const request = await this.prisma.classRequest.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, avatar: true } },
          },
        },
      },
    });
    if (!request) throw new NotFoundException('Yêu cầu tìm gia sư không tồn tại');
    return request;
  }

  async getStudentRequests(userId: string) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Học sinh không tồn tại');
    return this.prisma.classRequest.findMany({
      where: { studentId: student.id },
      include: {
        applications: {
          include: {
            tutor: {
              include: {
                user: { select: { fullName: true, avatar: true, phone: true } },
              },
            },
          },
        },
        classActive: {
          include: {
            tutor: {
              include: {
                user: { select: { fullName: true, phone: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyToRequest(userId: string, requestId: string, notes: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutor) throw new NotFoundException('Gia sư không tồn tại');
    if (tutor.status !== 'APPROVED') {
      throw new ForbiddenException('Tài khoản gia sư chưa được phê duyệt bởi Admin');
    }

    const request = await this.prisma.classRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Yêu cầu lớp không tồn tại');
    if (request.status !== ClassStatus.OPEN) {
      throw new ConflictException('Lớp học này đã đóng hoặc đã giao cho gia sư khác');
    }

    const existing = await this.prisma.tutorApplication.findUnique({
      where: {
        classRequestId_tutorId: { classRequestId: requestId, tutorId: tutor.id },
      },
    });
    if (existing) throw new ConflictException('Bạn đã ứng tuyển lớp này rồi');

    return this.prisma.tutorApplication.create({
      data: {
        classRequestId: requestId,
        tutorId: tutor.id,
        notes,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async getTutorApplications(userId: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId } });
    if (!tutor) throw new NotFoundException('Gia sư không tồn tại');
    return this.prisma.tutorApplication.findMany({
      where: { tutorId: tutor.id },
      include: {
        classRequest: {
          include: {
            student: {
              include: {
                user: { select: { fullName: true, phone: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestApplications(requestId: string) {
    return this.prisma.tutorApplication.findMany({
      where: { classRequestId: requestId },
      include: {
        tutor: {
          include: {
            user: { select: { fullName: true, avatar: true, phone: true } },
          },
        },
      },
    });
  }

  async handleApplication(userId: string, userRole: Role, appId: string, status: ApplicationStatus) {
    const app = await this.prisma.tutorApplication.findUnique({
      where: { id: appId },
      include: {
        classRequest: true,
      },
    });
    if (!app) throw new NotFoundException('Đơn ứng tuyển không tồn tại');

    // Xác thực quyền sở hữu lớp
    if (userRole !== Role.ADMIN) {
      const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
      if (!student || student.id !== app.classRequest.studentId) {
        throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
      }
    }

    if (status === ApplicationStatus.ACCEPTED) {
      return this.prisma.$transaction(async (tx) => {
        const updatedApp = await tx.tutorApplication.update({
          where: { id: appId },
          data: { status: ApplicationStatus.ACCEPTED },
        });

        await tx.classRequest.update({
          where: { id: app.classRequestId },
          data: { status: ClassStatus.ASSIGNED },
        });

        const activeClass = await tx.classActive.create({
          data: {
            classRequestId: app.classRequestId,
            studentId: app.classRequest.studentId,
            tutorId: app.tutorId,
            status: ClassStatus.ASSIGNED,
          },
        });

        // Từ chối các gia sư khác ứng tuyển vào lớp này
        await tx.tutorApplication.updateMany({
          where: {
            classRequestId: app.classRequestId,
            id: { not: appId },
          },
          data: { status: ApplicationStatus.REJECTED },
        });

        // Cập nhật thống kê hệ thống (Ví dụ: Trung tâm thu 200,000đ tiền phí môi giới lớp)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await tx.systemStat.upsert({
          where: { date: today },
          update: {
            classes: { increment: 1 },
            revenue: { increment: 200000 },
          },
          create: {
            date: today,
            classes: 1,
            revenue: 200000,
          },
        });

        return { updatedApp, activeClass };
      });
    } else {
      return this.prisma.tutorApplication.update({
        where: { id: appId },
        data: { status: ApplicationStatus.REJECTED },
      });
    }
  }

  async getActiveClasses(userId: string, role: Role) {
    if (role === Role.TEACHER) {
      const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId } });
      if (!tutor) throw new NotFoundException('Gia sư không tồn tại');
      return this.prisma.classActive.findMany({
        where: { tutorId: tutor.id },
        include: {
          classRequest: true,
          student: {
            include: {
              user: { select: { fullName: true, phone: true, avatar: true } },
            },
          },
        },
      });
    } else {
      const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
      if (!student) throw new NotFoundException('Học sinh không tồn tại');
      return this.prisma.classActive.findMany({
        where: { studentId: student.id },
        include: {
          classRequest: true,
          tutor: {
            include: {
              user: { select: { fullName: true, phone: true, avatar: true } },
            },
          },
        },
      });
    }
  }

  async submitFeedback(userId: string, tutorId: string, rating: number, comment: string) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Học sinh không tồn tại');

    return this.prisma.feedback.upsert({
      where: {
        studentId_tutorId: { studentId: student.id, tutorId },
      },
      update: { rating, comment },
      create: { studentId: student.id, tutorId, rating, comment },
    });
  }
}
