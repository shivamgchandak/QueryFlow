# QueryFlow

A real-time Q&A dashboard where users (guests) can submit and answer questions, and admins can manage question statuses with live updates.

---

## 🔗 Live Links

- **Frontend:** https://hemut-qna-by-shivam.vercel.app/
- **Backend (API Docs):** https://hemut-qna-backend.onrender.com/docs
- **GitHub Repository:** https://github.com/shivamgchandak/Hemut-QnA

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
- **Realtime:** WebSockets
- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Render

---

## 🚀 Deployment

- Backend deployed on **Render**
- Frontend deployed on **Vercel**
- Environment variables used for API and WebSocket URLs

---

## 📌 Notes

- Guests do not need to sign up
- Admin authentication is required only for status management
- System timestamps are used for all questions and answers
