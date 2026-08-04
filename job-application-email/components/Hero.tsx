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
      <Heading
        as="h1"
        className="hero-heading"
        style={{
          color: theme.colors.white,
          fontFamily: theme.font,
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          margin: "0 0 8px 0",
        }}
      >
        {profile.name}
      </Heading>
      <Text
        className="hero-role"
        style={{
          color: theme.colors.blue400,
          fontFamily: theme.font,
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.4px",
          margin: "0 0 16px 0",
        }}
      >
        {profile.role}
      </Text>
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
