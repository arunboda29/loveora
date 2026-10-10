# Loveora

A playful website for multilingual pickup lines, love prompts, journaling, and a shared kindness wall. It runs locally with the included Node server and can be hosted on Vercel with Supabase for online accounts and community posts.

## Run locally

1. Install Node.js 20 or newer.
2. Open a terminal in this folder.
3. Run `npm start`.
4. Open the exact local address printed by the server. If port 4173 is already in use, Loveora tries the next available port.

Local accounts and posts are stored in `loveora-data.json`. That file is private local data and is excluded from Git.

## Free online hosting setup

This setup uses Vercel Hobby for the site and serverless API, plus a Supabase Free project for account authentication and community data. Free services have limits: Supabase may pause a project after a week of low activity, and Vercel Hobby is for personal, non-commercial use. Review each provider's current terms and limits before inviting people.

1. Create a Supabase project and open its SQL Editor.
2. Run the complete schema in `supabase/schema.sql` once.
3. In Supabase project settings, copy the Project URL and the server-only `service_role` key. Never put the service role key in browser code or commit it to Git.
4. Connect the Loveora repository to Vercel. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as server environment variables for Production and Preview. The `.env.example` file shows the names; it is not a real credentials file.
5. Set Supabase Authentication's site URL to the Vercel production URL and allow that URL in its redirect URL list. Email confirmation may be enabled; in that case new members confirm their email before signing in.
6. Deploy and check account creation, sign-in, a community post, heart, and report from the deployed URL.

A deployment starts with a fresh hosted database. Local `loveora-data.json` is not uploaded or migrated. User accounts and posts created after deployment live in Supabase.

## Safety and moderation

The community wall is public to Loveora members. Do not post private contact details. The site supports reporting, but a real public community still needs an active moderator, a privacy policy, terms, and account deletion/data export before broad promotion. This project is a learning and community experience, not counseling or emergency support.
