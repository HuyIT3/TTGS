import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
export class ChatController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async chat(@Request() req: any, @Body('message') message: string) {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Fetch user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { reply: 'Không tìm thấy thông tin tài khoản người dùng.' };
    }

    let context = '';
    
    if (userRole === 'STUDENT') {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (student) {
        const activeClasses = await this.prisma.classActive.findMany({
          where: { studentId: student.id },
          include: {
            classRequest: true,
            tutor: {
              include: { user: true }
            }
          }
        });
        const openRequests = await this.prisma.classRequest.findMany({
          where: { studentId: student.id, status: 'OPEN' }
        });

        context = `Thông tin học sinh:\n`;
        context += `- Họ tên: ${user.fullName}\n`;
        context += `- Trường/Khối lớp: ${student.school || ''} - ${student.grade || ''}\n`;
        context += `- Các lớp đang học:\n`;
        activeClasses.forEach((c) => {
          context += `  + Môn: ${c.classRequest.subject}, Gia sư: ${c.tutor.user.fullName}, Lịch học: ${c.classRequest.schedule}, Học phí: ${c.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/h\n`;
        });
        context += `- Lớp đang đăng tìm gia sư:\n`;
        openRequests.forEach((r) => {
          context += `  + Tiêu đề: ${r.title}, Môn: ${r.subject}, Học phí đề xuất: ${r.hourlyRate.toLocaleString('vi-VN')} đ/h\n`;
        });
      }
    } else if (userRole === 'TEACHER') {
      const tutor = await this.prisma.tutorProfile.findUnique({
        where: { userId },
      });
      if (tutor) {
        const activeClasses = await this.prisma.classActive.findMany({
          where: { tutorId: tutor.id },
          include: {
            classRequest: true,
            student: {
              include: { user: true }
            }
          }
        });
        const pendingApplications = await this.prisma.tutorApplication.findMany({
          where: { tutorId: tutor.id, status: 'PENDING' },
          include: { classRequest: true }
        });

        context = `Thông tin giáo viên/gia sư:\n`;
        context += `- Họ tên: ${user.fullName}\n`;
        context += `- Kinh nghiệm: ${tutor.experience || ''}\n`;
        context += `- Các môn nhận dạy: ${tutor.subjects.join(', ')}\n`;
        context += `- Các lớp đang nhận dạy:\n`;
        activeClasses.forEach((c) => {
          context += `  + Môn: ${c.classRequest.subject}, Học sinh: ${c.student.user.fullName}, Lịch học: ${c.classRequest.schedule}, Học phí: ${c.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/h\n`;
        });
        context += `- Yêu cầu dạy đang ứng tuyển:\n`;
        pendingApplications.forEach((a) => {
          context += `  + Lớp: ${a.classRequest.title}, Môn: ${a.classRequest.subject}, Học phí: ${a.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/h\n`;
        });
      }
    } else {
      context = `Thông tin quản trị viên:\n- Họ tên: ${user.fullName}\n- Vai trò: Admin\n`;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `Bạn là một trợ lý AI thông minh toàn năng (General AI Assistant), đồng thời tích hợp dữ liệu học vụ của Trung tâm Gia sư Huy Hoàng (Huy Hoàng Tutor Center).
Hãy trả lời bất kỳ câu hỏi nào của người dùng bằng tiếng Việt thân thiện, lịch sự (bao gồm trả lời kiến thức chung, làm văn, giải bài tập, v.v.). Nếu người dùng hỏi về thông tin lịch học, lớp học, học phí hay gia sư của họ trong trung tâm, hãy sử dụng dữ liệu hệ thống dưới đây để trả lời chính xác.
Dưới đây là thông tin tài khoản đang chat với bạn:
${context}`;

        const fullPrompt = `${systemInstruction}\n\nNgười dùng hỏi: ${message}\nTrợ lý AI trả lời:`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: fullPrompt }]
              }]
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return { reply: replyText.trim() };
          }
        } else {
          const errText = await response.text();
          console.error(`Gemini API returned status ${response.status}:`, errText);
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    }

    // Fallback rule-based smart engine if API key is missing or failed
    const promptLower = (message || '').toLowerCase();
    let reply = `Chào bạn ${user.fullName}. `;

    if (promptLower.includes('lịch học') || promptLower.includes('hôm nay') || promptLower.includes('khi nào') || promptLower.includes('giờ')) {
      if (userRole === 'STUDENT') {
        reply += `Theo dữ liệu hệ thống, bạn đang học lớp sau:\n`;
        const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
        const activeClasses = student ? await this.prisma.classActive.findMany({
          where: { studentId: student.id },
          include: { classRequest: true, tutor: { include: { user: true } } }
        }) : [];

        if (activeClasses.length > 0) {
          activeClasses.forEach(c => {
            reply += `- Lớp ${c.classRequest.subject} với Gia sư ${c.tutor.user.fullName}: Lịch học là ${c.classRequest.schedule}.\n`;
          });
        } else {
          reply += `Bạn hiện tại chưa có lớp học hoạt động nào được phân công.`;
        }
      } else if (userRole === 'TEACHER') {
        reply += `Theo dữ liệu hệ thống, bạn đang có các lớp dạy sau:\n`;
        const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId } });
        const activeClasses = tutor ? await this.prisma.classActive.findMany({
          where: { tutorId: tutor.id },
          include: { classRequest: true, student: { include: { user: true } } }
        }) : [];

        if (activeClasses.length > 0) {
          activeClasses.forEach(c => {
            reply += `- Lớp ${c.classRequest.subject} dạy học sinh ${c.student.user.fullName}: Lịch học là ${c.classRequest.schedule}.\n`;
          });
        } else {
          reply += `Bạn hiện tại chưa có lớp dạy hoạt động nào được phân công.`;
        }
      } else {
        reply += `Bạn đang đăng nhập với quyền Admin hệ thống. Lịch học của học sinh/gia sư vui lòng xem tại mục Quản lý lớp học.`;
      }
    } else if (promptLower.includes('học phí') || promptLower.includes('tiền') || promptLower.includes('giá')) {
      if (userRole === 'STUDENT') {
        reply += `Thông tin học phí các lớp học của bạn:\n`;
        const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
        const activeClasses = student ? await this.prisma.classActive.findMany({
          where: { studentId: student.id },
          include: { classRequest: true }
        }) : [];

        if (activeClasses.length > 0) {
          activeClasses.forEach(c => {
            reply += `- Môn ${c.classRequest.subject}: Học phí ${c.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/giờ.\n`;
          });
        } else {
          reply += `Bạn chưa có lớp học hoạt động nào để hiển thị học phí.`;
        }
      } else if (userRole === 'TEACHER') {
        reply += `Thông tin thu nhập học phí đề xuất của bạn:\n`;
        const tutor = await this.prisma.tutorProfile.findUnique({ where: { userId } });
        const activeClasses = tutor ? await this.prisma.classActive.findMany({
          where: { tutorId: tutor.id },
          include: { classRequest: true }
        }) : [];

        if (activeClasses.length > 0) {
          activeClasses.forEach(c => {
            reply += `- Môn ${c.classRequest.subject}: ${c.classRequest.hourlyRate.toLocaleString('vi-VN')} đ/giờ.\n`;
          });
        } else {
          reply += `Bạn chưa có lớp nhận dạy hoạt động nào.`;
        }
      }
    } else if (promptLower.includes('gia sư') || promptLower.includes('giáo viên') || promptLower.includes('thầy') || promptLower.includes('cô')) {
      if (userRole === 'STUDENT') {
        reply += `Thông tin gia sư đang giảng dạy cho bạn:\n`;
        const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
        const activeClasses = student ? await this.prisma.classActive.findMany({
          where: { studentId: student.id },
          include: { classRequest: true, tutor: { include: { user: true } } }
        }) : [];

        if (activeClasses.length > 0) {
          activeClasses.forEach(c => {
            reply += `- Môn ${c.classRequest.subject}: Gia sư ${c.tutor.user.fullName} (${c.tutor.user.phone}).\n`;
          });
        } else {
          reply += `Bạn chưa có lớp học hoạt động để kết nối gia sư.`;
        }
      } else {
        reply += `Bạn có thể xem thông tin gia sư khác tại trang chủ của trung tâm.`;
      }
    } else {
      reply += `Tôi là Trợ lý Học vụ ảo của trung tâm gia sư Huy Hoàng. Bạn có thể hỏi tôi về lịch học hôm nay, thông tin học phí hoặc liên hệ gia sư!`;
    }

    return { reply };
  }
}
