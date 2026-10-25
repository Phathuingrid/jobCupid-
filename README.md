# JobCupid

A mobile-friendly opportunity organiser for young South Africans. Built for the FNB hackathon challenge of helping young people with limited work experience find opportunities that suit their qualifications and skills.

**The journey:** browse live listings, save and track opportunities, build practical proof through Cupid Quest, and use Cupid Bridge to turn skill gaps into learning and project steps.

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
- Download your saved list as JSON and restore it on another device
- Opportunity tracking, profile skills, and quest evidence saved in LocalStorage
- **Cupid Quest:** complete a small practical challenge for a skill and save a link or note as evidence.
- **Cupid Bridge:** get a per-skill Learn, Build, Demonstrate and Progress plan for a target opportunity.
- **Cupid Circle:** real-time topic rooms with email sign-in, personal-information warnings and message reporting, powered by Supabase.

Quest evidence and learning progress are self-reported and stored in this browser. They count toward readiness, which is a planning aid and not a hiring prediction.

## Going live with real listings

1. Create an Adzuna developer account and get your App ID and App Key.
2. Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` as environment variables in your Vercel project. The API keys are only used by the serverless function in `api/opportunities.js`.
3. For local API testing, add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to your ignored `.env.local` file and run `npx vercel dev` instead of `npm run dev`.

Without the API configuration, the app shows no job listings rather than filling the feed with fictional vacancies. Check Adzuna's terms for attribution and usage limits.

## Set up Cupid Circle

Cupid Circle uses Supabase Auth and Realtime; it is not a local mock chat.

1. Create a Supabase project and enable email sign-in (one-time links). In **Authentication → URL Configuration**, set the Site URL to `http://localhost:5173` for local development and add both `http://localhost:5173` and `http://127.0.0.1:5173` to the Redirect URLs allowlist. Add your deployed site URL before production.
2. Run [`supabase/circle.sql`](./supabase/circle.sql) in the Supabase SQL Editor. This creates the chat/report tables, row-level security policies, and Realtime publication.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the ignored `.env.local` file from your Supabase project settings. The publishable key is intended for browser use; never put a secret/service-role key in a `VITE_` variable.
4. Restart the dev server so Vite reads the new settings. Local API testing with both Adzuna and Circle can use `npx vercel dev`.

Only signed-in members can read and post in rooms. Reports are stored for review, but this starter app does not include a moderator dashboard, automated moderation, age assurance, blocking, or rate limiting. Do not open Circle to the public until you have a moderation and safeguarding process appropriate for your users. Never collect or post sensitive personal information in chat.

## Limitations

- Live listings come from Adzuna and may be incomplete or out of date. Always verify details on the employer's official page.
- Skills and documents are suggestions; real listings may have additional requirements.
- Opportunity tracking, skills, and quest evidence live in this browser on this device. Circle uses the configured Supabase project and requires an account.
- Cupid Circle messages and reports live in your configured Supabase project; a moderator must review reports.
- The readiness count does not predict hiring outcomes.

## Next

CV builder, skills quiz, moderator tools, and stronger community safeguards.
