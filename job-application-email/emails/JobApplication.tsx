import { Html, Head, Body, Container, Preview } from "@react-email/components";
import { Hero } from "../components/Hero";
import { Introduction } from "../components/Introduction";
import { TechStack } from "../components/TechStack";
import { Projects } from "../components/Projects";
import { Capabilities } from "../components/Capabilities";
import { CallToAction } from "../components/CallToAction";
import { Footer } from "../components/Footer";
import { profile } from "../data/profile";
import { projects } from "../data/projects";
import { samplePersonalization, type Personalization } from "../data/sample";

type JobApplicationEmailProps = {
  personalization?: Personalization;
};

export default function JobApplicationEmail({
  personalization = samplePersonalization,
}: JobApplicationEmailProps) {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" content="" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`
          @media only screen and (max-width: 600px) {
            .hero-section { padding: 36px 20px !important; }
            .content-section, .cta-section, .footer-section {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
            .hero-heading { font-size: 26px !important; }
            .hero-tagline { font-size: 15px !important; }
            .project-image-col, .project-text-col {
              display: block !important;
              width: 100% !important;
              padding: 16px 16px 0 16px !important;
              text-align: center !important;
            }
            .project-text-col { padding: 12px 16px 16px 16px !important; text-align: left !important; }
            .project-image-col > div {
              margin: 0 auto !important;
            }
            .cta-btn-col {
              display: block !important;
              width: 100% !important;
              padding: 0 0 12px 0 !important;
            }
            .cta-btn-col a {
              display: block !important;
              padding-top: 15px !important;
              padding-bottom: 15px !important;
            }
            .footer-col {
              display: block !important;
              width: 100% !important;
              padding: 0 0 18px 0 !important;
            }
            .footer-col:last-child {
              padding-bottom: 0 !important;
            }
          }
        `}</style>
      </Head>
      <Preview>
        {profile.name} — {profile.role}, applying for {personalization.jobTitle} at{" "}
        {personalization.companyName}
      </Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#F1F5F9" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#FFFFFF" }}>
          <Hero profile={profile} />
          <Introduction
            hrName={personalization.hrName}
            jobTitle={personalization.jobTitle}
            companyName={personalization.companyName}
            whyCompany={personalization.whyCompany}
            relevantSkills={personalization.relevantSkills}
            developerName={profile.name}
            developerRole={profile.role}
          />
          <TechStack />
          <Projects projects={projects} />
          <Capabilities capabilities={profile.capabilities} />
          <CallToAction
            portfolioUrl={personalization.portfolioUrl}
            resumeUrl={personalization.resumeUrl}
            githubUrl={personalization.githubUrl}
            linkedinUrl={personalization.linkedinUrl}
          />
          <Footer
            name={profile.name}
            role={profile.role}
            contactEmail={profile.contactEmail}
            portfolioUrl={personalization.portfolioUrl}
            githubUrl={personalization.githubUrl}
            linkedinUrl={personalization.linkedinUrl}
          />
        </Container>
      </Body>
    </Html>
  );
}
