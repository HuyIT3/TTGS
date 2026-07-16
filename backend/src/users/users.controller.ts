import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ProfileStatus } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('tutors')
  getApprovedTutors() {
    return this.usersService.getApprovedTutors();
  }

  @Get('tutors/:id')
  getTutorById(@Param('id') id: string) {
    return this.usersService.getTutorById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tutor-profile')
  updateTutorProfile(@Request() req: any, @Body() data: any) {
    return this.usersService.updateTutorProfile(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('student-profile')
  updateStudentProfile(@Request() req: any, @Body() data: any) {
    return this.usersService.updateStudentProfile(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/toggle-active')
  toggleUserActive(@Param('id') id: string) {
    return this.usersService.toggleUserActive(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('tutors/:tutorId/status')
  updateTutorStatus(
    @Param('tutorId') tutorId: string,
    @Body('status') status: ProfileStatus,
  ) {
    return this.usersService.updateTutorStatus(tutorId, status);
  }
}
