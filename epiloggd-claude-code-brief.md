# Epiloggd — Claude Code Project Brief

Everything needed to kick this off in VS Code with Claude Code. Follow the setup steps first (one-time, ~15 min), then hand Claude Code the kickoff prompt at the bottom.

---

## 1. Final stack (Phase 1 — free tier throughout)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Postgres via **Neon** (free tier) |
| ORM | Prisma |
| Hosting | **Vercel** (free tier) |
| PWA | `next-pwa` or manual manifest + service worker |
| Book metadata | Open Library API (no key required) |
| Auth | None in Phase 1 (single local user) — added in Phase 2 |

---

## 2. One-time account setup (do this before opening Claude Code)

1. **Neon** — go to neon.tech, sign up free, create a project called `epiloggd`. Copy the connection string it gives you (looks like `postgresql://user:pass@host/dbname?sslmode=require`).
2. **Vercel** — go to vercel.com, sign up free (can link your GitHub account now, useful later for deploys).
3. **GitHub** — create an empty repo called `epiloggd` if you want version control from day one (recommended).

Nothing else needs signing up for yet — Open Library's API is keyless.

---

## 3. Local prerequisites

- Node.js 20+ installed
- VS Code with the Claude Code extension installed and signed in
- `npm` or `pnpm` (either is fine — examples below use `npm`)

---

## 4. Environment variables

Create a `.env` file (never commit this — add to `.gitignore`) with:

```
DATABASE_URL="your-neon-connection-string-here"
```

That's the only secret Phase 1 needs.

---

## 5. Target folder structure

```
epiloggd/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                 # dashboard / stats
│  ├─ library/page.tsx         # shelves view
│  ├─ book/[id]/page.tsx       # single book detail + progress log
│  ├─ api/
│  │  ├─ books/route.ts        # search Open Library, add book
│  │  ├─ progress/route.ts     # log progress entries
│  │  └─ books/[id]/route.ts   # get/update/delete a book
├─ components/
│  ├─ ShelfView.tsx
│  ├─ ProgressLogger.tsx
│  ├─ StatsDashboard.tsx
│  ├─ BookCard.tsx
├─ lib/
│  ├─ prisma.ts                # Prisma client singleton
│  ├─ openLibrary.ts           # metadata fetch helper
├─ prisma/
│  ├─ schema.prisma
├─ public/
│  ├─ manifest.json            # PWA manifest
├─ .env
├─ package.json
```

---

## 6. Prisma schema (Phase 1 scope)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Book {
  id          String   @id @default(cuid())
  title       String
  author      String
  isbn        String?
  coverUrl    String?
  pageCount   Int?
  format      String   @default("physical") // physical | ebook | audiobook
  shelf       String   @default("want_to_read") // want_to_read | reading | read | dnf
  rating      Int?     // 1-5
  moodTags    String[] @default([])
  paceTag     String?  // fast | medium | slow
  reviewText  String?
  dateAdded   DateTime @default(now())
  dateStarted DateTime?
  dateFinished DateTime?

  progressLogs ProgressLog[]
  quotes       Quote[]
}

model ProgressLog {
  id         String   @id @default(cuid())
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  timestamp  DateTime @default(now())
  pageOrPercent Int
  sessionMinutes Int?
}

model Quote {
  id      String  @id @default(cuid())
  bookId  String
  book    Book    @relation(fields: [bookId], references: [id], onDelete: Cascade)
  page    Int?
  text    String
  note    String?
}
```

(Friend/BuddyRead/User models get added in Phase 2 once auth exists — no need to build them now.)

---

## 7. Phase 1 feature checklist (what "done" looks like)

- [ ] Add a book via Open Library search (title/author/cover/page count auto-filled)
- [ ] Move a book between shelves: Want to Read / Reading / Read / DNF
- [ ] Log progress (page or %) with timestamp; see reading pace calculated from log history
- [ ] Rate a book (1–5 stars) + mood tags + pace tag on finish
- [ ] Add a written review and freeform quotes tied to a page number
- [ ] Stats dashboard: books read this year, pages read, average rating, current streak, genre/mood breakdown
- [ ] CSV/JSON export of full library
- [ ] Installable as a PWA (manifest + icons, "Add to Home Screen" works on iOS Safari)
- [ ] Deployed to Vercel, connected to Neon, working end-to-end

---

## 8. Kickoff prompt for Claude Code

Paste this into Claude Code once you've opened the empty project folder in VS Code:

```
I'm building a personal reading-progress tracker web app (Goodreads/StoryGraph-inspired).
Stack: Next.js (App Router, TypeScript), Tailwind CSS, Prisma + Postgres (Neon), deployed to Vercel, built as an installable PWA. No auth yet — single local user for Phase 1.

Please:
1. Scaffold a new Next.js + TypeScript + Tailwind project.
2. Set up Prisma with the schema I'll provide (I have it ready in prisma/schema.prisma).
3. Build the following in order, confirming with me after each:
   a. Prisma client setup + first migration against my Neon DATABASE_URL
   b. Book model CRUD API routes (app/api/books)
   c. Open Library search integration for adding books by title/author, auto-filling cover/pages
   d. Shelves view (Want to Read / Reading / Read / DNF) with drag-or-click shelf changes
   e. Book detail page with progress logging (page or % + timestamp) and a simple pace calculation
   f. Rating + mood tags + pace tag + review text on a book
   g. Quotes/highlights tied to a page number
   h. Stats dashboard (books/pages this year, average rating, streak, genre/mood breakdown)
   i. CSV/JSON export endpoint
   j. PWA manifest + icons so it installs on iOS via "Add to Home Screen"
4. Keep components small and in /components, API logic in /app/api, and shared helpers in /lib.
5. Ask me before adding any new dependency beyond what's listed above.

Let's start with step 3a — Prisma setup and first migration.
```

---

## 9. Deploying when ready

1. Push the repo to GitHub
2. Import it in Vercel (vercel.com → New Project → pick the repo)
3. Add `DATABASE_URL` as an environment variable in Vercel's project settings (same Neon connection string)
4. Vercel auto-deploys on every push to `main`

---

## 10. What's deliberately deferred to Phase 2

- Auth / accounts
- Friend connections, activity feed, buddy reads
- Privacy controls per entry
- Import from Goodreads/StoryGraph CSV
- NFC-triggered session start
- Recommendations engine
- Wrapped-style annual recap

Keeping these out of Phase 1 keeps the first build fast and avoids designing an auth/friends system before you know if the core tracker feels right to use day-to-day.
