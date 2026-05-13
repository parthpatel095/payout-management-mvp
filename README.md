# PayoutOS — Payout Management MVP

An internal payout management system with role-based access control, payout workflow management, and full audit trail.

---

## Credentials

| Role    | Email               | Password |
|---------|---------------------|----------|
| OPS     | ops@demo.com        | ops123   |
| Finance | finance@demo.com    | fin123   |

---

## Tech Stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, Zustand, Axios, React Hook Form, Zod  
**Backend:** Express.js, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Zod  
**Database:** MongoDB Atlas

---

## Project Structure

```
payout-management-mvp/
├── backend/         Express + TypeScript API
└── frontend/        Next.js 15 App
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

---

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd payout-management-mvp
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/payout-mvp
JWT_SECRET=change_this_to_something_secure
JWT_EXPIRES_IN=7d
```

**Run seed script** (creates users, vendors, sample payouts):

```bash
npm run seed
```

**Start the backend:**

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Start the frontend:**

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## API Reference

### Auth
| Method | Endpoint       | Description  |
|--------|----------------|--------------|
| POST   | /api/auth/login | Login        |

### Vendors
| Method | Endpoint       | Auth | Role |
|--------|----------------|------|------|
| GET    | /api/vendors   | ✅   | Any  |
| POST   | /api/vendors   | ✅   | OPS  |

### Payouts
| Method | Endpoint                    | Auth | Role    |
|--------|-----------------------------|------|---------|
| GET    | /api/payouts                | ✅   | Any     |
| POST   | /api/payouts                | ✅   | OPS     |
| GET    | /api/payouts/:id            | ✅   | Any     |
| POST   | /api/payouts/:id/submit     | ✅   | OPS     |
| POST   | /api/payouts/:id/approve    | ✅   | FINANCE |
| POST   | /api/payouts/:id/reject     | ✅   | FINANCE |

---

## Payout Status Flow

```
Draft → Submitted → Approved
                 → Rejected
```

All other transitions are blocked on the backend.

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Set **Root Directory** to `backend`
4. Set **Build Command:** `npm install && npm run build`
5. Set **Start Command:** `npm start`
6. Add environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `FRONTEND_URL=https://your-frontend.vercel.app`

### Frontend → Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
5. Deploy

---

## Role Permissions Summary

| Feature              | OPS | FINANCE |
|----------------------|-----|---------|
| View vendors         | ✅  | ✅      |
| Add vendors          | ✅  | ❌      |
| Create payout drafts | ✅  | ❌      |
| Submit payouts       | ✅  | ❌      |
| View payouts         | ✅  | ✅      |
| Approve payouts      | ❌  | ✅      |
| Reject payouts       | ❌  | ✅      |
| View audit trail     | ✅  | ✅      |
