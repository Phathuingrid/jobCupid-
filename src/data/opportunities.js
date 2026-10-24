// DEMO DATA ONLY. These listings and employers are fictional sample data.
const o = (id, title, type, employer, place, closes, pay, eligibility, skills, requirements) => ({
  id, title, type, employer, place, closes, pay, eligibility, skills, requirements,
})

export const opportunities = [
  o(1, 'Customer Service Learnership', 'Learnership', 'Sample Telecom', 'Johannesburg', '2026-12-05', 'Monthly stipend', 'Matric, aged 18 to 29', ['Communication', 'Computer basics', 'Teamwork'], ['CV', 'Certified ID copy', 'Matric certificate']),
  o(2, 'Finance Graduate Programme', 'Graduate programme', 'Demo Bank', 'Sandton', '2026-11-20', 'Graduate salary', 'Finance or accounting degree', ['Excel', 'Problem solving', 'Communication'], ['CV', 'Academic transcript', 'Certified ID copy', 'Cover letter']),
  o(3, 'Digital Marketing Intern', 'Internship', 'Sample Media Co', 'Remote', '2026-11-30', 'Monthly stipend', 'Studying or recently completed a diploma', ['Social media', 'Writing', 'Creativity'], ['CV', 'Portfolio link', 'Cover letter']),
  o(4, 'Retail Sales Assistant', 'Entry-level', 'Demo Retail Group', 'Pretoria', '2026-11-12', 'Hourly wage', 'No experience needed', ['Communication', 'Teamwork', 'Customer care'], ['CV', 'Certified ID copy']),
  o(5, 'IT Support Learnership', 'Learnership', 'Sample Tech Hub', 'Midrand', '2026-12-15', 'Monthly stipend', 'Matric with maths or IT', ['Computer basics', 'Problem solving', 'Teamwork'], ['CV', 'Matric certificate', 'Certified ID copy']),
  o(6, 'Data Analyst Intern', 'Internship', 'Demo Insights', 'Cape Town', '2026-11-28', 'Monthly stipend', 'Studying towards a degree', ['Excel', 'Problem solving', 'Writing'], ['CV', 'Academic transcript', 'Cover letter']),
  o(7, 'Admin Clerk Trainee', 'Entry-level', 'Sample Logistics', 'Durban', '2026-12-01', 'Monthly salary', 'Matric', ['Computer basics', 'Excel', 'Customer care'], ['CV', 'Matric certificate', 'Certified ID copy']),
  o(8, 'Creative Content Programme', 'Internship', 'Demo Studio', 'Johannesburg', '2026-10-31', 'Monthly stipend', 'Portfolio of any creative work', ['Creativity', 'Social media', 'Teamwork'], ['CV', 'Portfolio link']),
]

export const allSkills = [...new Set(opportunities.flatMap((x) => x.skills))].sort()
