# 🎓 TTGS - Tutor Finding & Classroom Management Platform
> **A modern, full-stack ed-tech platform connecting tutors and students with automated matching, online exam rooms, salary tracking, and real-time notifications.**

[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

🌐 **Live Demo:** [https://giasuhoanghuy.netlify.app](https://giasuhoanghuy.netlify.app)  
📦 **Repository:** [https://github.com/HuyIT3/TTGS](https://github.com/HuyIT3/TTGS)

---

## 📌 Overview

**TTGS** is a complete end-to-end web platform designed to streamline the tutoring lifecycle for **Students**, **Tutors (Teachers)**, and **Administrators**. It solves core problems in traditional tutoring platforms such as manual matching, lack of study materials management, and delayed payment reconciliations.

```mermaid
graph TD
    Student[👨‍🎓 Student] -->|Create Request| Matching[🎯 Matching Engine]
    Tutor[👩‍🏫 Tutor] -->|Submit Application| Matching
    Admin[🛡️ Admin] -->|Review & Approve| Matching
    Matching -->|Establish| Class[📚 Active Classroom]
    Class --> Materials[📁 Materials Room & PDF Cache]
    Class --> Exam[📝 Online Exam Center]
    Class --> Attendance[📅 Attendance & Schedule]
    Class --> Salary[💰 Salary & Leave Tracker]
```

---

## ✨ Key Features & Technical Highlights

### 1. 🎯 Matching Engine & Class Request Lifecycle
- **Students** post customizable tutoring requests (subject, grade, hourly budget, weekly sessions, target location/online).
- **Tutors** browse open requests and submit applications with custom proposals.
- **Admin approval workflow** guarantees quality control and fraud prevention before class activation.

### 2. 🔐 Robust Authentication & Role-Based Access Control (RBAC)
- **Multi-Role authorization** (`ADMIN`, `TEACHER`, `STUDENT`) enforced by NestJS `RolesGuard` and JWT token validation.
- **Email OTP Verification:** Built with `Nodemailer` to support account activation and secure password recovery.

### 3. 📝 Interactive Exam Center & Dynamic Testing
- Tutors construct custom online assessments supporting Multiple Choice (MCQ), True/False, and Short Answer formats.
- Real-time countdown timer, immediate automatic grading, and instant score telemetry.

### 4. 📁 Materials Room with Client-Side Blob Persistence
- **Problem Solved:** Temporary `blob:` URLs generated during PDF uploads expire across browser sessions and page reloads.
- **Solution:** Engineered a client-side storage layer using **Browser-native IndexedDB** to serialize and persist PDF Blobs locally, ensuring smooth document viewing without repeated network payload penalties.

### 5. 💰 Salary, Attendance & Leave Management
- Transparent monthly payroll generation based on logged sessions.
- Status update webhooks pushing real-time notifications to tutors upon payment confirmation.

---

## 🛠️ Architecture & Tech Stack

```
TTGS/
├── backend/                  # NestJS RESTful API & Business Logic
│   ├── src/
│   │   ├── auth/             # JWT, Local strategy, Guards & Decorators
│   │   ├── classes/          # Class requests, applications, active classes
│   │   ├── users/            # Profiles (Admin, Tutor, Student)
│   │   ├── salary/           # Monthly tutor compensation & payroll
│   │   ├── notifications/    # In-app notification engine
│   │   ├── otp/              # Nodemailer OTP generator & validator
│   │   ├── stats/            # Dashboard analytics & revenue telemetry
│   │   └── prisma/           # Prisma client module
│   └── prisma/schema.prisma  # Relational schema (PostgreSQL)
│
├── frontend/                 # Single Page Application (React + Vite)
│   ├── src/
│   │   ├── components/       # MaterialsView, ExamHall, SalaryView, etc.
│   │   ├── pages/            # Role-specific Dashboards, Auth, Landing
│   │   ├── context/          # Global Auth & State Providers
│   │   └── hooks/            # Custom React hooks
│
└── docker-compose.yml        # Multi-container orchestration (DB, API, Client)
```

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, TailwindCSS, Vite, Lucide Icons, Chart.js |
| **Backend** | NestJS 10, TypeScript, Express, Class-Validator, Passport-JWT |
| **Database & ORM** | PostgreSQL 15, Prisma ORM |
| **DevOps & Container** | Docker, Docker Compose, Nginx |
| **Utilities** | Nodemailer, IndexedDB (idb-keyval), BCrypt |

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*OR*
- [Node.js](https://nodejs.org/) (v18+) & [PostgreSQL](https://www.postgresql.org/) (v14+)

---

### Option 1: Run with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HuyIT3/TTGS.git
   cd TTGS
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application:**
   - **Frontend:** `http://localhost` (Port 80)
   - **Backend API:** `http://localhost:3000`
   - **PostgreSQL Database:** `localhost:5433`

---

### Option 2: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables in backend/.env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/huyhoang_tutor?schema=public"
# JWT_SECRET="your_jwt_secret_key"
# PORT=3000

# Push schema to PostgreSQL database
npx prisma db push

# Start backend dev server
npm run start:dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` to start exploring!

---

## 📊 Database Schema Summary

The relational database is designed with high data integrity and cascading constraints:
- **`User` / `TutorProfile` / `StudentProfile`**: Separation of authentication and domain roles.
- **`ClassRequest` / `TutorApplication` / `ClassActive`**: State-machine driven matching workflow.
- **`SalaryPayment` / `SystemStat`**: Financial and operational reporting.
- **`Notification` / `Otp`**: Ephemeral messaging & security lifecycles.

---

## 👨‍💻 Author

**Dư Hoàng Huy**
- **University:** Ho Chi Minh City University of Technology and Engineering (HCMUTE)
- **Email:** [huykenkva123@gmail.com](mailto:huykenkva123@gmail.com)
- **GitHub:** [@HuyIT3](https://github.com/HuyIT3)
- **Portfolio / Demo:** [giasuhoanghuy.netlify.app](https://giasuhoanghuy.netlify.app)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
