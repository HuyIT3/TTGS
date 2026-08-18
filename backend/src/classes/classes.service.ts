import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
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

  async updateRequest(userId: string, userRole: Role, requestId: string, data: any) {
    const request = await this.prisma.classRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Yêu cầu tìm gia sư không tồn tại');

    if (userRole !== Role.ADMIN) {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (!student || student.id !== request.studentId) {
        throw new ForbiddenException('Bạn không có quyền chỉnh sửa yêu cầu này');
      }
    }

    return this.prisma.classRequest.update({
      where: { id: requestId },
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        hourlyRate: data.hourlyRate !== undefined ? Number(data.hourlyRate) : undefined,
        sessionsPerWeek: data.sessionsPerWeek !== undefined ? Number(data.sessionsPerWeek) : undefined,
        schedule: data.schedule,
        location: data.location,
        status: data.status,
      },
    });
  }

  async deleteRequest(userId: string, userRole: Role, requestId: string) {
    const request = await this.prisma.classRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Yêu cầu tìm gia sư không tồn tại');

    if (userRole !== Role.ADMIN) {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (!student || student.id !== request.studentId) {
        throw new ForbiddenException('Bạn không có quyền xóa yêu cầu này');
      }
    }

    return this.prisma.classRequest.delete({
      where: { id: requestId },
    });
  }

  async generateTestFromPdf(fileBuffer: Buffer, subject: string): Promise<any[]> {
    const base64Data = fileBuffer.toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('Gemini API Key chưa được cấu hình trên máy chủ.');
    }

    const systemPrompt = `Bạn là một trợ lý AI thông minh chuyên về giáo dục. 
Nhiệm vụ của bạn là đọc toàn bộ đề thi môn ${subject || 'Toán học'} trong file PDF đính kèm (đây có thể là file PDF dạng văn bản hoặc dạng quét ảnh chụp đề thi) và chuyển đổi nó thành một bộ câu hỏi trắc nghiệm chuẩn hóa ở định dạng JSON.

Đề thi bao gồm 3 phần, bạn phải trích xuất đầy đủ tất cả các câu hỏi của cả 3 phần:
- PHẦN I: Gồm các câu hỏi trắc nghiệm lựa chọn đơn (MCQ), trích xuất đầy đủ tất cả các câu.
- PHẦN II: Gồm các câu hỏi trắc nghiệm Đúng/Sai (TF), mỗi câu có 4 phát biểu a, b, c, d.
- PHẦN III: Gồm các câu hỏi trả lời ngắn (SHORT), trích xuất đầy đủ tất cả các câu.

HƯỚNG DẪN ĐỊNH DẠNG:
- Trả về duy nhất một mảng JSON các câu hỏi (không có thẻ Markdown, không bao gồm ký tự \`\`\`json ở đầu và cuối).
- Mỗi câu hỏi trong mảng phải tuân theo cấu trúc sau:
{
  "id": số thứ tự liên tục trong mảng từ 1 đến hết (ví dụ: MCQ từ 1-12, TF tiếp theo, SHORT tiếp theo),
  "type": "MCQ" hoặc "TF" hoặc "SHORT",
  "text": "Nội dung câu hỏi...",
  "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], // CHỈ dành cho MCQ
  "statements": ["a) Phát biểu 1...", "b) Phát biểu 2...", "c) Phát biểu 3...", "d) Phát biểu 4..."], // CHỈ dành cho TF
  "correctAnswer": "A" // Đối với MCQ: "A", "B", "C" hoặc "D";
                     // Đối với TF: một object map { "0": true/false, "1": true/false, "2": true/false, "3": true/false } đại diện cho Đúng (true) hoặc Sai (false) của a, b, c, d;
                     // Đối với SHORT: đáp án ngắn (ví dụ: "3" hoặc "145").
}

YÊU CẦU ĐẶC BIỆT:
1. Đối với các ký tự Toán học phức tạp như vectơ, phân số, giới hạn, tích phân:
   - Hãy chuyển đổi sang ký hiệu Unicode dễ đọc (ví dụ: viết vectơ AB thành "vectơ AB" hoặc dùng ký tự mũi tên "AB →" hoặc viết rõ "vectơ BA + vectơ A'C'"). Tránh viết các công thức thô thiếu định dạng.
2. Đối với các câu hỏi có hình vẽ minh họa hoặc bảng biểu:
   - Vì không hiển thị được trực tiếp hình ảnh, hãy mô tả ngắn gọn/chi tiết các thông số của hình vẽ trực tiếp vào nội dung câu hỏi để học sinh có thể hiểu đề bài và giải được mà không cần nhìn hình (Ví dụ: mô tả hình dạng, cạnh, góc, tọa độ các điểm có trong hình vẽ...).
3. Hãy cố gắng trích xuất tối đa và đầy đủ tất cả các câu hỏi của cả 3 phần có trong file PDF đề thi này. Không bỏ sót phần nào.

Hãy trả về duy nhất mảng JSON thô:`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data
                  }
                },
                {
                  text: systemPrompt
                }
              ]
            }]
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        replyText = replyText.trim();
        
        // Remove potential markdown wrappers
        if (replyText.startsWith('```json')) {
          replyText = replyText.substring(7);
        }
        if (replyText.startsWith('```')) {
          replyText = replyText.substring(3);
        }
        if (replyText.endsWith('```')) {
          replyText = replyText.substring(0, replyText.length - 3);
        }
        
        replyText = replyText.trim();
        
        try {
          return JSON.parse(replyText);
        } catch (jsonErr) {
          console.error('Failed to parse Gemini JSON response:', replyText, jsonErr);
          throw new BadRequestException('Không thể chuyển đổi đề thi thành cấu trúc trắc nghiệm chuẩn do lỗi định dạng từ AI.');
        }
      } else {
        const errText = await response.text();
        console.error('Gemini API Error details:', errText);
        throw new BadRequestException('Lỗi kết nối tới AI để tạo đề thi.');
      }
    } catch (err) {
      console.error('Gemini API Exception:', err);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Gặp sự cố khi gửi dữ liệu đề thi tới AI.');
    }
  }
}
