import { Section, Row, Column, Img, Text, Heading } from "@react-email/components";
import { theme } from "../data/theme";
import type { Profile } from "../data/profile";

type HeroProps = {
  profile: Profile;
};

export function Hero({ profile }: HeroProps) {
  return (
    <Section className="hero-section" style={{ backgroundColor: theme.colors.navy900, padding: "40px 32px" }}>
      <Row>
        <Column className="hero-text-col" style={{ width: "58%", verticalAlign: "middle", paddingRight: "16px" }}>
          <Heading
            as="h1"
            className="hero-heading"
            style={{
              color: theme.colors.white,
              fontFamily: theme.font,
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              margin: "0 0 6px 0",
            }}
          >
            {profile.name.toUpperCase()}
          </Heading>
          <Text
            style={{
              color: theme.colors.blue400,
              fontFamily: theme.font,
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 16px 0",
            }}
          >
            {profile.role}
          </Text>
          <Text
            style={{
              color: theme.colors.slate400,
              fontFamily: theme.font,
              fontSize: "16px",
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {profile.tagline}
          </Text>
        </Column>
        <Column className="hero-image-col" style={{ width: "42%", verticalAlign: "middle" }}>
          <Img
            src={profile.heroImage}
            alt={`${profile.name}, ${profile.role}, illustrated at a desk in a dark-blue developer workspace`}
            width="220"
            style={{
              width: "100%",
              maxWidth: "220px",
              height: "auto",
              display: "block",
              marginLeft: "auto",
              borderRadius: "8px",
            }}
          />
        </Column>
      </Row>
    </Section>
  );
}
