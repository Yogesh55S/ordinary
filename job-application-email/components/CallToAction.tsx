import { Section, Row, Column, Button, Text, Link } from "@react-email/components";
import { theme } from "../data/theme";

type CallToActionProps = {
  portfolioUrl: string;
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
};

export function CallToAction({ portfolioUrl, resumeUrl, githubUrl, linkedinUrl }: CallToActionProps) {
  return (
    <Section className="cta-section" style={{ backgroundColor: theme.colors.navy900, padding: "40px 32px", textAlign: "center" }}>
      <Text
        style={{
          color: theme.colors.white,
          fontFamily: theme.font,
          fontSize: "22px",
          fontWeight: 600,
          margin: "0 0 8px 0",
        }}
      >
        Let's build something useful together.
      </Text>
      <Text
        style={{
          color: theme.colors.slate400,
          fontFamily: theme.font,
          fontSize: "14px",
          lineHeight: "1.5",
          margin: "0 0 28px 0",
        }}
      >
        Take a look at my work, or grab a copy of my resume.
      </Text>
      <Row>
        <Column className="cta-btn-col" style={{ textAlign: "center", padding: "0 8px" }}>
          <Button
            href={portfolioUrl}
            style={{
              backgroundColor: theme.colors.blue500,
              color: theme.colors.white,
              fontFamily: theme.font,
              fontSize: "14px",
              fontWeight: 700,
              padding: "14px 28px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            VIEW PORTFOLIO
          </Button>
        </Column>
        <Column className="cta-btn-col" style={{ textAlign: "center", padding: "0 8px" }}>
          <Button
            href={resumeUrl}
            style={{
              backgroundColor: "transparent",
              color: theme.colors.white,
              fontFamily: theme.font,
              fontSize: "14px",
              fontWeight: 700,
              padding: "12.5px 26.5px",
              borderRadius: "6px",
              textDecoration: "none",
              border: `1.5px solid ${theme.colors.white}`,
            }}
          >
            VIEW RESUME
          </Button>
        </Column>
      </Row>
      <Text
        style={{
          color: theme.colors.slate400,
          fontFamily: theme.font,
          fontSize: "13.5px",
          margin: "28px 0 0 0",
        }}
      >
        <Link href={githubUrl} style={{ color: theme.colors.blue400, textDecoration: "none" }}>
          GitHub
        </Link>
        {"  ·  "}
        <Link href={linkedinUrl} style={{ color: theme.colors.blue400, textDecoration: "none" }}>
          LinkedIn
        </Link>
      </Text>
    </Section>
  );
}
