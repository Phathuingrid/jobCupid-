# JobCupid

A mobile-friendly opportunity organiser for young South Africans. Built for the FNB hackathon challenge of helping young people with limited work experience find opportunities that suit their qualifications and skills.

**The journey:** browse demo listings, open one, tick off the documents you've prepared, pick your skills, see how ready you are, save it, and track it from Saved to Applied to Interview.

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
- Everything saved in LocalStorage

## Going live with real listings

1. Create an Adzuna developer account and get your App ID and App Key.
2. Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` as environment variables in your Vercel project. The API keys are only used by the serverless function in `api/opportunities.js`.
3. For local API testing, copy `.env.example` to `.env.local` and run `npx vercel dev` instead of `npm run dev`.

Without the API configuration, the app uses fictional demo listings. Check Adzuna's terms for attribution and usage limits.

## Limitations

- Demo listings are **fictional** (`src/data/opportunities.js`), not real vacancies. Live listings come from Adzuna and may be incomplete or out of date.
- Skills and documents are suggestions; real listings may have additional requirements.
- Data lives only in this browser on this device. There is no account or backend.
- The readiness count does not predict hiring outcomes.

## Next

CV builder, skills quiz, and work-basics lessons.
