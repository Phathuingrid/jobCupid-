import { skillsIn, DEFAULT_DOCS } from './skills'

const QUERIES = ['learnership', 'internship', 'graduate programme', 'entry level']

const guessType = (t) =>
  /learnership/i.test(t) ? 'Learnership' : /intern/i.test(t) ? 'Internship' : /graduate|trainee/i.test(t) ? 'Graduate programme' : 'Entry-level'

export const fromApi = (j) => ({
  id: 'live-' + j.id,
  title: j.title,
  type: guessType(j.title + ' ' + (j.description || '')),
  employer: j.employer || 'Employer not listed',
  place: j.place || 'South Africa',
  closes: null,
  pay: 'See listing',
  eligibility: 'See the official listing',
  skills: skillsIn(j.title + ' ' + (j.description || '')),
  requirements: DEFAULT_DOCS,
  description: j.description || '',
  link: j.link,
  checked: j.checked,
  live: true,
})

export async function fetchLive() {
  const results = await Promise.all(
    QUERIES.map(async (q) => {
      const r = await fetch('/api/opportunities?q=' + encodeURIComponent(q))
      if (!r.ok) throw new Error('Live listings unavailable')
      return r.json()
    })
  )
  const seen = new Set()
  return results.flat().filter((j) => !seen.has(j.id) && seen.add(j.id)).map(fromApi)
}
