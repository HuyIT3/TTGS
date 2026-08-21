import { PrismaClient, Role, ProfileStatus, ClassStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Xóa sạch dữ liệu cũ
  await prisma.systemStat.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.classActive.deleteMany({});
  await prisma.tutorApplication.deleteMany({});
  await prisma.classRequest.deleteMany({});
  await prisma.tutorProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Tạo Tài khoản Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@huyhoang.com',
      password: passwordHash,
      fullName: 'Huy Hoàng Admin',
      phone: '0987654321',
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  // 2. Tạo Tài khoản Gia sư (Tutors)
  const tutor1User = await prisma.user.create({
    data: {
      email: 'tutor1@huyhoang.com',
      password: passwordHash,
      fullName: 'Dư Hoàng Huy',
      phone: '0327169519',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      role: Role.TEACHER,
      isVerified: true,
    },
  });
  const tutor1 = await prisma.tutorProfile.create({
    data: {
      userId: tutor1User.id,
      subjects: ['Toán học', 'Vật lý'],
      bio: 'Cựu sinh viên ĐH Sư phạm kỹ thuật TP HCM',
      experience: '4 năm kinh nghiệm dạy và ôn thi thpt toán lý hóa cấp 2,3',
      certificates: ['https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=300'],
      hourlyRate: 100000,
      status: ProfileStatus.APPROVED,
    },
  });

  const tutor2User = await prisma.user.create({
    data: {
      email: 'tutor2@huyhoang.com',
      password: passwordHash,
      fullName: 'Cao Vũ Băng Truyền',
      phone: '0923456789',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: Role.TEACHER,
      isVerified: true,
    },
  });
  const tutor2 = await prisma.tutorProfile.create({
    data: {
      userId: tutor2User.id,
      subjects: ['Tiếng Anh', 'Ngữ văn'],
      bio: 'Tốt nghiệp đại học Ngân hàng HCM , toeic 830',
      experience: '3 năm giảng dạy tại trung tâm gia sư tiếng anh',
      certificates: ['https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=300'],
      hourlyRate: 100000,
      status: ProfileStatus.APPROVED,
    },
  });

  const tutor3User = await prisma.user.create({
    data: {
      email: 'tutor3@huyhoang.com',
      password: passwordHash,
      fullName: 'Lê Hoàng Nam',
      phone: '0934567890',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: Role.TEACHER,
      isVerified: true,
    },
  });
  const tutor3 = await prisma.tutorProfile.create({
    data: {
      userId: tutor3User.id,
      subjects: ['Hóa học', 'Sinh học'],
      bio: 'Nhiệt tình, năng động, phương pháp dạy mới mẻ giúp học sinh mất gốc lấy lại căn bản.',
      experience: '2 năm làm gia sư',
      certificates: [],
      hourlyRate: 150000,
      status: ProfileStatus.PENDING,
    },
  });

  // 3. Tạo Tài khoản Học sinh (Students)
  const student1User = await prisma.user.create({
    data: {
      email: 'student1@huyhoang.com',
      password: passwordHash,
      fullName: 'Tuệ Vương',
      phone: '0945678901',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: Role.STUDENT,
      isVerified: true,
    },
  });
  const student1 = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      grade: 'Lớp 12',
      school: 'THPT Chu Văn An',
      address: 'Số 10 Tây Hồ, Hà Nội',
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student2@huyhoang.com',
      password: passwordHash,
      fullName: 'Hoàng Mai Chi',
      phone: '0956789012',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: Role.STUDENT,
      isVerified: true,
    },
  });
  const student2 = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      grade: 'Lớp 9',
      school: 'THCS Trưng Vương',
      address: 'Số 42 Hàng Bài, Hoàn Kiếm, Hà Nội',
    },
  });

  // 4. Tạo Lớp Yêu cầu (Class Requests)
  const request1 = await prisma.classRequest.create({
    data: {
      studentId: student1.id,
      title: 'Lớp Toán 12 - Ôn thi THPT Quốc Gia',
      description: 'Học Toán 12 nâng cao và luyện đề ôn thi tốt nghiệp THPT Quốc Gia cùng gia sư.',
      subject: 'Toán học',
      grade: 'Lớp 12',
      hourlyRate: 100000,
      sessionsPerWeek: 3,
      schedule: 'Thứ 2 (19:00 - 21:00), Thứ 7 (16:00 - 18:00), Chủ Nhật (14:00 - 16:00)',
      location: 'Quận Tây Hồ, Hà Nội',
      status: ClassStatus.ASSIGNED,
    },
  });

  const request2 = await prisma.classRequest.create({
    data: {
      studentId: student2.id,
      title: 'Gia sư Tiếng Anh lớp 9 luyện thi lên lớp 10',
      description: 'Luyện đề thi tuyển sinh lớp 9 lên lớp 10 công lập, tập trung ngữ pháp và kỹ năng đọc hiểu.',
      subject: 'Tiếng Anh',
      grade: 'Lớp 9',
      hourlyRate: 100000,
      sessionsPerWeek: 3,
      schedule: 'Chiều thứ 2, 4, 6 (15:00 - 17:00)',
      location: 'Quận Hoàn Kiếm, Hà Nội',
      status: ClassStatus.OPEN,
    },
  });

  const request3 = await prisma.classRequest.create({
    data: {
      studentId: student1.id,
      title: 'Lớp Vật lý 12 - Củng cố kiến thức trọng tâm',
      description: 'Học củng cố kiến thức Vật lý lớp 12 phục vụ thi đại học khối A.',
      subject: 'Vật lý',
      grade: 'Lớp 12',
      hourlyRate: 100000,
      sessionsPerWeek: 3,
      schedule: 'Thứ 4 (19:00 - 21:00), Thứ 6 (18:00 - 20:00), Thứ 7 (10:00 - 12:00)',
      location: 'Online qua Zoom',
      status: ClassStatus.ASSIGNED,
    },
  });

  // 5. Gia sư đăng ký nhận lớp
  await prisma.tutorApplication.create({
    data: {
      classRequestId: request1.id,
      tutorId: tutor1.id,
      notes: 'Chào em, anh là Dư Hoàng Huy. Anh tự tin có thể hỗ trợ em ôn thi đại học đạt điểm số mong muốn môn Toán.',
      status: ApplicationStatus.ACCEPTED,
    },
  });

  await prisma.tutorApplication.create({
    data: {
      classRequestId: request2.id,
      tutorId: tutor2.id,
      notes: 'Cô là Cao Vũ Băng Truyền, với TOEIC 830 và kinh nghiệm dạy, cô sẽ giúp con học tốt tiếng Anh.',
      status: ApplicationStatus.PENDING,
    },
  });

  // 6. Tạo Lớp học Hoạt động
  const activeClass1 = await prisma.classActive.create({
    data: {
      classRequestId: request1.id,
      studentId: student1.id,
      tutorId: tutor1.id,
      status: ClassStatus.ASSIGNED,
    },
  });

  const activeClass2 = await prisma.classActive.create({
    data: {
      classRequestId: request3.id,
      studentId: student1.id,
      tutorId: tutor1.id,
      status: ClassStatus.ASSIGNED,
    },
  });

  // 7. Tạo Đánh giá/Phản hồi
  await prisma.feedback.create({
    data: {
      studentId: student1.id,
      tutorId: tutor1.id,
      rating: 5,
      comment: 'Anh Huy giảng bài rất dễ hiểu, giúp em tiến bộ rất nhanh môn Toán và Lý!',
    },
  });

  // 8. Tạo dữ liệu doanh thu & hoạt động 7 ngày qua để vẽ biểu đồ
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    await prisma.systemStat.create({
      data: {
        date: d,
        revenue: 200000 + Math.floor(Math.random() * 500000),
        tutors: 3 + Math.floor(Math.random() * 2),
        students: 2 + Math.floor(Math.random() * 2),
        classes: 1 + Math.floor(Math.random() * 2),
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
