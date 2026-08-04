import { Section, Row, Column, Text } from "@react-email/components";
import { theme } from "../data/theme";
import type { TechCategory } from "../data/profile";

type TechStackProps = {
  techStack: TechCategory[];
};

const eyebrowStyle = {
  color: theme.colors.blue500,
  fontFamily: theme.font,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 20px 0",
};

const categoryLabelStyle = {
  color: theme.colors.slate900,
  fontFamily: theme.font,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 8px 0",
};

const itemStyle = {
  color: theme.colors.slate600,
  fontFamily: theme.font,
  fontSize: "13.5px",
  lineHeight: "1.7",
  margin: 0,
};

export function TechStack({ techStack }: TechStackProps) {
  return (
    <Section className="content-section" style={{ backgroundColor: theme.colors.white, padding: "24px 32px 36px 32px" }}>
      <Text style={eyebrowStyle}>What I Work With</Text>
      <Row
        style={{
          backgroundColor: theme.colors.slate50,
          border: `1px solid ${theme.colors.slate200}`,
          borderRadius: "8px",
        }}
      >
        {techStack.map((group) => (
          <Column
            key={group.category}
            className="techstack-col"
            style={{ verticalAlign: "top", padding: "20px 16px" }}
          >
            <Text style={categoryLabelStyle}>{group.category}</Text>
            {group.items.map((item) => (
              <Text key={item} style={itemStyle}>
                {item}
              </Text>
            ))}
          </Column>
        ))}
      </Row>
    </Section>
  );
}
