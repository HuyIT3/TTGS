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
