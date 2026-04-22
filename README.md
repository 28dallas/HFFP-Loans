# HFFP Loan Management System

Admin dashboard for the Home Finance & Fellowship Program disbursement model.

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Framer Motion
- TanStack Query v5
- Supabase (Auth + PostgreSQL + RLS)
- React Router v6
- React Hook Form + Zod
- date-fns

## Setup

### 1. Clone & Install

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_init.sql
   ```
3. Enable **pg_cron** extension in your Supabase project under Database → Extensions
4. Create an admin user under **Authentication → Users**

### 4. Run the App

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Badge, Button, Modal, Input, Spinner, ConfirmDialog
│   ├── layout/      # Sidebar, TopBar, PageWrapper
│   ├── users/       # UserCard, AddUserModal, EditUserModal
│   └── loans/       # LoanTable, NewLoanModal
├── pages/
│   ├── Dashboard.jsx
│   ├── UserDetail.jsx
│   └── Login.jsx
├── hooks/
│   ├── useUsers.js
│   └── useLoans.js
├── lib/
│   ├── supabase.js
│   ├── queryClient.js
│   └── utils.js
├── schemas/
│   └── formSchemas.js
└── App.jsx
```

## Features

- **Auth Guard** — All routes protected, redirects to `/login` if unauthenticated
- **Dashboard** — Stats bar, debounced search, filter tabs, responsive member grid
- **Member Profile** — Full profile with masked ID, loan history table, financial summary
- **Loan Management** — Create, view, delete loans with status tracking
- **Auto Overdue** — pg_cron job marks Active loans as Overdue daily at midnight
- **RLS** — All tables locked to authenticated users only
