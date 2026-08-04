export type Project = {
  name: string;
  description: string;
  tech: string[];
  /** Absolute HTTPS URL — required for email clients. Filled in during Step 7. */
  image: string;
  url: string;
};

export const projects: Project[] = [
  {
    name: "Pawgloo — Veterinary Telehealth",
    description:
      "A production-grade telehealth platform connecting pet owners with vets via real-time WebRTC video, backed by a tamper-evident financial ledger automating multi-tier Cashfree payouts.",
    tech: ["React Native", "AWS Lambda", "MongoDB", "GetStream", "Cashfree"],
    // Local preview only — host this at a permanent HTTPS URL before sending.
    image: "/static/pawgloo.png",
    url: "https://play.google.com/store/apps/details?id=com.pawgloo.app",
  },
  {
    name: "Genesis Classes",
    description: "A scalable educational platform for exam-prep institutes with Razorpay fee payments and Mtalkz SMS communication.",
    tech: ["Next.js", "Supabase", "Tailwind CSS", "Razorpay"],
    // Local preview only — host this at a permanent HTTPS URL before sending.
    image: "/static/genesis.png",
    url: "https://genesisclasses.com/",
  },
  {
    name: "Rabbit Auto Care",
    description: "A full-stack e-commerce platform for a premium car-care brand with secure checkout and integrated Shiprocket logistics.",
    tech: ["Next.js", "Supabase", "Vercel", "Shiprocket"],
    // Local preview only — host this at a permanent HTTPS URL before sending.
    image: "/static/kitkat.webp",
    url: "https://rabbitautocare.com/",
  },
];
