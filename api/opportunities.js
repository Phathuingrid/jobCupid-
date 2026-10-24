// Vercel serverless function. Keeps your Adzuna keys on the server, never in the browser.
// Set ADZUNA_APP_ID and ADZUNA_APP_KEY in your hosting dashboard (see .env.example).
export default async function handler(req, res) {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return res.status(500).json({ error: 'Adzuna keys are not set' })
  const q = encodeURIComponent(String(req.query.q || 'learnership').slice(0, 60))
  const url = `https://api.adzuna.com/v1/api/jobs/za/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=15&what=${q}`
  try {
    const r = await fetch(url)
    if (!r.ok) return res.status(502).json({ error: 'Adzuna request failed' })
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.json(
      (data.results || []).map((j) => ({
        id: String(j.id),
        title: j.title,
        employer: j.company?.display_name,
        place: j.location?.display_name,
        description: j.description,
        link: j.redirect_url,
        checked: new Date().toISOString(),
      }))
    )
  } catch {
    res.status(502).json({ error: 'Could not reach Adzuna' })
  }
}
