export type TechCategory = {
  category: string;
  items: string[];
};

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  /** Absolute HTTPS URL — required for email clients. */
  heroImage: string;
  /** Your real contact email — shown in the footer as a mailto: link. */
  contactEmail: string;
  techStack: TechCategory[];
  capabilities: string[];
};

export const profile: Profile = {
  name: "Yogesh Kumar",
  role: "Full-Stack & Mobile Developer",
  tagline: "Shipping production-grade web & mobile apps — from fintech payouts to real-time video.",
  // TEMPORARY placeholder — swap for a real hosted anime-style dev illustration before sending
  // (generate/commission the art, host it at a permanent HTTPS URL, paste that URL here).
  heroImage: "https://placehold.co/440x400/0B1120/60A5FA?text=Dev+Illustration&font=roboto",
  contactEmail: "Yogeshama914@gmail.com",
  techStack: [
    { category: "Frontend", items: ["React.js", "Next.js", "React Native (Expo)", "Tailwind CSS"] },
    { category: "Backend", items: ["Node.js", "Python", "REST APIs", "JWT", "Webhooks"] },
    { category: "Data & Caching", items: ["Supabase (Postgres)", "MongoDB", "MySQL", "Valkey / Redis"] },
    { category: "Cloud & Integrations", items: ["AWS Lambda", "API Gateway", "EventBridge", "Vercel", "Shopify", "Cashfree", "Razorpay"] },
  ],
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
