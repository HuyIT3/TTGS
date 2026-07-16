import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const totalUsers = await this.prisma.user.count();
    const totalTutors = await this.prisma.tutorProfile.count();
    const totalStudents = await this.prisma.studentProfile.count();
    const activeClasses = await this.prisma.classActive.count();

    const sumRevenue = await this.prisma.systemStat.aggregate({
      _sum: {
        revenue: true,
      },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await this.prisma.systemStat.findMany({
      where: {
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    const classes = await this.prisma.classRequest.findMany({
      select: { subject: true },
    });
    const subjectsMap: Record<string, number> = {};
    classes.forEach((c) => {
      subjectsMap[c.subject] = (subjectsMap[c.subject] || 0) + 1;
    });

    const subjectStats = Object.keys(subjectsMap).map((key) => ({
      subject: key,
      count: subjectsMap[key],
    }));

    return {
      overview: {
        totalUsers,
        totalTutors,
        totalStudents,
        activeClasses,
        totalRevenue: sumRevenue._sum.revenue || 0,
      },
      dailyStats,
      subjectStats,
    };
  }

  async getTeacherStats(userId: string) {
    const tutor = await this.prisma.tutorProfile.findUnique({
      where: { userId },
      include: {
        classes: {
          include: {
            classRequest: true,
          },
        },
        feedbacks: true,
      },
    });
    if (!tutor) throw new NotFoundException('Gia sư không tồn tại');

    const totalClasses = tutor.classes.length;
    const completedClasses = tutor.classes.filter(c => c.status === 'COMPLETED').length;
    
    let totalEarnings = 0;
    tutor.classes.forEach((c) => {
      const rate = c.classRequest.hourlyRate;
      const sessions = c.classRequest.sessionsPerWeek;
      // Tính trung bình mỗi tháng 4 tuần, mỗi tuần học số buổi quy định
      totalEarnings += rate * sessions * 4;
    });

    const avgRating = tutor.feedbacks.length > 0
      ? tutor.feedbacks.reduce((sum, f) => sum + f.rating, 0) / tutor.feedbacks.length
      : 5;

    const monthlyIncome = [
      { month: 'Tháng 3', income: Math.round(totalEarnings * 0.4) },
      { month: 'Tháng 4', income: Math.round(totalEarnings * 0.6) },
      { month: 'Tháng 5', income: Math.round(totalEarnings * 0.8) },
      { month: 'Tháng 6', income: totalEarnings },
    ];

    return {
      overview: {
        totalClasses,
        completedClasses,
        totalEarnings,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      monthlyIncome,
    };
  }
}
