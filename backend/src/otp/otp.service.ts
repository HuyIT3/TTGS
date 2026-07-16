import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sinh mã OTP 6 chữ số và lưu vào database
   */
  async generateOtp(email: string, type: string): Promise<string> {
    // Tạo mã ngẫu nhiên 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hạn sử dụng: 5 phút

    // Lưu/Cập nhật OTP vào database
    await this.prisma.otp.upsert({
      where: {
        email_type: { email, type },
      },
      update: {
        code,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        email,
        code,
        type,
        expiresAt,
      },
    });

    return code;
  }

  /**
   * Xác thực mã OTP
   */
  async verifyOtp(email: string, code: string, type: string): Promise<boolean> {
    const record = await this.prisma.otp.findUnique({
      where: {
        email_type: { email, type },
      },
    });

    if (!record) {
      return false;
    }

    // Kiểm tra hết hạn
    if (new Date() > record.expiresAt) {
      // Xoá OTP đã hết hạn
      await this.prisma.otp.delete({
        where: { id: record.id },
      });
      return false;
    }

    // So sánh mã code
    if (record.code !== code) {
      return false;
    }

    // Xác thực thành công: Xoá OTP đi để tránh dùng lại
    await this.prisma.otp.delete({
      where: { id: record.id },
    });

    return true;
  }
}
