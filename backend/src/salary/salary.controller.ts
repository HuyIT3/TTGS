import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  /** GET /salary/summary?month=8&year=2026 — Admin only */
  @Get('summary')
  async getAdminSummary(@Query('month') month: string, @Query('year') year: string) {
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    return this.salaryService.getAdminSalarySummary(m, y);
  }

  /** GET /salary/mine — Teacher's own salary */
  @Get('mine')
  async getMySalary(@Request() req: any) {
    return this.salaryService.getTeacherSalary(req.user.sub);
  }

  /** POST /salary/pay — Admin records a payment */
  @Post('pay')
  async recordPayment(
    @Request() req: any,
    @Body() body: {
      tutorId: string;
      amount: number;
      month: number;
      year: number;
      sessions: number;
      note?: string;
    },
  ) {
    return this.salaryService.recordPayment(
      req.user.sub,
      body.tutorId,
      body.amount,
      body.month,
      body.year,
      body.sessions,
      body.note,
    );
  }

  /** POST /salary/leave-request — Student or Teacher sends leave request */
  @Post('leave-request')
  async sendLeaveRequest(
    @Request() req: any,
    @Body() body: { classId: string; role: 'student' | 'teacher'; reason?: string },
  ) {
    return this.salaryService.sendLeaveRequest(
      req.user.sub,
      body.role,
      body.classId,
      body.reason || 'Không có lý do cụ thể',
    );
  }

  /** POST /salary/reminder/:classId — Trigger class reminder */
  @Post('reminder/:classId')
  async sendReminder(@Param('classId') classId: string) {
    return this.salaryService.sendClassReminder(classId);
  }
}
