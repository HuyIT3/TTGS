import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        tutorProfile: true,
        studentProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    // Trả về ko có mật khẩu
    return users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  async getApprovedTutors() {
    return this.prisma.tutorProfile.findMany({
      where: { status: ProfileStatus.APPROVED },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        feedbacks: {
          include: {
            student: {
              include: {
                user: {
                  select: { fullName: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async getTutorById(id: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        feedbacks: {
          include: {
            student: {
              include: {
                user: {
                  select: { fullName: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });
    if (!tutor) throw new NotFoundException('Gia sư không tồn tại');
    return tutor;
  }

  async updateTutorProfile(userId: string, data: any) {
    return this.prisma.tutorProfile.update({
      where: { userId },
      data: {
        subjects: data.subjects,
        bio: data.bio,
        experience: data.experience,
        certificates: data.certificates,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
      },
    });
  }

  async updateStudentProfile(userId: string, data: any) {
    return this.prisma.studentProfile.update({
      where: { userId },
      data: {
        grade: data.grade,
        school: data.school,
        address: data.address,
      },
    });
  }

  async toggleUserActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async updateTutorStatus(tutorId: string, status: ProfileStatus) {
    const tutor = await this.prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    if (!tutor) throw new NotFoundException('Gia sư không tồn tại');
    return this.prisma.tutorProfile.update({
      where: { id: tutorId },
      data: { status },
    });
  }
}
