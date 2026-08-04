import { writeFileSync, mkdirSync } from "node:fs";
import { render } from "@react-email/components";
import JobApplicationEmail from "../emails/JobApplication";
import { samplePersonalization, type Personalization } from "../data/sample";

const TOKENS: Record<keyof Personalization, string> = {
  hrName: "{{HR_NAME}}",
  companyName: "{{COMPANY_NAME}}",
  jobTitle: "{{JOB_TITLE}}",
  whyCompany: "{{WHY_COMPANY}}",
  relevantSkills: "{{RELEVANT_SKILLS}}",
  portfolioUrl: "{{PORTFOLIO_URL}}",
  githubUrl: "{{GITHUB_URL}}",
  linkedinUrl: "{{LINKEDIN_URL}}",
  resumeUrl: "{{RESUME_URL}}",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function main() {
  let html = await render(JobApplicationEmail({ personalization: samplePersonalization }));

  // Longest sample value first: some values are prefixes of others (e.g. resumeUrl embeds
  // the exact githubUrl string), so tokenizing a shorter value first would corrupt the
  // longer one mid-replacement. Processing longest-first avoids that collision generically.
  const orderedKeys = (Object.keys(TOKENS) as (keyof Personalization)[]).sort(
    (a, b) => samplePersonalization[b].length - samplePersonalization[a].length
  );

  for (const key of orderedKeys) {
    const sampleValue = samplePersonalization[key];
    const token = TOKENS[key];
    // Text content is HTML-escaped by React; URLs in href attributes are not.
    html = html.split(escapeHtml(sampleValue)).join(token);
    html = html.split(sampleValue).join(token);
  }

  mkdirSync("dist", { recursive: true });
  writeFileSync("dist/template.html", html, "utf-8");

  const remainingTokens = Object.values(TOKENS).filter((token) => html.includes(token));
  console.log(`Exported dist/template.html (${html.length} chars)`);
  console.log(`Tokens present: ${remainingTokens.length}/${Object.keys(TOKENS).length}`);
  if (remainingTokens.length < Object.keys(TOKENS).length) {
    const missing = Object.entries(TOKENS)
      .filter(([, token]) => !html.includes(token))
      .map(([key]) => key);
    console.warn(`WARNING: these tokens did not appear in the output — check for text collisions: ${missing.join(", ")}`);
  }
}

main();
