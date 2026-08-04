// The skills box is rendered dynamically at send time (see src/lib/jobApplicationTechStack.js
// in the main app) so each application can highlight a different set of skills. This
// component only needs to emit the literal token — react-email/export leaves it untouched
// since it isn't one of the sample-personalization tokens substituted at export time.
export function TechStack() {
  return "{{TECH_STACK_SECTION}}";
}
