/**
 * Every word on the public portfolio lives here.
 * Edit this file to change copy, projects, prices, FAQ or links — no component changes needed.
 * Anything in [SQUARE BRACKETS] is a placeholder waiting for your real details.
 */

export const site = {
  name: 'Ordinary Lancer',
  title: 'Ordinary Lancer — Full-Stack Developer (MERN, React, Node.js)',
  description:
    'Full-stack developer for founders, startups and growing businesses. MERN stack web apps, SaaS dashboards and fast websites — from the first sketch to a live, working product.',
  email: 'ordinarylancer@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ordinary-lancer-a35722414',
  linkedinLabel: 'linkedin.com/in/ordinary-lancer',
  tagline: 'Build. Learn. Grow. Repeat :)',
  logo: {
    onLight: { src: '/brand/logo-red.png', width: 1128, height: 611 },
    onDark: { src: '/brand/logo-white.png', width: 1128, height: 611 },
  },
  avatar: { src: '/brand/avatar.jpg', width: 548, height: 670, alt: 'Illustrated portrait of Ordinary Lancer' },
};

export const nav = {
  links: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Process', href: '#process' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  cta: { label: "Let's talk", href: '#contact' },
};

export const hero = {
  badge: 'Available for new projects · [MONTH 2026]',
  greeting: "Hey there, I'm Ordinary Lancer —", // non-breaking space keeps the dash on the same line
  headingLead: 'I turn your ideas into',
  // The last line of the H1 cycles through these.
  rotatingWords: ['real products.', 'MERN web apps.', 'SaaS dashboards.', 'fast websites.'],
  intro:
    'Full-stack developer for founders, startups and growing businesses. MERN stack, frontend and backend — I take your project from the first sketch to a live, working product.',
  primaryCta: { label: 'Start a project', href: '#contact' },
  secondaryCta: { label: 'See my work', href: '#work' },
  trust: ['Fixed quote before we start', 'Full source code is yours', 'Weekly progress updates'],
  stickyNote: ['Same person.', 'Bigger dreams…'],
  circleBadge: 'OPEN FOR WORK • BUILD • LEARN • GROW •',
};

export const skills = ['MERN STACK', 'REACT', 'NODE.JS', 'MONGODB', 'REST APIS', 'NEXT.JS', 'FULL-STACK', 'FRONTEND', 'BACKEND'];

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
    'No handoffs between five freelancers. One person owns your product from database to design — so it ships faster and stays consistent.',
  featured: {
    icon: 'box',
    note: 'my speciality',
    title: 'MERN Stack Web Apps',
    description:
      'Complete apps on MongoDB, Express, React and Node.js — dashboards, client portals, SaaS products, booking systems and internal tools.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
  // tone: 'light' (white card) or 'red' (brand card)
  items: [
    {
      icon: 'layout',
      tone: 'light',
      title: 'Frontend Development',
      description: 'Fast, responsive interfaces that look sharp on every screen and turn visitors into customers.',
      stack: 'React · Next.js · Tailwind CSS',
    },
    {
      icon: 'database',
      tone: 'light',
      title: 'Backend & APIs',
      description: 'Secure REST APIs, logins, payments, databases and third-party integrations that just work.',
      stack: 'Node.js · Express · REST · Auth',
    },
    {
      icon: 'globe',
      tone: 'red',
      title: 'Websites & Landing Pages',
      description: 'Business sites, portfolios and launch pages that load fast and are easy to find on Google.',
      stack: 'Responsive · SEO-ready · Fast',
    },
    {
      icon: 'code',
      tone: 'light',
      title: 'Full-Stack Products',
      description: 'Planning, design, build and deploy — your whole MVP or product, handled end to end.',
      stack: 'MVP · Deploy · Hosting',
    },
    {
      icon: 'wrench',
      tone: 'light',
      title: 'Fixes, Upgrades & Care',
      description: 'Bug fixes, new features, speed boosts and monthly support for an app you already have.',
      stack: 'Debugging · Features · Support',
    },
  ],
};

export const work = {
  eyebrow: "things I've built",
  heading: 'Selected work',
  filters: [
    { id: 'all', label: 'All' },
    { id: 'full', label: 'Full-stack' },
    { id: 'front', label: 'Frontend' },
    { id: 'back', label: 'Backend' },
  ],
  // kind must match a filter id. Set `image` to a screenshot path (e.g. '/work/project-1.jpg')
  // and replace each '#' link with the real URL.
  projects: [
    {
      kind: 'full',
      category: 'FULL-STACK · MERN',
      name: '[PROJECT NAME]',
      description: '[One line: what it does and who it is for.]',
      stack: 'MongoDB · Express · React · Node.js',
      image: null,
      links: { caseStudy: '#', live: '#', github: '#' },
    },
    {
      kind: 'front',
      category: 'FRONTEND · REACT',
      name: '[PROJECT NAME]',
      description: '[One line: what it does and who it is for.]',
      stack: 'React · Tailwind CSS',
      image: null,
      links: { caseStudy: '#', live: '#', github: '#' },
    },
    {
      kind: 'back',
      category: 'BACKEND · API',
      name: '[PROJECT NAME]',
      description: '[One line: what it does and who it is for.]',
      stack: 'Node.js · Express · MongoDB',
      image: null,
      links: { caseStudy: '#', live: '#', github: '#' },
    },
    {
      kind: 'full',
      category: 'FULL-STACK · SAAS',
      name: '[PROJECT NAME]',
      description: '[One line: what it does and who it is for.]',
      stack: 'Next.js · Node.js · MongoDB',
      image: null,
      links: { caseStudy: '#', live: '#', github: '#' },
    },
  ],
  screenshotPlaceholder: '[PROJECT SCREENSHOT]',
  nextCta: { text: 'Your project could be next here…', label: 'Start yours', href: '#contact' },
};

export const workflow = {
  eyebrow: "how we'll work",
  heading: 'Simple process. No surprises.',
  steps: [
    { title: 'Discuss', text: 'A free call about your idea, goals, budget and timeline.' },
    { title: 'Plan', text: 'Clear scope, milestones and a fixed quote in writing.' },
    { title: 'Build', text: 'Weekly demos you can click through and give feedback on.' },
    { title: 'Deliver', text: 'Tested, deployed and handed over with full source code.' },
    { title: 'Support', text: 'I stay around for fixes, updates and the next version.' },
  ],
};

export const about = {
  eyebrow: 'the person behind it',
  heading: { before: 'An ordinary developer with ', highlight: 'extraordinary', after: ' focus.' },
  paragraphs: [
    '[2–3 lines about you: your name, how you started coding, and the kind of clients you love working with.]',
    'I share what I learn about building and freelancing on LinkedIn — the wins, the mistakes and everything in between.',
  ],
  cta: { label: 'Follow my journey on LinkedIn', href: site.linkedin },
  // tone: 'red' | 'light' | 'dark'
  reasons: [
    { icon: 'chat', tone: 'red', title: 'Clear talk', text: 'Simple updates. No tech jargon.' },
    { icon: 'codeSimple', tone: 'light', title: 'Clean code', text: 'Built to grow, easy to hand over.' },
    { icon: 'clock', tone: 'light', title: 'On time', text: 'Milestones you can track every week.' },
    { icon: 'unlock', tone: 'dark', title: 'You own it', text: 'Code, design and data are yours.' },
  ],
  toolbox: {
    eyebrow: 'my toolbox',
    heading: 'Tech I work with',
    tools: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'Next.js', 'Tailwind CSS', 'REST APIs', 'Git & GitHub', '[ADD MORE]'],
  },
};

export const pricing = {
  eyebrow: 'honest pricing',
  heading: 'Pick a starting point',
  intro: 'Every project gets a fixed quote after our first call. These are typical starting prices.',
  plans: [
    {
      name: 'Starter',
      summary: 'Landing page or small business site',
      price: '[₹ ____]',
      unit: ' onwards',
      features: ['Up to [5] responsive pages', 'Contact form & basic SEO', 'Deployed on your domain'],
      cta: { label: 'Get a quote', href: '#contact' },
      featured: false,
    },
    {
      name: 'Product',
      summary: 'Full-stack MERN web app or MVP',
      price: '[₹ ____]',
      unit: ' onwards',
      features: ['Frontend, backend & database', 'Login, admin panel & APIs', 'Weekly demos + [30] days support'],
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
      a: 'A landing page usually takes [1–2 weeks]; a full web app [4–8 weeks]. You get a clear timeline with milestones before we start.',
    },
    {
      q: 'How do payments work?',
      a: '[50%] to start and the rest on delivery, or split into milestones for bigger projects. Everything is agreed in writing first.',
    },
    {
      q: 'Do I get the source code?',
      a: 'Yes. The code, design and data are fully yours — handed over on GitHub with simple docs.',
    },
    {
      q: 'Can you work on my existing app?',
      a: 'Absolutely. I can fix bugs, add features, speed things up or move your app to a better stack.',
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
  intro: "Tell me what you're planning. I reply within [24 HOURS] with next steps and a rough estimate.",
  form: {
    title: 'Tell me about your project',
    needs: [
      { id: 'web', label: 'Full-stack web app' },
      { id: 'site', label: 'Website' },
      { id: 'api', label: 'Backend / API' },
      { id: 'fix', label: 'Fix or upgrade' },
      { id: 'other', label: 'Something else' },
    ],
    defaultNeed: 'web',
    budgets: ['[RANGE 1]', '[RANGE 2]', '[RANGE 3]', 'Not sure yet'],
    submitLabel: 'Send message',
    successTitle: 'Message sent!',
    successText: "Thanks for reaching out — I'll get back to you within [24 HOURS].",
  },
};

export const footer = {
  blurb: 'Full-Stack Developer | Freelancer | Builder. Turning ideas into products, one ordinary day at a time.',
  columns: [
    {
      title: 'EXPLORE',
      links: [
        { label: 'Services', href: '#services' },
        { label: 'Work', href: '#work' },
        { label: 'Process', href: '#process' },
        { label: 'Pricing', href: '#pricing' },
      ],
    },
    {
      title: 'CONNECT',
      links: [
        { label: 'Email', href: `mailto:${site.email}` },
        { label: 'LinkedIn', href: site.linkedin },
        { label: 'Start a project', href: '#contact' },
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
