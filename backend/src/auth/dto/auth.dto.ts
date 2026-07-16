import { Role } from '@prisma/client';

export class RegisterDto {
  email!: string;
  password!: string;
  fullName!: string;
  phone?: string;
  role!: Role;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class VerifyOtpDto {
  email!: string;
  code!: string;
  type!: string; // 'VERIFY_EMAIL' | 'FORGOT_PASSWORD'
}

export class ForgotPasswordDto {
  email!: string;
}

export class ResetPasswordDto {
  email!: string;
  code!: string;
  newPassword!: string;
}

export class ResendOtpDto {
  email!: string;
  type!: string;
}

