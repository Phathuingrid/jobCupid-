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
- Everything saved in LocalStorage

## Limitations

- All listings are **fictional demo data** (`src/data/opportunities.js`), not real vacancies.
- Data lives only in this browser on this device. There is no account or backend.
- The readiness count does not predict hiring outcomes.

## Next

CV builder, skills quiz, work-basics lessons, and real listings with a source link and last-checked date.
