import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, ResendOtpDto, GoogleLoginDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';
import { OtpService } from '../otp/otp.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private otpService: OtpService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          fullName: dto.fullName,
          phone: dto.phone,
          role: dto.role,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          isVerified: false, // Bắt buộc xác thực OTP
        },
      });

      if (dto.role === 'TEACHER') {
        await tx.tutorProfile.create({
          data: {
            userId: newUser.id,
            subjects: [],
            bio: '',
            experience: '',
            certificates: [],
            hourlyRate: 150000,
          },
        });
      } else if (dto.role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            grade: '',
            school: '',
            address: '',
          },
        });
      }

      return newUser;
    });

    // Sinh mã OTP và gửi email
    const otpCode = await this.otpService.generateOtp(user.email, 'VERIFY_EMAIL');
    await this.emailService.sendVerificationOtp(user.email, otpCode, user.fullName);

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP xác thực.',
      email: user.email,
      requiresVerification: true,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(dto.email, dto.code, dto.type);
    if (!isValid) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    if (dto.type === 'VERIFY_EMAIL') {
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { isVerified: true },
      });
      return { message: 'Xác thực tài khoản thành công. Bạn đã có thể đăng nhập.' };
    }

    // Nếu là quên mật khẩu, trả về thông tin thành công để cho phép reset mật khẩu
    return { message: 'Xác minh OTP thành công.', success: true };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    const otpCode = await this.otpService.generateOtp(dto.email, dto.type);

    if (dto.type === 'VERIFY_EMAIL') {
      await this.emailService.sendVerificationOtp(dto.email, otpCode, user.fullName);
    } else if (dto.type === 'FORGOT_PASSWORD') {
      await this.emailService.sendForgotPasswordOtp(dto.email, otpCode, user.fullName);
    }

    return { message: 'Mã OTP mới đã được gửi lại vào email của bạn.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    const otpCode = await this.otpService.generateOtp(dto.email, 'FORGOT_PASSWORD');
    await this.emailService.sendForgotPasswordOtp(dto.email, otpCode, user.fullName);

    return {
      message: 'Mã OTP đặt lại mật khẩu đã được gửi vào email của bạn.',
      email: dto.email,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Để bảo mật, kiểm tra lại OTP một lần nữa (hoặc trong verifyOtp đã xoá OTP nên ở đây ta check trực tiếp mã)
    // Cách an toàn: verifyOtp sẽ xoá OTP, nên ta cần thực hiện quy trình verify + reset cùng lúc hoặc kiểm tra trực tiếp
    const isValid = await this.otpService.verifyOtp(dto.email, dto.code, 'FORGOT_PASSWORD');
    if (!isValid) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashedPassword },
    });

    return { message: 'Đặt lại mật khẩu thành công. Bạn đã có thể đăng nhập bằng mật khẩu mới.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        tutorProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không chính xác hoặc đã bị khóa');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('TÀI_KHOẢN_CHƯA_XÁC_MINH');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        tutorProfile: user.tutorProfile,
        studentProfile: user.studentProfile,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }

  async googleLogin(dto: GoogleLoginDto) {
    // Verify Google ID token via Google's tokeninfo endpoint
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.idToken}`
    );

    if (!res.ok) {
      throw new UnauthorizedException('Google token không hợp lệ hoặc đã hết hạn.');
    }

    const payload = await res.json();

    // Validate token audience (Google Client ID)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      throw new UnauthorizedException('Google token không hợp lệ: sai Client ID.');
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      throw new BadRequestException('Không lấy được email từ tài khoản Google.');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true, studentProfile: true },
    });

    if (!user) {
      // Create new user from Google account
      const role: Role = (dto.role === 'TEACHER' ? 'TEACHER' : 'STUDENT') as Role;

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: await bcrypt.hash(googleId + '_google_oauth', 10),
            fullName: name || email.split('@')[0],
            phone: '',
            role,
            avatar: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            isVerified: true,  // Google accounts are pre-verified
            isActive: true,
          },
        });

        if (role === 'TEACHER') {
          await tx.tutorProfile.create({
            data: {
              userId: newUser.id,
              subjects: [],
              bio: '',
              experience: '',
              certificates: [],
              hourlyRate: 150000,
            },
          });
        } else {
          await tx.studentProfile.create({
            data: {
              userId: newUser.id,
              grade: '',
              school: '',
              address: '',
            },
          });
        }

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: { tutorProfile: true, studentProfile: true },
        });
      }) as typeof user;
    } else {
      // Existing user: update avatar if changed
      if (picture && picture !== user.avatar) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture, isVerified: true },
        });
        user.avatar = picture;
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Tài khoản của bạn đã bị khóa.');
      }
    }

    const token = this.generateToken(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        tutorProfile: user.tutorProfile,
        studentProfile: user.studentProfile,
      },
      token,
      isNewUser: !user.tutorProfile && !user.studentProfile ? false : false,
    };
  }
}
