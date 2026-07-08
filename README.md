# QueryFlow

A real-time Q&A dashboard where users (guests) can submit and answer questions, and admins can manage question statuses with live updates.

---

## 🔗 Live Links

- **Frontend:** https://queryflow-by-shivam.vercel.app/
- **GitHub Repository:** https://github.com/shivamgchandak/QueryFlow

---

## ✨ Features

- Guests can submit and answer questions
- Admin-only dashboard for moderation
- Question states: **Pending**, **Escalated**, **Answered**
- Escalated questions move to the top (priority-based sorting)
- Once marked **Answered**, no further answers or status changes allowed
- Real-time updates using **WebSockets**
- Fully deployed backend and frontend

---

## 🔐 Admin Login

Admin accounts are provisioned separately and are not published here. Contact the project maintainer for access, or create an admin user directly via the backend.

---

## 🛠 Tech Stack

- **Frontend:** Next.js, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, SQLAlchemy
- **Database:** PostgreSQL (hosted on Neon)
- **Realtime:** WebSockets
- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Render

---

## 🚀 Deployment

- Backend deployed on **Render**
- Frontend deployed on **Vercel**
- Database hosted on **Neon** (PostgreSQL)
- Environment variables used for API URL and database connection

---

## 📌 Notes

- Guests do not need to sign up
- Admin authentication is required only for status management
- System timestamps are used for all questions and answers
