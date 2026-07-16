import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      this.logger.warn(
        'EMAIL_USER or EMAIL_PASS is not configured. Email sending will be mocked.',
      );
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass,
        },
      });
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.log(`[MOCK EMAIL BODY] ${html}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Gia sư Huy Hoàng" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendVerificationOtp(to: string, otpCode: string, fullName: string) {
    const subject = '[Gia sư Huy Hoàng] Mã OTP xác nhận đăng ký tài khoản';
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">Gia sư Huy Hoàng</h2>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Xin chào <strong>${fullName}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản trên hệ thống Gia sư Huy Hoàng. Để hoàn tất quy trình đăng ký, vui lòng sử dụng mã xác nhận OTP dưới đây:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 12px 30px; border-radius: 8px; border: 1px dashed #3b82f6; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #ef4444; font-weight: 500;">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
          Đây là email tự động từ hệ thống Gia sư Huy Hoàng.<br />
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.<br />
          © 2026 Gia sư Huy Hoàng. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  async sendForgotPasswordOtp(to: string, otpCode: string, fullName: string) {
    const subject = '[Gia sư Huy Hoàng] Mã OTP đặt lại mật khẩu';
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #78350f; margin: 0; font-size: 24px;">Gia sư Huy Hoàng</h2>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Xin chào <strong>${fullName}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhập mã OTP dưới đây để tiếp tục thiết lập mật khẩu mới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #d97706; background-color: #fef3c7; padding: 12px 30px; border-radius: 8px; border: 1px dashed #f59e0b; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #ef4444; font-weight: 500;">Lưu ý: Mã OTP này có hiệu lực trong vòng 5 phút. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng đổi mật khẩu tài khoản email hoặc liên hệ với chúng tôi để bảo mật.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
          Đây là email tự động từ hệ thống Gia sư Huy Hoàng.<br />
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.<br />
          © 2026 Gia sư Huy Hoàng. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }
}
