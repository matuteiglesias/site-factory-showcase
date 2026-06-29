This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This app is deployment-ready only with a hosted Postgres-compatible database. The selected path is Neon Postgres. See `docs/DEPLOYMENT.md` for the required environment contract, migration commands, deploy checklist, smoke behavior, and admin protection notes.

At minimum, set `NEXT_PUBLIC_BASE_URL`, `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_SHOW_OPS_LINK` before exercising order routes in a deployed environment. Local development also requires a disposable Postgres database; use a Neon development branch or the local container instructions in `docs/DEPLOYMENT.md`.
