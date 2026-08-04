import { Section, Text, Link } from "@react-email/components";
import { theme } from "../data/theme";

type FooterProps = {
  name: string;
  role: string;
  contactEmail: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
};

export function Footer({ name, role, contactEmail, portfolioUrl, githubUrl, linkedinUrl }: FooterProps) {
  const linkStyle = {
    color: theme.colors.slate600,
    textDecoration: "none",
  };

  return (
    <Section className="footer-section" style={{ backgroundColor: theme.colors.slate50, padding: "24px 32px", textAlign: "center" }}>
      <Text
        style={{
          color: theme.colors.slate900,
          fontFamily: theme.font,
          fontSize: "13.5px",
          fontWeight: 600,
          margin: "0 0 6px 0",
        }}
      >
        {name} — {role}
      </Text>
      <Text style={{ fontFamily: theme.font, fontSize: "12.5px", margin: 0 }}>
        <Link href={`mailto:${contactEmail}`} style={linkStyle}>
          Email
        </Link>
        {"  ·  "}
        <Link href={portfolioUrl} style={linkStyle}>
          Portfolio
        </Link>
        {"  ·  "}
        <Link href={githubUrl} style={linkStyle}>
          GitHub
        </Link>
        {"  ·  "}
        <Link href={linkedinUrl} style={linkStyle}>
          LinkedIn
        </Link>
      </Text>
    </Section>
  );
}
