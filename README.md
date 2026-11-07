# TOVIO Worker Connect

Bilingual (English / Hindi) website for finding construction workers and labour agents in Kerala. Workers and employers sign in with Google or email. The app uses Next.js and Supabase.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in the values, then:

```bash
npm run dev
```

Open http://localhost:3000

## What you still configure

The code is in this repo. Sign-in, the database, photo uploads, and the admin export only work after the Supabase and Google steps in the project notes are done. Run `supabase/schema.sql` in the Supabase SQL editor before creating accounts.
