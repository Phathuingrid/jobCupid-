// Transparent skill detection: a skill counts as "mentioned" if any of its words appear in the text.
export const SKILLS = {
  Communication: ['communication', 'communicate', 'verbal', 'written skills'],
  'Computer basics': ['computer literate', 'computer skills', 'ms office', 'microsoft office'],
  Teamwork: ['team player', 'teamwork', 'work in a team', 'collaborat'],
  Excel: ['excel', 'spreadsheet'],
  'Problem solving': ['problem solving', 'problem-solving', 'analytical', 'troubleshoot'],
  'Social media': ['social media', 'instagram', 'tiktok', 'facebook'],
  Writing: ['copywriting', 'content writing', 'writing skills', 'report writing'],
  Creativity: ['creative', 'content creation'],
  'Customer care': ['customer service', 'customer care', 'client service', 'call cent'],
}
export const allSkills = Object.keys(SKILLS)
export const skillsIn = (text = '') => {
  const t = text.toLowerCase()
  return allSkills.filter((s) => SKILLS[s].some((w) => t.includes(w)))
}
// APIs rarely list required documents, so users get a standard checklist they can tick.
export const DEFAULT_DOCS = ['CV', 'Certified ID copy', 'Matric certificate', 'Cover letter']
