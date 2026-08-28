import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SalaryService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /**
   * Admin: Get salary summary for all tutors for a given month/year.
   * Calculates sessions count and expected earnings.
   */
  async getAdminSalarySummary(month: number, year: number) {
    const tutors = await this.prisma.tutorProfile.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        classes: {
          where: { status: 'ASSIGNED' },
          include: { classRequest: true },
        },
        salaryPayments: {
          where: { month, year },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    return tutors.map((tutor) => {
      const totalClasses = tutor.classes.length;
      // Estimated sessions this month: sessionsPerWeek * ~4 weeks
      const sessionsEstimated = tutor.classes.reduce(
        (sum, c) => sum + (c.classRequest.sessionsPerWeek * 4),
        0
      );
      const hourlyRate = tutor.hourlyRate;
      // Each session ~2 hours, platform takes 20% commission
      const expectedEarning = sessionsEstimated * 2 * hourlyRate * 0.8;
      const paid = tutor.salaryPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, expectedEarning - paid);
      const isPaid = tutor.salaryPayments.length > 0;

      return {
        tutorId: tutor.id,
        userId: tutor.userId,
        fullName: tutor.user.fullName,
        phone: tutor.user.phone,
        avatar: tutor.user.avatar,
        subjects: tutor.subjects,
        hourlyRate,
        totalClasses,
        sessionsEstimated,
        expectedEarning: Math.round(expectedEarning),
        paid,
        remaining: Math.round(remaining),
        isPaid,
        payments: tutor.salaryPayments,
      };
    });
  }

  /**
   * Admin: Record a salary payment for a tutor
   */
  async recordPayment(
    adminUserId: string,
    tutorId: string,
    amount: number,
    month: number,
    year: number,
    sessions: number,
    note?: string,
  ) {
    // Verify tutor exists
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
      include: { user: true },
    });
    if (!tutor) throw new NotFoundException('Không tìm thấy hồ sơ gia sư.');

    // Create payment record
    const payment = await this.prisma.salaryPayment.create({
      data: {
        tutorId,
        amount,
        month,
        year,
        sessions,
        note,
        paidBy: adminUserId,
      },
    });

    // Send notification to teacher
    await this.notifications.notifySalaryPaid(tutor.userId, amount, month, year);

    return payment;
  }

  /**
   * Teacher: Get their own salary history
   */
  async getTeacherSalary(userId: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        classes: {
          where: { status: 'ASSIGNED' },
          include: { classRequest: true },
        },
        salaryPayments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!tutor) return { payments: [], activeClasses: 0, totalEarned: 0, monthlyBreakdown: [] };

    const totalEarned = tutor.salaryPayments.reduce((s, p) => s + p.amount, 0);

    // Group payments by month/year for chart
    const monthlyBreakdown = tutor.salaryPayments.reduce<Record<string, number>>(
      (acc, p) => {
        const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + p.amount;
        return acc;
      },
      {}
    );

    return {
      payments: tutor.salaryPayments,
      activeClasses: tutor.classes.length,
      totalEarned,
      monthlyBreakdown: Object.entries(monthlyBreakdown)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
    };
  }

  /**
   * Send leave request notification
   */
  async sendLeaveRequest(
    senderUserId: string,
    role: 'student' | 'teacher',
    classId: string,
    reason: string,
  ) {
    // Find the class and the other party
    const classActive = await this.prisma.classActive.findUnique({
      where: { id: classId },
      include: {
        student: { include: { user: true } },
        tutor: { include: { user: true } },
        classRequest: true,
      },
    });
    if (!classActive) throw new NotFoundException('Không tìm thấy lớp học.');

    const classTitle = classActive.classRequest.title;

    if (role === 'student') {
      // Notify teacher
      const senderName = classActive.student.user.fullName;
      await this.notifications.notifyLeaveRequest(
        classActive.tutor.userId,
        senderName,
        'student',
        classTitle,
      );
    } else {
      // Notify student
      const senderName = classActive.tutor.user.fullName;
      await this.notifications.notifyLeaveRequest(
        classActive.student.userId,
        senderName,
        'teacher',
        classTitle,
      );
    }

    return { success: true, message: 'Đã gửi thông báo nghỉ thành công.' };
  }

  /**
   * Send class reminder notification (manual trigger)
   */
  async sendClassReminder(classId: string) {
    const classActive = await this.prisma.classActive.findUnique({
      where: { id: classId },
      include: {
        student: { include: { user: true } },
        tutor: { include: { user: true } },
        classRequest: true,
      },
    });
    if (!classActive) throw new NotFoundException('Không tìm thấy lớp học.');

    const classTitle = classActive.classRequest.title;
    const schedule = classActive.classRequest.schedule;

    // Notify both student and teacher
    await this.notifications.notifyClassReminder(classActive.student.userId, classTitle, schedule);
    await this.notifications.notifyClassReminder(classActive.tutor.userId, classTitle, schedule);

    return { success: true };
  }
}
