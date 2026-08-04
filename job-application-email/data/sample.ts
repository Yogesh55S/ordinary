/**
 * Sample personalization values used only for local preview/testing.
 * The export script (scripts/export-template.ts) swaps these exact values
 * back to literal {{TOKEN}} placeholders in the final shipped HTML.
 */
export type Personalization = {
  hrName: string;
  companyName: string;
  jobTitle: string;
  whyCompany: string;
  relevantSkills: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
};

export const samplePersonalization: Personalization = {
  hrName: "Priya",
  companyName: "Acme Technologies",
  jobTitle: "Senior Full-Stack Engineer",
  whyCompany:
    "I've been following Acme's work on scalable fintech infrastructure and would love to contribute to that mission.",
  relevantSkills: "React, Next.js, Node.js, REST APIs, Supabase",
  portfolioUrl: "https://portfolio-pink-nu-30.vercel.app/",
  githubUrl: "https://github.com/Yogesh55S",
  linkedinUrl: "https://www.linkedin.com/in/yogesh-kumar-983840226/",
  resumeUrl: "https://github.com/Yogesh55S/Yogesh55S/blob/df1ca00c2929ec29e090b3f1de2f170507d59876/Yogesh_Resume%20(2).pdf",
};
