import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Create a notification for a specific user */
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        metadata: dto.metadata ?? undefined,
      },
    });
  }

  /** Get all notifications for a user (latest first) */
  async findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** Count unread notifications for badge */
  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /** Mark single notification as read */
  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  /** Mark all notifications as read */
  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /** Delete old read notifications (cleanup) */
  async deleteOldRead(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.prisma.notification.deleteMany({
      where: { userId, isRead: true, createdAt: { lt: thirtyDaysAgo } },
    });
  }

  // ── Convenience helpers for other services ──

  async notifyClassAssigned(teacherUserId: string, studentName: string, classTitle: string, classId: string) {
    return this.create({
      userId: teacherUserId,
      type: 'CLASS_ASSIGNED',
      title: '🎉 Bạn vừa nhận lớp mới!',
      body: `Học viên ${studentName} đã phê duyệt bạn dạy lớp "${classTitle}". Hãy liên hệ để sắp xếp lịch học.`,
      metadata: { classId, studentName, classTitle },
    });
  }

  async notifyLeaveRequest(targetUserId: string, requesterName: string, role: 'student' | 'teacher', classTitle: string) {
    const emoji = role === 'student' ? '📋' : '⚠️';
    const from = role === 'student' ? 'Học viên' : 'Gia sư';
    return this.create({
      userId: targetUserId,
      type: 'LEAVE_REQUEST',
      title: `${emoji} ${from} báo nghỉ buổi học`,
      body: `${from} ${requesterName} đã gửi yêu cầu nghỉ buổi học lớp "${classTitle}". Vui lòng xác nhận và sắp xếp dạy bù.`,
      metadata: { requesterName, role, classTitle },
    });
  }

  async notifySalaryPaid(teacherUserId: string, amount: number, month: number, year: number) {
    return this.create({
      userId: teacherUserId,
      type: 'SALARY_PAID',
      title: '💰 Lương đã được chuyển khoản!',
      body: `Trung tâm đã chuyển ${amount.toLocaleString('vi-VN')}đ lương tháng ${month}/${year} vào tài khoản của bạn.`,
      metadata: { amount, month, year },
    });
  }

  async notifyProfileApproved(teacherUserId: string) {
    return this.create({
      userId: teacherUserId,
      type: 'PROFILE_APPROVED',
      title: '✅ Hồ sơ gia sư đã được phê duyệt!',
      body: 'Chúc mừng! Hồ sơ của bạn đã được Admin duyệt. Bạn có thể bắt đầu ứng tuyển các lớp học phù hợp.',
      metadata: {},
    });
  }

  async notifyApplicationReceived(studentUserId: string, tutorName: string, classTitle: string) {
    return this.create({
      userId: studentUserId,
      type: 'APPLICATION_RECEIVED',
      title: '📨 Có gia sư mới ứng tuyển!',
      body: `Gia sư ${tutorName} vừa nộp đơn ứng tuyển lớp "${classTitle}". Hãy xem hồ sơ và đưa ra quyết định.`,
      metadata: { tutorName, classTitle },
    });
  }

  async notifyClassReminder(userId: string, classTitle: string, schedule: string) {
    return this.create({
      userId,
      type: 'CLASS_REMINDER',
      title: '⏰ Nhắc nhở buổi học sắp tới',
      body: `Buổi học lớp "${classTitle}" sẽ bắt đầu theo lịch: ${schedule}. Chuẩn bị tài liệu và đến đúng giờ nhé!`,
      metadata: { classTitle, schedule },
    });
  }
}
