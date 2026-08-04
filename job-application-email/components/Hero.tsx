import { Section, Text, Heading } from "@react-email/components";
import { theme } from "../data/theme";
import type { Profile } from "../data/profile";

type HeroProps = {
  profile: Profile;
};

export function Hero({ profile }: HeroProps) {
  return (
    <Section
      className="hero-section"
      style={{ backgroundColor: theme.colors.navy900, padding: "48px 32px", textAlign: "center" }}
    >
      <div style={{ margin: "0 0 20px 0" }}>
        <span
          className="hero-badge"
          style={{
            display: "inline-block",
            backgroundColor: theme.colors.navy800,
            border: `1px solid ${theme.colors.slateBorderDark}`,
            color: theme.colors.blue400,
            fontFamily: theme.font,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            padding: "7px 16px",
            borderRadius: "999px",
          }}
        >
          {profile.role}
        </span>
      </div>
      <Heading
        as="h1"
        className="hero-heading"
        style={{
          color: theme.colors.white,
          fontFamily: theme.font,
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          margin: "0 0 14px 0",
        }}
      >
        {profile.name}
      </Heading>
      <Text
        className="hero-tagline"
        style={{
          color: theme.colors.slate400,
          fontFamily: theme.font,
          fontSize: "16px",
          lineHeight: "1.6",
          margin: "0 auto",
          maxWidth: "440px",
        }}
      >
        {profile.tagline}
      </Text>
      <div
        style={{
          margin: "24px auto 0 auto",
          width: "48px",
          height: "3px",
          backgroundColor: theme.colors.blue500,
          borderRadius: "2px",
          fontSize: 0,
          lineHeight: 0,
        }}
      >
        &nbsp;
      </div>
    </Section>
  );
}
