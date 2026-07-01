# PharmaLens

**Professional Drug Intelligence Platform**

A fast, professional reference tool for searching brand names by generic medicine ingredient — built for healthcare professionals, doctors, pharmacists, and pharmacy students in the Pakistan market.

## Features

- 🔍 Search brand names by generic ingredient
- 📊 RAG-powered drug data pipeline
- 🧠 Quiz mode for pharmacology practice
- 📋 Data source transparency
- ⚡ Built with Next.js 15 + Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL via Prisma ORM
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and other values

# Push DB schema
npx prisma db push

# Seed sample data
npx prisma db seed

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to Vercel in one click. Set your environment variables in the Vercel dashboard.

## Disclaimer

This tool is for professional reference only and is not a substitute for clinical judgment, prescribing guidance, or official regulatory sources.
