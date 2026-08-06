import { Section, Row, Column, Text, Link } from "@react-email/components";
import { theme } from "../data/theme";

type FooterProps = {
  name: string;
  role: string;
  contactEmail: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
};

const columnHeadingStyle = {
  color: theme.colors.blue500,
  fontFamily: theme.font,
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  margin: "0 0 10px 0",
};

const linkStyle = {
  display: "block",
  color: theme.colors.slate600,
  fontFamily: theme.font,
  fontSize: "13px",
  lineHeight: "1.9",
  textDecoration: "none",
};

const badgeStyle = {
  display: "inline-block",
  width: "30px",
  height: "30px",
  lineHeight: "30px",
  borderRadius: "50%",
  textAlign: "center" as const,
  fontFamily: theme.font,
  fontSize: "11px",
  fontWeight: 700,
  textDecoration: "none",
  marginRight: "8px",
};

export function Footer({ name, role, contactEmail, portfolioUrl, githubUrl, linkedinUrl }: FooterProps) {
  return (
    <Section
      className="footer-section"
      style={{
        backgroundColor: theme.colors.slate50,
        borderTop: `1px solid ${theme.colors.slate200}`,
        padding: "32px 32px 24px 32px",
      }}
    >
      <Text
        style={{
          color: theme.colors.slate900,
          fontFamily: theme.font,
          fontSize: "13.5px",
          fontWeight: 700,
          margin: "0 0 20px 0",
        }}
      >
        {name} — {role}
      </Text>

      <Row>
        <Column className="footer-col" style={{ width: "34%", verticalAlign: "top" }}>
          <Text style={columnHeadingStyle}>Quick Links</Text>
          <Link href={portfolioUrl} style={linkStyle}>
            Portfolio
          </Link>
          <Link href={githubUrl} style={linkStyle}>
            GitHub
          </Link>
          <Link href={linkedinUrl} style={linkStyle}>
            LinkedIn
          </Link>
        </Column>
        <Column className="footer-col" style={{ width: "33%", verticalAlign: "top" }}>
          <Text style={columnHeadingStyle}>Get in Touch</Text>
          <Link href={`mailto:${contactEmail}`} style={linkStyle}>
            {contactEmail}
          </Link>
        </Column>
        <Column className="footer-col" style={{ width: "33%", verticalAlign: "top" }}>
          <Text style={columnHeadingStyle}>Connect</Text>
          <Link
            href={linkedinUrl}
            style={{ ...badgeStyle, backgroundColor: "#0A66C2", color: theme.colors.white }}
          >
            in
          </Link>
          <Link
            href={githubUrl}
            style={{ ...badgeStyle, backgroundColor: theme.colors.navy900, color: theme.colors.white }}
          >
            gh
          </Link>
          <Link
            href={`mailto:${contactEmail}`}
            style={{ ...badgeStyle, backgroundColor: theme.colors.blue500, color: theme.colors.white }}
          >
            @
          </Link>
        </Column>
      </Row>

      <div
        style={{
          borderTop: `1px solid ${theme.colors.slate200}`,
          margin: "24px 0 16px 0",
          fontSize: 0,
          lineHeight: 0,
        }}
      >
        &nbsp;
      </div>

      <Text
        style={{
          color: theme.colors.slate400,
          fontFamily: theme.font,
          fontSize: "11.5px",
          lineHeight: "1.6",
          margin: 0,
        }}
      >
        Sent directly and personally — this isn't part of a mailing list.
      </Text>
    </Section>
  );
}
