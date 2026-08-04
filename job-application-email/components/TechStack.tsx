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
  margin: "0 0 10px 0",
};

const chipStyle = {
  display: "inline-block",
  backgroundColor: theme.colors.blue50,
  color: theme.colors.blue700,
  fontFamily: theme.font,
  fontSize: "12px",
  fontWeight: 600,
  padding: "5px 10px",
  borderRadius: "4px",
  marginRight: "6px",
  marginBottom: "6px",
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
            <div>
              {group.items.map((item) => (
                <span key={item} style={chipStyle}>
                  {item}
                </span>
              ))}
            </div>
          </Column>
        ))}
      </Row>
    </Section>
  );
}
