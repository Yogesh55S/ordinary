export type Profile = {
  name: string;
  role: string;
  tagline: string;
  /** Your real contact email — shown in the footer as a mailto: link. */
  contactEmail: string;
  capabilities: string[];
};

// Note: the "What I Work With" skills box is no longer sourced from here — it's rendered
// dynamically per application from src/lib/jobApplicationTechStack.js in the main app
// (DEFAULT_TECH_STACK there is the canonical default set; keep it in sync by hand if you
// change your skills here in spirit).
export const profile: Profile = {
  name: "Yogesh Kumar",
  role: "Full-Stack & Mobile Developer",
  tagline: "Shipping production-grade web & mobile apps — from fintech payouts to real-time video.",
  contactEmail: "Yogeshama914@gmail.com",
  capabilities: [
    "Full-stack web & mobile development",
    "React / Next.js / React Native",
    "Shopify store development",
    "Serverless microservices (AWS Lambda)",
    "REST API design & JWT auth",
    "Webhook architecture",
    "Real-time video (GetStream / WebRTC)",
    "Fintech: payouts & escrow logic",
    "Payment gateways (Cashfree, Razorpay)",
    "Supabase & MongoDB",
    "EventBridge scheduling",
    "Production deployments",
  ],
};
