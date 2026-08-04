import { Section, Text } from "@react-email/components";
import { theme } from "../data/theme";

type IntroductionProps = {
  hrName: string;
  jobTitle: string;
  companyName: string;
  whyCompany: string;
  relevantSkills: string;
  developerName: string;
  developerRole: string;
};

export function Introduction({
  hrName,
  jobTitle,
  companyName,
  whyCompany,
  relevantSkills,
  developerName,
  developerRole,
}: IntroductionProps) {
  const bodyStyle = {
    color: theme.colors.slate600,
    fontFamily: theme.font,
    fontSize: "15.5px",
    lineHeight: "1.6",
    margin: "0 0 14px 0",
  };

  return (
    <Section className="content-section" style={{ backgroundColor: theme.colors.white, padding: "36px 32px 8px 32px" }}>
      <Text style={bodyStyle}>Hi {hrName},</Text>
      <Text style={bodyStyle}>
        I'm {developerName}, a {developerRole}, and I'm reaching out regarding the {jobTitle}{" "}
        opportunity at {companyName}.
      </Text>
      <Text style={bodyStyle}>{whyCompany}</Text>
      <Text style={{ ...bodyStyle, margin: 0 }}>
        My experience with {relevantSkills} lines up closely with what this role needs, and I
        enjoy working across the complete product lifecycle — from building polished interfaces
        to APIs, databases, authentication, integrations and deployment.
      </Text>
    </Section>
  );
}
