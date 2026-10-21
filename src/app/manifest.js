export default function manifest() {
  return {
    name: "ordinary · Lancer",
    short_name: "ordinary",
    description: "Manage clients, create templates, schedule outreach, and link WhatsApp",
    start_url: "/",
    display: "standalone",
    background_color: "#F0EFED",
    theme_color: "#C02806",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
