import { Section, Text } from "@react-email/components";
import { theme } from "../data/theme";

type CapabilitiesProps = {
  capabilities: string[];
};

const eyebrowStyle = {
  color: theme.colors.blue500,
  fontFamily: theme.font,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 16px 0",
};

const pillStyle = {
  display: "inline-block",
  backgroundColor: theme.colors.slate100,
  color: theme.colors.slate600,
  fontFamily: theme.font,
  fontSize: "12.5px",
  padding: "6px 12px",
  borderRadius: "4px",
  marginRight: "6px",
  marginBottom: "8px",
};

export function Capabilities({ capabilities }: CapabilitiesProps) {
  return (
    <Section className="content-section" style={{ backgroundColor: theme.colors.white, padding: "12px 32px 36px 32px" }}>
      <Text style={eyebrowStyle}>Experience With</Text>
      <div>
        {capabilities.map((item) => (
          <span key={item} style={pillStyle}>
            {item}
          </span>
        ))}
      </div>
    </Section>
  );
}
