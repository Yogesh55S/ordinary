import { Section, Row, Column, Img, Text, Link } from "@react-email/components";
import { theme } from "../data/theme";
import type { Project } from "../data/projects";

type ProjectsProps = {
  projects: Project[];
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

export function Projects({ projects }: ProjectsProps) {
  return (
    <Section className="content-section" style={{ backgroundColor: theme.colors.white, padding: "8px 32px 12px 32px" }}>
      <Text style={eyebrowStyle}>Selected Projects</Text>
      {projects.map((project, index) => (
        <Row
          key={project.name}
          style={{
            border: `1px solid ${theme.colors.slate200}`,
            borderRadius: "8px",
            marginBottom: index === projects.length - 1 ? 0 : "16px",
          }}
        >
          <Column className="project-image-col" style={{ width: "120px", verticalAlign: "top", padding: "16px" }}>
            <div
              style={{
                width: "104px",
                height: "104px",
                backgroundColor: theme.colors.slate50,
                border: `1px solid ${theme.colors.slate200}`,
                borderRadius: "6px",
                textAlign: "center" as const,
                lineHeight: "102px",
                fontSize: 0,
              }}
            >
              <Img
                src={project.image}
                alt={`Screenshot of ${project.name}`}
                width="104"
                height="104"
                style={{
                  maxWidth: "104px",
                  maxHeight: "104px",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  verticalAlign: "middle",
                  display: "inline-block",
                }}
              />
            </div>
          </Column>
          <Column className="project-text-col" style={{ verticalAlign: "top", padding: "16px 16px 16px 0" }}>
            <Text
              style={{
                color: theme.colors.slate900,
                fontFamily: theme.font,
                fontSize: "17px",
                fontWeight: 600,
                margin: "0 0 4px 0",
              }}
            >
              {project.name}
            </Text>
            <Text
              style={{
                color: theme.colors.blue700,
                fontFamily: theme.font,
                fontSize: "12px",
                fontWeight: 500,
                margin: "0 0 8px 0",
              }}
            >
              {project.tech.join(" · ")}
            </Text>
            <Text
              style={{
                color: theme.colors.slate600,
                fontFamily: theme.font,
                fontSize: "13.5px",
                lineHeight: "1.5",
                margin: "0 0 8px 0",
              }}
            >
              {project.description}
            </Text>
            <Link
              href={project.url}
              style={{
                color: theme.colors.blue500,
                fontFamily: theme.font,
                fontSize: "13.5px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View Project →
            </Link>
          </Column>
        </Row>
      ))}
    </Section>
  );
}
