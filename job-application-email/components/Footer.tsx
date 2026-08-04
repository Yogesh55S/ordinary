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
  const chipStyle = {
    display: "inline-block",
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.slate200}`,
    color: theme.colors.slate600,
    fontFamily: theme.font,
    fontSize: "12px",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: "6px",
    textDecoration: "none",
    marginRight: "8px",
    marginBottom: "8px",
  };

  const links = [
    { label: "Email", href: `mailto:${contactEmail}` },
    { label: "Portfolio", href: portfolioUrl },
    { label: "GitHub", href: githubUrl },
    { label: "LinkedIn", href: linkedinUrl },
  ];

  return (
    <Section
      className="footer-section"
      style={{
        backgroundColor: theme.colors.slate50,
        borderTop: `1px solid ${theme.colors.slate200}`,
        padding: "28px 32px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          color: theme.colors.slate900,
          fontFamily: theme.font,
          fontSize: "13.5px",
          fontWeight: 700,
          margin: "0 0 14px 0",
        }}
      >
        {name} — {role}
      </Text>
      <div>
        {links.map((link) => (
          <Link key={link.label} href={link.href} style={chipStyle}>
            {link.label}
          </Link>
        ))}
      </div>
    </Section>
  );
}
