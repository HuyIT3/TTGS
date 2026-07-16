import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ApplicationStatus } from '@prisma/client';

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get('requests')
  getAllRequests() {
    return this.classesService.getAllRequests();
  }

  @Get('requests/:id')
  getRequestById(@Param('id') id: string) {
    return this.classesService.getRequestById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('requests')
  createRequest(@Request() req: any, @Body() data: any) {
    return this.classesService.createRequest(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Get('student/requests')
  getStudentRequests(@Request() req: any) {
    return this.classesService.getStudentRequests(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Post('requests/:id/apply')
  applyToRequest(
    @Request() req: any,
    @Param('id') requestId: string,
    @Body('notes') notes: string,
  ) {
    return this.classesService.applyToRequest(req.user.id, requestId, notes);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get('teacher/applications')
  getTutorApplications(@Request() req: any) {
    return this.classesService.getTutorApplications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/:id/applications')
  getRequestApplications(@Param('id') requestId: string) {
    return this.classesService.getRequestApplications(requestId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:appId')
  handleApplication(
    @Request() req: any,
    @Param('appId') appId: string,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.classesService.handleApplication(req.user.id, req.user.role, appId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active')
  getActiveClasses(@Request() req: any) {
    return this.classesService.getActiveClasses(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  @Post('tutors/:tutorId/feedback')
  submitFeedback(
    @Request() req: any,
    @Param('tutorId') tutorId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    return this.classesService.submitFeedback(req.user.id, tutorId, rating, comment);
  }
}
