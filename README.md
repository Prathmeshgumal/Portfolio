# Prathmesh Gumal — Portfolio

My personal portfolio, built with Next.js, Tailwind CSS and shadcn/ui. Based on the
[Magic UI portfolio template](https://github.com/magicuidesign/portfolio) by Dillion Verma (MIT).

It includes a small "Get in touch" widget. Messages are saved to Postgres, I get an email
for each one, and I read them on a password-protected admin page at `/admin/inquiries`.

## Edit the content

Almost everything on the page comes from [`src/data/resume.tsx`](./src/data/resume.tsx).
Images and logos live in [`public/`](./public).

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm db:setup                # creates the database tables
pnpm dev                     # http://localhost:3000
```

## Environment variables

| Name | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon's pooled string in production) |
| `ADMIN_USERNAME` | Username for `/admin/login` |
| `ADMIN_PASSWORD_HASH` | Output of `pnpm admin:hash 'your-password'` |
| `SESSION_SECRET` | Random string, 32+ characters (`openssl rand -base64 48`) |
| `RESEND_API_KEY` | Optional — sends an email for each new inquiry |
| `NOTIFY_EMAIL` | Optional — where those emails go |

## Deploy

Import the repo on [Vercel](https://vercel.com), add the environment variables above, and deploy.
