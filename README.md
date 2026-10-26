# JobCupid

A mobile-friendly opportunity organiser for young South Africans. Built for the FNB hackathon challenge of helping young people with limited work experience find opportunities that suit their qualifications and skills.

**The journey:** explore South African practice examples, add and track opportunities you find, build practical proof through Cupid Quest, and use Cupid Bridge to turn skill gaps into learning and project steps.

## Run it

```bash
npm install
npm run dev
```

Open the local URL it prints. Build for deployment with `npm run build` (output in `dist/`, works on Vercel or Netlify).

## Features

- Opportunity feed with search and type filters
- Detail view with eligibility, closing date and a requirements checklist
- Readiness count: ticked documents + matched skills (a plain overlap, no AI)
- Application tracker: Saved, Applied, Interview, Closed
- Add opportunities you find online, with a link, closing date and description
- Detect skills in opportunity descriptions using a transparent word list
- Save listing snapshots so tracked opportunities remain available
- Download a readable HTML document of your saved list and restore your list and progress from it (older JSON backups are also supported)
- Opportunity tracking, profile skills, and quest evidence saved in LocalStorage
- **Cupid Quest:** complete a small practical challenge for a skill and save a link or note as evidence.
- **Cupid Bridge:** get a per-skill Learn, Build, Demonstrate and Progress plan for a target opportunity.
- **Cupid Circle:** five shared group chats with email-and-password accounts, nicknames, personal-information warnings and message reporting, powered by Supabase.

Quest evidence and learning progress are self-reported and stored in this browser. They count toward readiness, which is a planning aid and not a hiring prediction.

## Opportunity examples

The home feed includes ten static South African practice examples in `src/data/sample-opportunities.js`. They do not represent real or current vacancies; employers, dates and pay are not claimed. Use **Add** to save a real opportunity you have found, and verify its details on the employer's official page before applying. No paid listings API or API credentials are required.

## Set up Cupid Circle

Cupid Circle uses Supabase email/password Auth and Realtime; it is a shared chat, not a local mock. Each member signs in with an email address and password and chooses a chat nickname.

1. In Supabase, enable the **Email** provider under **Authentication → Sign-in / Providers** and disable **Anonymous Sign-Ins**. Decide whether to require email confirmation; when enabled, new members must confirm their email before signing in.
2. Run the entire [`supabase/circle.sql`](./supabase/circle.sql) file in the Supabase SQL Editor. It migrates existing room names, adds nicknames, and configures the five chat groups, report table, email-account-only row-level security policies, and Realtime publication.
3. For local development, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the ignored `.env.local` file from your Supabase project settings. For the deployed app, add both variables in Vercel **Project Settings → Environment Variables** with the **Production** environment selected, then redeploy so Vite builds them into the site. The publishable key is intended for browser use; never put a secret/service-role key in a `VITE_` variable.
4. Restart the local dev server after changing `.env.local`. If email confirmation is enabled, add your local and deployed app URLs to Supabase **Authentication → URL Configuration**.

Only authenticated email accounts can read and post in rooms. Chat nicknames are saved to the member's Supabase account. Reports are stored for review, but this starter app does not include a moderator dashboard, automated moderation, age assurance, blocking, or rate limiting. Never collect or post sensitive personal information in chat.

## Limitations

- The ten feed entries are examples only, not real job ads. User-added opportunities should be checked on the employer's official page.
- Skills and documents are suggestions; real listings may have additional requirements.
- Opportunity tracking, skills, and quest evidence live in this browser on this device. Circle uses the configured Supabase project and requires an email account.
- Cupid Circle messages and reports live in your configured Supabase project; a moderator must review reports.
- The readiness count does not predict hiring outcomes.

## Next

CV builder, skills quiz, moderator tools, and stronger community safeguards.
