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
  JavaScript: ['javascript', 'java script'],
  HTML: ['html'],
  CSS: ['css', 'cascading style sheets'],
  React: ['react.js', 'reactjs'],
  TypeScript: ['typescript', 'type script'],
  GitHub: ['github', 'git hub'],
}
export const allSkills = Object.keys(SKILLS)
const TECH_SKILLS = {
  JavaScript: /\bjava\s?script\b/i,
  HTML: /\bhtml\b/i,
  CSS: /\bcss\b/i,
  React: /\breact(?:\.js)?\b|\breactjs\b/i,
  TypeScript: /\btype\s?script\b/i,
  GitHub: /\bgithub\b/i,
}
export const skillsIn = (text = '') =>
  allSkills.filter((skill) => TECH_SKILLS[skill]
    ? TECH_SKILLS[skill].test(text)
    : SKILLS[skill].some((word) => text.toLowerCase().includes(word)))
// APIs rarely list required documents, so users get a standard checklist they can tick.
export const DEFAULT_DOCS = ['CV', 'Certified ID copy', 'Matric certificate', 'Cover letter']
