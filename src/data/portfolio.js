/**
 * Every word on the public portfolio lives here.
 * Edit this file to change copy, projects, prices, FAQ or links — no component changes needed.
 * Anything in [SQUARE BRACKETS] is a placeholder waiting for your real details.
 */

export const site = {
  name: 'Ordinary Lancer',
  title: 'Ordinary Lancer — Full-Stack & Mobile Developer',
  description:
    'Full-stack & mobile developer building production-grade web apps, online stores and Android apps — with payments, dashboards and interfaces made for real users.',
  email: 'ordinarylancer@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ordinary-lancer-a35722414',
  linkedinLabel: 'linkedin.com/in/ordinary-lancer',
  whatsapp: 'https://wa.me/919350161043',
  tagline: 'Build. Learn. Grow. Repeat :)',
  logo: {
    onLight: { src: '/brand/logo-red.png', width: 1128, height: 611 },
    onDark: { src: '/brand/logo-white.png', width: 1128, height: 611 },
  },
  avatar: { src: '/brand/avatar.jpg', width: 548, height: 670, alt: 'Illustrated portrait of Ordinary Lancer' },
};

/** Section anchors on the home page. Pages other than home prefix them with "/". */
export const nav = {
  links: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: "Let's talk", href: '#contact' },
};

/**
 * Projects power the Work section and every case study page
 * (/work/[slug]). `cover: false` shows the image centred (contained) on a dark backdrop.
 */
export const projects = [
  {
    slug: 'house-of-aerawat',
    kind: 'shop',
    name: 'House of Aerawat',
    shortName: 'House of Aerawat',
    category: 'E-COMMERCE · JEWELRY',
    nextLabel: 'E-COMMERCE',
    kicker: 'sterling jewelry boutique',
    blurb: 'Premium digital boutique for 92.5 sterling silver jewelry — cinematic motion and instant-loading visuals.',
    shortBlurb: 'Premium digital boutique for 92.5 sterling silver jewelry.',
    stackLine: 'Next.js 16 · React 19 · Supabase · GSAP · Razorpay',
    image: { src: '/projects/aerawat.jpg', width: 1536, height: 1024 },
    cover: true,
    status: 'Live',
    live: 'https://houseofaerawat.com/',
    liveLabel: 'Visit boutique',
    domain: 'houseofaerawat.com',
    subtitle:
      'An ultra-premium digital boutique for 92.5 sterling silver jewelry — built to feel as crafted as the pieces it sells.',
    type: 'E-commerce',
    platform: 'Web · Next.js',
    role: 'Full-stack build',
    sticker: 'pure silver, pure code',
    overview: [
      'House of Aerawat is an ultra-premium digital boutique specialising in exquisite 92.5 sterling silver jewelry. Engineered under strict aesthetic discipline, the platform delivers a high-fidelity visual experience that matches the craftsmanship of the boutique’s custom creations.',
      'The technical core is built on Next.js 16 and React 19, powered by a Supabase database and authentication architecture. Immersive animations run on a high-performance timeline engine combining GSAP and Framer Motion, while high-resolution jewelry showcases are optimised on the fly through a custom Cloudinary media pipeline for instant load times.',
    ],
    stack: ['Next.js 16', 'React 19', 'Supabase DB', 'GSAP Motion', 'Framer Motion', 'Cloudinary API', 'Razorpay SDK', 'Tailwind v4', 'Biome Tooling'],
    features: [
      { title: 'Cinematic motion', text: 'A GSAP + Framer Motion timeline engine for smooth, immersive page animations.' },
      { title: 'Instant image loading', text: 'Custom Cloudinary pipeline optimises high-res jewelry shots on the fly.' },
      { title: 'Secure checkout', text: 'Razorpay payments integrated straight into the shopping flow.' },
      { title: 'Accounts & data', text: 'Supabase database and authentication behind every order.' },
    ],
    cta: 'Want a store that feels this premium?',
  },
  {
    slug: 'rabbit-auto-care',
    kind: 'shop',
    name: 'Rabbit Auto Care',
    shortName: 'Rabbit Auto Care',
    category: 'E-COMMERCE · AUTOMOTIVE',
    nextLabel: 'E-COMMERCE',
    kicker: 'premium auto detailing',
    blurb: 'Store for professional car detailing products, with auto PDF invoicing and analytics dashboards.',
    shortBlurb: 'Car detailing store with auto PDF invoicing and analytics dashboards.',
    stackLine: 'Next.js 15 · Supabase SSR · Puppeteer · Recharts',
    image: { src: '/projects/rabbit.jpg', width: 1600, height: 900 },
    cover: true,
    status: 'Live',
    live: 'https://rabbitautocare.com/',
    liveLabel: 'Launch site',
    domain: 'rabbitautocare.com',
    subtitle:
      'A polished e-commerce platform for professional car detailing products — with invoicing and analytics built in.',
    type: 'E-commerce',
    platform: 'Web · Next.js',
    role: 'Full-stack build',
    sticker: 'shiny cars, shiny code',
    overview: [
      'Rabbit AutoCare is a highly polished e-commerce platform built to retail premium professional car detailing products. Structured around rigorous performance and transaction standards, it offers a seamless, luxurious experience for automotive enthusiasts.',
      'It runs on Next.js 15 and React 19, using Supabase SSR for resilient sessions and secure transactions. A custom billing pipeline uses Puppeteer and @react-pdf/renderer to generate and send PDF invoices, dashboards are rendered with Recharts and Chart.js, product specs are authored in a TipTap editor, Razorpay handles payments and Sharp optimises images on the server.',
    ],
    stack: ['Next.js 15', 'React 19', 'Supabase SSR', 'GSAP Motion', 'TipTap Editor', 'Puppeteer', 'Recharts', 'Razorpay SDK', 'Tailwind v4'],
    features: [
      { title: 'Auto PDF invoices', text: 'Puppeteer + @react-pdf/renderer generate and send invoices automatically.' },
      { title: 'Analytics dashboards', text: 'Sales and store insights rendered with Recharts and Chart.js.' },
      { title: 'Rich product pages', text: 'Specs authored in an integrated TipTap rich-text editor.' },
      { title: 'Fast & secure', text: 'Razorpay payments, Supabase SSR sessions and Sharp image optimisation.' },
    ],
    cta: 'Need a store with real business tools?',
  },
  {
    slug: 'nidas-pure',
    kind: 'shop',
    name: 'Nidas Pure',
    shortName: 'Nidas Pure',
    category: 'E-COMMERCE · SKINCARE',
    nextLabel: 'E-COMMERCE',
    kicker: 'botanical ayurvedic skincare',
    blurb: 'Ayurvedic store for handmade soaps, face oils and hair remedies — elegant and frictionless.',
    shortBlurb: 'Ayurvedic store for handmade soaps, face oils and hair remedies.',
    stackLine: 'Next.js · Supabase · PostgreSQL · Tailwind',
    image: { src: '/projects/nidas.jpg', width: 1024, height: 1024 },
    cover: true,
    status: 'Live',
    live: 'https://nidaspure.com/',
    liveLabel: 'Visit apothecary',
    domain: 'nidaspure.com',
    subtitle: 'An elegant Ayurvedic store for 100% natural, handmade soaps, face oils and holistic hair remedies.',
    type: 'E-commerce',
    platform: 'Web · Next.js',
    role: 'Full-stack build',
    sticker: '100% natural, 100% handmade',
    overview: [
      'Nidas Pure is an elegant Ayurvedic digital sanctuary for 100% natural, handmade soaps, face oils and holistic hair remedies. Reflecting the brand’s commitment to purity, it turns traditional Ayurvedic wisdom into a frictionless e-commerce experience.',
      'The frontend uses Next.js for high-fidelity rendering with Tailwind CSS for responsive styling. A secure Supabase backend manages user profiles, cart state and order history, while custom PostgreSQL functions power real-time catalog lookups.',
    ],
    stack: ['Next.js', 'React.js', 'Tailwind CSS', 'Supabase DB', 'PostgreSQL', 'State Management'],
    features: [
      { title: 'Elegant storefront', text: 'High-fidelity Next.js rendering with a calm, botanical design.' },
      { title: 'Accounts, cart & orders', text: 'Supabase manages profiles, live cart state and order history.' },
      { title: 'Real-time catalog', text: 'Custom PostgreSQL functions for instant product lookups.' },
    ],
    cta: 'Selling something natural? Let’s build your store.',
  },
  {
    slug: 'genesis-classes',
    kind: 'platform',
    name: 'Genesis Classes',
    shortName: 'Genesis Classes',
    category: 'PLATFORM · EDTECH',
    nextLabel: 'PLATFORM',
    kicker: 'academic excellence & coaching',
    blurb: 'Academic coaching platform with digital classroom modules and student progress trackers.',
    shortBlurb: 'Coaching platform with digital classrooms and progress trackers.',
    stackLine: 'Next.js · React · Tailwind · LMS',
    image: { src: '/projects/genesis.jpg', width: 1024, height: 1024 },
    cover: true,
    status: 'Live',
    live: 'https://genesisclasses.co.in/',
    liveLabel: 'Explore academy',
    domain: 'genesisclasses.co.in',
    subtitle: 'A high-performance academic platform with digital classroom modules and student progress trackers.',
    type: 'EdTech platform',
    platform: 'Web · Next.js',
    role: 'Full-stack build',
    sticker: 'learning, upgraded',
    overview: [
      'Genesis Classes is a high-performance academic ecosystem providing elite coaching, digital classroom modules and comprehensive progress trackers built for student excellence.',
    ],
    stack: ['Next.js', 'React.js', 'Tailwind CSS', 'Interactive LMS'],
    features: [
      { title: 'Digital classrooms', text: 'Classroom modules students can access anytime, on any device.' },
      { title: 'Progress trackers', text: 'Clear tracking of each student’s learning journey.' },
      { title: 'Interactive LMS', text: 'A learning system built around coaching workflows.' },
    ],
    cta: 'Running a coaching institute? Let’s take it online.',
  },
  {
    slug: 'pawgloo',
    kind: 'mobile',
    name: 'Pawgloo',
    shortName: 'Pawgloo',
    category: 'APP · MARKETPLACE',
    nextLabel: 'APP',
    kicker: 'active booking marketplace',
    blurb: 'Pet care marketplace for booking services, connecting providers and hosting retail catalogs.',
    shortBlurb: 'Pet care marketplace for bookings, providers and retail.',
    stackLine: 'Next.js · React · Tailwind · State engine',
    image: { src: '/projects/pawgloo.png', width: 600, height: 600 },
    cover: false,
    status: 'In production',
    live: '',
    liveLabel: '',
    domain: 'pawgloo — in production',
    subtitle: 'A pet-care marketplace that streamlines bookings, connects service providers and hosts retail catalogs.',
    type: 'Marketplace',
    platform: 'Web · Next.js',
    role: 'Full-stack build',
    sticker: 'happy pets, happy parents',
    overview: [
      'Pawgloo is a pet-focused platform designed to streamline bookings, connect premium pet service providers and host retail catalogs — engineered to make every pet-parent transaction simple.',
    ],
    stack: ['Next.js', 'React.js', 'Tailwind CSS', 'State Engine'],
    features: [
      { title: 'Service bookings', text: 'Pet parents book care services in a few taps.' },
      { title: 'Provider network', text: 'Connects pet owners with trusted service providers.' },
      { title: 'Retail catalog', text: 'Pet products listed and sold on the same platform.' },
    ],
    cta: 'Building a marketplace? Let’s talk.',
  },
  {
    slug: 'sanskriti-retails',
    kind: 'shop',
    name: 'Sanskriti Retails',
    shortName: 'Sanskriti',
    category: 'E-COMMERCE · SHOPIFY',
    nextLabel: 'E-COMMERCE',
    kicker: 'premium shopify experience',
    blurb: 'High-end Shopify storefront for traditional Indian clothing and silk sarees.',
    shortBlurb: 'High-end Shopify storefront for silk sarees and ethnic wear.',
    stackLine: 'Shopify Plus · Liquid · JavaScript · Tailwind',
    image: { src: '/projects/sanskriti.jpg', width: 1024, height: 1024 },
    cover: true,
    status: 'Live',
    live: 'https://sanskriti-retails-2.myshopify.com/',
    liveLabel: 'Visit store',
    domain: 'sanskriti-retails-2.myshopify.com',
    subtitle: 'A high-end Shopify storefront for premium traditional Indian clothing and silk sarees.',
    type: 'E-commerce',
    platform: 'Shopify Plus',
    role: 'Store development',
    sticker: 'tradition, online',
    overview: [
      'A high-end Shopify e-commerce platform dedicated to premium traditional Indian clothing. It features a clean, modern aesthetic with vibrant but mature colour palettes that highlight beautiful silk sarees and elegant ethnic wear.',
    ],
    stack: ['Shopify Plus', 'Liquid', 'JavaScript', 'Tailwind CSS'],
    features: [
      { title: 'Custom Shopify theme', text: 'Liquid templates tailored to the brand’s look and catalog.' },
      { title: 'Collection-first design', text: 'Mature, vibrant palettes that let sarees and ethnic wear shine.' },
      { title: 'Clean shopping flow', text: 'A modern storefront that keeps browsing and checkout simple.' },
    ],
    cta: 'Want a Shopify store that stands out?',
  },
  {
    slug: 'lukewarm',
    kind: 'mobile',
    name: 'Lukewarm',
    shortName: 'Lukewarm',
    category: 'APP · ANDROID',
    nextLabel: 'APP',
    kicker: 'react native android app',
    blurb: 'Android app that turns business cards into smart contacts with OCR, offline search and AI voice memos.',
    shortBlurb: 'Business-card scanner app with OCR, offline search and AI voice memos.',
    stackLine: 'React Native · Drizzle ORM · SQLite · OCR',
    image: { src: '/projects/lukewarm.jpg', width: 1536, height: 1024 },
    cover: true,
    status: 'Android app',
    live: '',
    liveLabel: 'View app specs',
    domain: '',
    subtitle: 'An Android app that turns physical business cards into structured, searchable contact intelligence.',
    type: 'Mobile app',
    platform: 'Android · React Native',
    role: 'App development',
    sticker: 'scan. save. follow up.',
    overview: [
      'Lukewarm is an Android application that converts physical business cards into structured digital contacts. Built for modern networking, it features sub-second OCR scanning and smart AI voice memos to automate lead management right from your phone.',
      'The app is written in React Native and styled with Tailwind CSS, powered by a local Drizzle ORM database for instant offline search and sync. A device-side scanner pipeline crops and parses contact fields with high precision, alongside native Android integrations for calendar scheduling.',
    ],
    stack: ['React Native', 'Android SDK', 'Tailwind CSS', 'Drizzle ORM', 'SQLite', 'OCR Scan Engine', 'Voice AI', 'Google Sync'],
    features: [
      { title: 'Sub-second OCR', text: 'Scan a business card and get a structured contact instantly.' },
      { title: 'AI voice memos', text: 'Record a quick note after every meeting — it stays with the contact.' },
      { title: 'Offline search', text: 'Drizzle ORM + SQLite keep every contact searchable without internet.' },
      { title: 'Calendar & Google sync', text: 'Native Android integrations to schedule follow-ups.' },
    ],
    cta: 'Have an app idea? Let’s ship it.',
  },
];

export function projectHref(slug) {
  return `/work/${slug}`;
}

export function getProject(slug) {
  return projects.find((project) => project.slug === slug) ?? null;
}

/** The case study after `slug`, wrapping around to the first. */
export function getNextProject(slug) {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
}

export const hero = {
  // Used by the social share image (src/app/opengraph-image.js).
  headingLead: 'I turn complex ideas into',
  rotatingWords: ['shipped products.', 'online stores.', 'mobile apps.', 'web platforms.'],
  // The hero wordmark — full "ordinary Lancer" brush lockup (transparent PNG).
  wordmark: { src: '/brand/wordmark-full.png', width: 866, height: 344, alt: 'Ordinary Lancer' },
  /**
   * Whiskers drawn around the wordmark. Boxes are % of the wordmark, `origin` is the
   * pivot they swing from, `pop`/`whisk` are the entry and swing delays in seconds.
   * Values taken verbatim from the HeroWordmark design export (866×344 lockup).
   */
  whiskers: [
    { src: '/brand/hero/whisker-l1.png', side: 'l', box: [9.007, 13.663, 4.734, 21.512], origin: '85% 95%', pop: 0.9, whisk: 1.4 },
    { src: '/brand/hero/whisker-l2.png', side: 'l', box: [1.848, 32.849, 7.621, 11.337], origin: '95% 85%', pop: 1, whisk: 1.55 },
    { src: '/brand/hero/whisker-l3.png', side: 'l', box: [1.039, 52.035, 7.044, 6.977], origin: '96% 50%', pop: 1.1, whisk: 1.7 },
    { src: '/brand/hero/whisker-r1.png', side: 'r', box: [91.801, 53.488, 7.044, 8.721], origin: '4% 85%', pop: 1.2, whisk: 1.5 },
    { src: '/brand/hero/whisker-r2.png', side: 'r', box: [91.224, 67.442, 6.697, 11.047], origin: '4% 12%', pop: 1.3, whisk: 1.65 },
  ],
  tagline: 'Build. Learn. Grow. Repeat',
  // Hero tagline doubles as a download link; the "click here" hint shows for 3s after the intro.
  card: {
    src: '/brand/ordinary-lancer-business-card.png',
    filename: 'Ordinary-Lancer-Business-Card.png',
    hint: 'click here!',
    label: 'Download the Ordinary Lancer business card',
  },
};

export const skills = ['NEXT.JS', 'REACT', 'REACT NATIVE', 'NODE.JS', 'SUPABASE', 'MONGODB', 'AWS LAMBDA', 'PYTHON', 'RAZORPAY', 'SHOPIFY'];

/** Brand lines for the tilted strip under the hero (case studies still show their stack). */
export const marqueeLines = [
  'IDEAS INTO PRODUCTS',
  'SHIPPED, NOT JUST STARTED',
  'ONE DEV · WHOLE STACK',
  'BUILT TO SCALE',
  'DESIGNED TO CONVERT',
  'CLEAN CODE, ON TIME',
  'FROM SKETCH TO LAUNCH',
];

export const pillars = [
  { icon: 'monitorCode', lines: ['Web', 'Development'] },
  { icon: 'bulb', lines: ['Ideas to', 'Products'] },
  { icon: 'growth', lines: ['Freelancing', '& Growth'] },
  { icon: 'target', lines: ['Sharing', 'My Journey'] },
];

export const services = {
  eyebrow: 'what I do',
  heading: ['One developer.', 'The whole stack.'],
  intro:
    'No handoffs between five freelancers. One person owns your product from database to design — web, mobile and payments.',
  featured: {
    icon: 'box',
    note: 'my speciality',
    title: 'Full-Stack Web Apps',
    description:
      'Complete products on Next.js, React and Node.js with Supabase or MongoDB — dashboards, client portals, LMS platforms, booking marketplaces and SaaS.',
    tags: ['Next.js', 'React', 'Node.js', 'Supabase', 'MongoDB'],
  },
  // tone: 'light' (white card) or 'red' (brand card). `points` are what the client walks away with.
  items: [
    {
      icon: 'bag',
      tone: 'red',
      title: 'E-commerce & Payments',
      description:
        'Online stores that actually sell — fast product pages, smooth carts and a checkout people trust on the first try.',
      points: ['Catalog, cart & order dashboard', 'UPI & card payments with invoices', 'Shopify setup or fully custom store'],
      stack: 'Razorpay · Cashfree · Shopify',
    },
    {
      icon: 'phone',
      tone: 'light',
      title: 'Mobile Apps',
      description:
        'iOS and Android apps from one React Native codebase — built to work offline and feel native in the hand.',
      points: ['MVP to Play Store / App Store', 'Offline sync & push notifications', 'One codebase, both platforms'],
      stack: 'React Native · Expo · SQLite',
    },
    {
      icon: 'layout',
      tone: 'light',
      title: 'Frontend & Motion',
      description:
        'Responsive, animated interfaces that feel premium on every screen — from a 320px phone to a wide desktop.',
      points: ['Pixel-close build from Figma', 'Scroll & micro-interactions', 'Fast loads & accessible markup'],
      stack: 'React · Tailwind · GSAP · Framer Motion',
    },
    {
      icon: 'cloud',
      tone: 'light',
      title: 'Backend & Cloud',
      description:
        'APIs, auth, databases and serverless infrastructure that scales quietly in the background while you grow.',
      points: ['REST APIs, auth & roles', 'Database design & migrations', 'Serverless jobs, cron & webhooks'],
      stack: 'Python · AWS Lambda · Supabase · Redis',
    },
    {
      icon: 'wrench',
      tone: 'light',
      title: 'Fixes, Upgrades & Care',
      description:
        'Already have an app? I jump in to fix what is broken, ship the features you are missing and keep it healthy.',
      points: ['Bug hunts & speed boosts', 'New features on existing code', 'Monthly care & monitoring plans'],
      stack: 'Debugging · Features · Support',
    },
  ],
};

export const work = {
  eyebrow: "things I've shipped",
  heading: 'Selected work',
  intro: 'Live products for real businesses — pick one for the full story.',
  // Filter ids match `project.kind`.
  filters: [
    { id: 'all', label: 'All' },
    { id: 'shop', label: 'E-commerce' },
    { id: 'platform', label: 'Platforms' },
    { id: 'mobile', label: 'Apps' },
  ],
  nextCta: { text: 'Your project could be next on this list…', label: 'Start yours', href: '#contact' },
};

export const workflow = {
  eyebrow: "how we'll work",
  heading: 'Simple process. No surprises.',
  intro: 'Five clear steps from first call to launch — you always know what is happening and what comes next.',
  // `when` is the rough timing, `gets` is what the client has in hand after the step.
  steps: [
    { icon: 'chat', title: 'Discuss', when: '30-min call · free', text: 'A free call about your idea, goals, budget and timeline.', gets: 'Honest advice on scope & stack' },
    { icon: 'layout', title: 'Plan', when: '1–2 days', text: 'Clear scope, milestones and a fixed quote in writing.', gets: 'Fixed quote + milestone plan' },
    { icon: 'code', title: 'Build', when: 'Weekly sprints', text: 'Weekly demos you can click through and give feedback on.', gets: 'A live demo link every week' },
    { icon: 'send', title: 'Deliver', when: 'Launch day', text: 'Tested, deployed and handed over with full source code.', gets: 'Source code, docs & handover' },
    { icon: 'wrench', title: 'Support', when: '30 days included', text: 'I stay around for fixes, updates and the next version.', gets: 'Fixes & a plan for v2' },
  ],
};

export const experience = {
  eyebrow: 'the journey so far',
  heading: 'Experience',
  achievement: {
    badge: 'ACHIEVEMENT · 2024',
    title: 'Smart India Hackathon',
    text: 'National level. Led frontend architecture and rapid prototyping for a team of 6 — cleared the 1st stage with 100% of the MVP delivered.',
  },
  roles: [
    {
      period: 'JUL — AUG 2023',
      active: false,
      title: 'Full-Stack Intern',
      org: 'Hopping Minds',
      text: 'Built and consumed REST APIs in a live environment and learned component-driven architecture.',
    },
    {
      period: 'AUG — OCT 2021',
      active: false,
      title: 'Multi-Domain Trainee',
      org: 'Achievers Technologies',
      text: 'Bootcamp covering web development, PHP & backend, and Python & databases.',
    },
  ],
};

export const about = {
  eyebrow: 'the person behind it',
  heading: { before: 'An ordinary developer with ', highlight: 'extraordinary', after: ' focus.' },
  paragraphs: [
    'I’m a full-stack & mobile developer. I specialise in React Native, Next.js, Python and AWS — serverless infrastructure, fintech integrations like Cashfree and Razorpay, and interfaces built for real-world use.',
    'As Ordinary Lancer, I share what I learn about building and freelancing — the wins, the mistakes and everything in between.',
  ],
  cta: { label: 'Follow on LinkedIn', href: site.linkedin },
  // tone: 'red' | 'light' | 'dark'
  reasons: [
    { icon: 'chat', tone: 'red', title: 'Clear talk', text: 'Simple updates. No tech jargon.' },
    { icon: 'codeSimple', tone: 'light', title: 'Production-grade', text: 'Built to scale, easy to hand over.' },
    { icon: 'clock', tone: 'light', title: 'On time', text: 'Milestones you can track every week.' },
    { icon: 'unlock', tone: 'dark', title: 'You own it', text: 'Code, design and data are yours.' },
  ],
  // The "lancer.config.js" card. Each line is [key, value, kind]; kind picks the syntax colour.
  code: {
    file: 'lancer.config.js',
    label: 'Code snippet: full-stack developer building web and mobile apps, working remotely worldwide, stack Next.js, React Native and Node, status open for work',
    lines: [
      ['role', "'Full-Stack Dev'", 'string'],
      ['builds', "'Web & Mobile apps'", 'string'],
      ['works', "'Remote, worldwide'", 'string'],
      ['stack', ['Next', 'RN', 'Node'], 'list'],
      ['coffee', 'Infinity', 'number'],
      ['status', "'open for work'", 'cursor'],
    ],
    nowLabel: 'RIGHT NOW',
    now: 'Independent Full-Stack Developer',
    nowNote: '…and taking on new freelance projects.',
  },
  toolbox: {
    eyebrow: 'my toolbox',
    heading: 'Tech I work with',
    intro: 'The stack I reach for, grouped by where it lives in a product.',
    // `icon` is an Icon.js name. Every tool appears in exactly one group.
    groups: [
      { icon: 'layout', title: 'Frontend', tools: ['Next.js', 'React.js', 'Tailwind CSS', 'Vite', 'HTML5 / CSS3'] },
      { icon: 'phone', title: 'Mobile', tools: ['React Native', 'Expo'] },
      { icon: 'code', title: 'Backend', tools: ['Node.js', 'Python', 'AWS Lambda'] },
      { icon: 'database', title: 'Data', tools: ['MongoDB', 'Supabase', 'MySQL', 'Drizzle ORM', 'Valkey / Redis'] },
      { icon: 'brackets', title: 'Languages', tools: ['TypeScript', 'JavaScript', 'C++'] },
      { icon: 'cloud', title: 'Ship & integrate', tools: ['Vercel', 'Git & GitHub', 'Razorpay', 'GetStream Video SDK'] },
    ],
  },
};

export const pricing = {
  eyebrow: 'honest pricing',
  heading: 'Pick a starting point',
  intro: 'Every project gets a fixed quote after our first call. These are typical starting prices.',
  plans: [
    {
      name: 'Starter',
      summary: 'Landing page or business website',
      price: '[₹ ____]',
      unit: ' onwards',
      features: ['Up to [5] responsive pages', 'Animations, contact form & SEO', 'Deployed on your domain'],
      cta: { label: 'Get a quote', href: '#contact' },
      featured: false,
    },
    {
      name: 'Product',
      summary: 'E-commerce store, web app or MVP',
      price: '[₹ ____]',
      unit: ' onwards',
      features: ['Frontend, backend & database', 'Payments, admin panel & dashboards', 'Weekly demos + [30] days support'],
      cta: { label: "Let's build it", href: '#contact' },
      featured: true,
      badge: 'best for startups',
    },
    {
      name: 'Ongoing',
      summary: 'Monthly development & support',
      price: '[₹ ____]',
      unit: ' / month',
      features: ['New features every month', 'Bug fixes & speed upgrades', 'Priority replies'],
      cta: { label: 'Talk about it', href: '#contact' },
      featured: false,
    },
  ],
};

export const faq = {
  eyebrow: 'good questions',
  heading: 'Before you ask…',
  intro: "Still unsure? Send me a message — I'm happy to answer anything.",
  items: [
    {
      q: 'How long does a project take?',
      a: 'A landing page usually takes [1–2 weeks]; a full store or web app [4–8 weeks]. You get a clear timeline with milestones before we start.',
    },
    {
      q: 'How do payments work?',
      a: '[50%] to start and the rest on delivery, or split into milestones for bigger projects. Everything is agreed in writing first.',
    },
    {
      q: 'Can you build mobile apps too?',
      a: 'Yes — I build Android and iOS apps with React Native and Expo, like Lukewarm, my business-card scanner app.',
    },
    {
      q: 'Do I get the source code?',
      a: 'Yes. The code, design and data are fully yours — handed over on GitHub with simple docs.',
    },
    {
      q: 'What happens after launch?',
      a: 'You get [30 days] of free fixes, and you can move to a monthly plan for ongoing updates and support.',
    },
  ],
};

export const contact = {
  eyebrow: 'got an idea?',
  heading: ["Let's build it", 'together.'],
  intro: `Tell me what you're planning. I reply within [24 HOURS] with next steps and a rough estimate. Working remotely with clients everywhere.`,
  links: [
    { icon: 'mail', label: site.email, href: `mailto:${site.email}` },
    { icon: 'whatsapp', label: '+91 93501 61043 · WhatsApp', href: site.whatsapp },
    { icon: 'linkedin', label: site.linkedinLabel, href: site.linkedin },
  ],
  form: {
    title: 'Tell me about your project',
    needs: [
      { id: 'web', label: 'Web app' },
      { id: 'shop', label: 'Online store' },
      { id: 'app', label: 'Mobile app' },
      { id: 'site', label: 'Website' },
      { id: 'fix', label: 'Fix or upgrade' },
    ],
    defaultNeed: 'web',
    budgets: ['[RANGE 1]', '[RANGE 2]', '[RANGE 3]', 'Not sure yet'],
    submitLabel: 'Send message',
    successTitle: 'Message sent!',
    successText: "Thanks for reaching out — I'll get back to you within [24 HOURS].",
  },
};

export const footer = {
  blurb: 'Full-Stack Developer | Freelancer | Builder. Turning complex ideas into shipped products.',
  // `section: true` links are home-page anchors (prefixed with "/" on other pages).
  columns: [
    {
      title: 'EXPLORE',
      links: [
        { label: 'Services', href: '#services', section: true },
        { label: 'Work', href: '#work', section: true },
        { label: 'Process', href: '#process', section: true },
        { label: 'Pricing', href: '#pricing', section: true },
      ],
    },
    {
      title: 'CONNECT',
      links: [
        { label: 'Email', href: `mailto:${site.email}` },
        { label: 'LinkedIn', href: site.linkedin },
        { label: 'WhatsApp', href: site.whatsapp },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Ordinary Lancer. Made with code & chai.`,
};

export const login = {
  title: 'Owner login',
  subtitle: 'Private area. Authorised access only.',
  panelHeading: ['Back to work,', 'Lancer.'],
  panelText: 'Clients, templates and job search — your private workspace is one step away.',
  note: "There's no public sign-up. Too many wrong attempts will lock the login for a while.",
};
