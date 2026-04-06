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

## Deploy on Cloudflare

This project is configured for deployment on [Cloudflare Workers](https://workers.cloudflare.com/) using [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

```bash
# Build for Cloudflare
npx opennextjs-cloudflare build

# Deploy
npx wrangler deploy
```

Before deploying, make sure to:
1. Create the D1 database: `npx wrangler d1 create inkwell-db`
2. Update `database_id` in `wrangler.toml` with the ID from step 1
3. Run the migration: `npx wrangler d1 execute inkwell-db --file=migrations/0001_init.sql`
4. Create the R2 bucket: `npx wrangler r2 bucket create inkwell-files`
5. Set the auth secret: `npx wrangler secret put NEXTAUTH_SECRET`

Check out the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) for more details.
