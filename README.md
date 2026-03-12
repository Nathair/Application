# Eventify - Event Management System

A full-stack web application for creating, discovering, and managing events. Built with a focus on clean UI, robust validation, and seamless user experience.

---
**🌐 Live Demo:** [https://eventify.nathair.dev](https://eventify.nathair.dev)
---
**🌐 API Documentation:** [https://eventify.nathair.dev/api/docs](https://eventify.nathair.dev/api/docs)
---
**🌐 Storybook React:** [https://storybook-eventify.nathair.dev](https://storybook-eventify.nathair.dev)
---
---

## 🚀 Features

- **User Authentication**: Secure Login and Registration with JWT (Access & Refresh Token rotation).
- **Event Discovery**: Search and filter public events by title, description, date range, or status (Active/Past).
- **My Events Calendar**: Personalized dashboard to manage your events in Month, Week, or List views.
- **Role-based Filtering**: Easily switch between events you organized and those you joined.
- **Dynamic Event Creation**: 
    - Real-time capacity validation with custom +/- controls.
    - "No Limit" indicators for unlimited events.
    - Automated "Finished" status logic based on event start time.
    - Restricted editing and joining for past events.
- **Tagging System**: Multi-tag classification (up to 5 tags) with case-insensitive search and filtering.
- **AI Assistant**: Natural language question answering about events, attendees, and schedule using RAG-like context provided by the backend.
- **UI Component Library (Storybook)**: Fully isolated and documented UI components (Button, Input, Modal, Textarea) with multiple states and variants.
- **Responsive Design**: Premium dark/light themes with glassmorphism and smooth animations.

## 🛠 Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Yup](https://github.com/jquense/yup)
- **Dates**: [date-fns](https://date-fns.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Documentation**: [Storybook](https://storybook.js.org/)

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- **AI Integration**: OpenAI-compatible API (Groq/Mistral)
- **Documentation**: [Swagger](https://swagger.io/)

---

## 📂 Project Structure

```text
├── frontend/             # React (Vite) application
│   ├── src/
│   │   ├── api/          # Axios interceptors for token refresh
│   │   ├── components/   # Reusable UI components + Storybook stories
│   │   ├── pages/        # Main application views
│   │   ├── store/        # Zustand state (Auth, Settings, Assistant)
│   │   └── types/        # TypeScript interfaces
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/         # Security and JWT strategies
│   │   ├── events/       # Event logic and DTOs
│   │   ├── prisma/       # Database service and seeders
│   │   └── users/        # User management
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v20+)
- PostgreSQL database

### 1. Database Setup
Create a PostgreSQL database and copy the connection string.

### 2. Backend Configuration
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventify"
```
Run migrations and generate Prisma client:
```bash
npx prisma migrate dev
npx prisma generate
```
(Optional) Seed the database with test data (run in backend folder):
```bash
npx prisma db seed
```

### 3. Frontend Configuration
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm run start:dev
```
API Documentation will be available at: `http://localhost:3000/api/docs`

### Start Frontend
```bash
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173`

### Run Storybook
```bash
cd frontend
npm run storybook
```
Open Storybook at: `http://localhost:6006`

---

## 🐋 Docker Run

To run the entire system (Frontend, Backend, Database) with one command:

1. Ensure Docker is running.
2. Run in the root directory:
   ```
   docker-compose up -d
   ```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Database Admin (Adminer)**: http://localhost:8080 (Server: `db`, Username: `user`, Password: `password`, Database: `eventify`)

---
