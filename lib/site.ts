export type FinishSlug = "epoxy-flake" | "metallic-epoxy" | "polished-concrete";

export type Spec = { label: string; value: string };
export type Faq = { q: string; a: string };

export type Finish = {
  slug: FinishSlug;
  name: string;
  blurb: string;
  lede: string;
  image: string;
  imageNeedsReplacement?: boolean;
  tags: string[];
  startsAt: string;
  leadTime: string;
  warranty: string;
  gallery: string[];
  specs: Spec[];
  faqs: Faq[];
  process: { n: string; title: string; body: string }[];
};

export type WorkItem = {
  src: string;
  alt: string;
  space: string;
  finish: string;
  category: "residential" | "commercial";
  featured?: boolean;
};

export type BeforeAfterItem = {
  before: string;
  after: string;
  label: string;
  finish: string;
};

export type Review = {
  author: string;
  avatarColor?: string;
  isLocalGuide?: boolean;
  stars: 1 | 2 | 3 | 4 | 5;
  timeAgo: string;
  text: string;
  project?: string;
  photos?: string[];
  googleUrl: string;
  placeholder?: boolean;
};

export type Stat = {
  value: number;
  display: string;
  label: string;
  sub?: string;
  placeholder?: boolean;
};

const commonProcess = [
  {
    n: "01",
    title: "Consult & Quote",
    body: "On-site walk-through, moisture test, and a line-item quote within one business day.",
  },
  {
    n: "02",
    title: "Surface Prep",
    body: "Diamond grinding or shot blasting — the step most contractors skip. We don't.",
  },
  {
    n: "03",
    title: "Coating Application",
    body: "Primer, body coat, decorative layer, topcoat. Each poured, worked, and inspected by owner.",
  },
  {
    n: "04",
    title: "Cure & Walkthrough",
    body: "Full cure, final inspection together, written workmanship warranty handed over.",
  },
];

const commonFaqs: Faq[] = [
  {
    q: "How long until I can walk / park on it?",
    a: "Walkable in 24 hours, light furniture at 48, vehicles and heavy loads at 72. Full chemical cure in 7 days.",
  },
  {
    q: "Do you prep the slab or just coat over the old finish?",
    a: "Every job starts with diamond grinding or shot blasting to open the pores. We never coat over paint, sealers, or glue — that's where failures start.",
  },
  {
    q: "What if there's moisture in the slab?",
    a: "We moisture-test on the quote visit. If vapor is high, we spec a moisture-mitigation primer before the body coat — no surprises later.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes — a written workmanship warranty handed to you at the walkthrough. Length varies by system (5–15 years).",
  },
  {
    q: "Can you match a color or sample I like?",
    a: "Chip blends and metallic pigments are custom-mixed. Bring a sample or a Pinterest board to the consult and we'll match it.",
  },
  {
    q: "Will it be slippery when wet?",
    a: "Standard topcoats meet ANSI A326.3 slip ratings. We add aluminum-oxide grit on request for garages, patios, and wet areas.",
  },
];

export const site = {
  name: "110% Coatings",
  tagline: "Floors built to give 110%.",
  owner: "Oswaldo",
  phoneDisplay: "(555) 123-4567",
  phoneHref: "tel:+15551234567",
  email: "hello@110coatings.com",
  city: "Your City, ST",
  serviceAreaDescription: "Serving the greater metro area",
  yearsInBusiness: "15+",
  yearFounded: 2010,
  copyrightYear: 2026,
  formspreeEndpoint: "https://formspree.io/f/REPLACE_ME",
  socials: {
    instagram: "https://instagram.com/REPLACE_ME",
    facebook: "https://facebook.com/REPLACE_ME",
    google: "https://g.page/REPLACE_ME",
  },
  hero: {
    poster: "/gallery/metallic-resin-1.jpg",
    video: "/hero/metallic.mp4",
    videoWebm: "/hero/metallic.webm",
    chip: "Lifetime-grade finish",
    alt: "Hand-poured metallic resin floor by 110% Coatings",
  },
  aboutImage: "/gallery/epoxy-flake-3.jpg",
  trustStrip: [
    "LICENSED & INSURED",
    "RESIDENTIAL",
    "COMMERCIAL",
    "FREE ESTIMATES",
  ],
  googleSummary: {
    rating: 4.9,
    count: 87,
    profileUrl: "https://g.page/REPLACE_ME",
    placeholder: true,
  },
  stats: [
    { value: 500, display: "500+", label: "Floors finished", sub: "since 2010", placeholder: true },
    { value: 10, display: "10-yr", label: "Workmanship warranty", sub: "written, in writing", placeholder: true },
    { value: 24, display: "24-hr", label: "Walkable", sub: "72 hr for vehicles", placeholder: false },
    { value: 100, display: "100%", label: "Owner on site", sub: "every pour, every job", placeholder: false },
  ] as Stat[],
  finishes: [
    {
      slug: "epoxy-flake",
      name: "Epoxy Flake",
      blurb: "Decorative chip systems that transform floors into durable, high-grip surfaces.",
      lede: "Custom-blended vinyl chips broadcast into a wet epoxy base, locked under a clear urethane topcoat. The toughest decorative floor you can walk on.",
      image: "/gallery/epoxy-flake-2.jpg",
      tags: ["Garages", "Basements", "Patios"],
      startsAt: "$6.50 / sq ft",
      leadTime: "1 day install, 3 days total",
      warranty: "10 years workmanship",
      gallery: [
        "/gallery/epoxy-flake-1.jpg",
        "/gallery/epoxy-flake-2.jpg",
        "/gallery/epoxy-flake-3.jpg",
      ],
      specs: [
        { label: "System", value: "3-coat epoxy + urethane topcoat" },
        { label: "Thickness", value: "40–60 mil" },
        { label: "Cure time", value: "24 hr walk · 72 hr vehicle" },
        { label: "Chemical resistance", value: "Oil, gas, hot tire, bleach" },
        { label: "Slip rating", value: "DCOF 0.6 (ANSI A326.3)" },
        { label: "Warranty", value: "10 years workmanship" },
        { label: "Lead time", value: "1 day install, 3 days total" },
        { label: "Starts at", value: "$6.50 / sq ft" },
      ],
      faqs: commonFaqs,
      process: commonProcess,
    },
    {
      slug: "metallic-epoxy",
      name: "Metallic Epoxy",
      blurb: "Fluid metallic pigments poured and worked by hand — no two floors ever look alike.",
      lede: "Metallic micas suspended in a self-leveling epoxy, then hand-worked with torches and brushes until the floor flows. Every pour is one-of-one.",
      image: "/gallery/metallic-resin-2.jpg",
      tags: ["Showrooms", "Lobbies", "Retail"],
      startsAt: "$9.00 / sq ft",
      leadTime: "1 day install, 4 days total",
      warranty: "7 years workmanship",
      gallery: [
        "/gallery/metallic-resin-1.jpg",
        "/gallery/metallic-resin-2.jpg",
        "/gallery/metallic-resin-3.jpg",
        "/gallery/metallic-resin-4.jpg",
      ],
      specs: [
        { label: "System", value: "Primer + metallic body + urethane topcoat" },
        { label: "Thickness", value: "60–100 mil" },
        { label: "Cure time", value: "24 hr walk · 96 hr vehicle" },
        { label: "Chemical resistance", value: "Oil, mild acids, cleaners" },
        { label: "Slip rating", value: "DCOF 0.42 (grit on request)" },
        { label: "Warranty", value: "7 years workmanship" },
        { label: "Lead time", value: "1 day install, 4 days total" },
        { label: "Starts at", value: "$9.00 / sq ft" },
      ],
      faqs: commonFaqs,
      process: commonProcess,
    },
    {
      slug: "polished-concrete",
      name: "Polished Concrete",
      blurb: "Diamond-ground and densified to a mirror sheen — the toughest low-maintenance floor.",
      lede: "Progressive diamond passes, lithium densifier, and a stain guard — no coating, just the slab itself. For warehouses, retail, and anywhere forklifts live.",
      image: "/gallery/metallic-resin-4.jpg",
      imageNeedsReplacement: true,
      tags: ["Warehouses", "Retail", "Industrial"],
      startsAt: "$4.50 / sq ft",
      leadTime: "2 days install, 2 days total",
      warranty: "5 years workmanship",
      gallery: [
        "/gallery/metallic-resin-4.jpg",
        "/gallery/metallic-resin-3.jpg",
      ],
      specs: [
        { label: "System", value: "Diamond-ground, densified, guarded" },
        { label: "Grit level", value: "400 / 800 / 1500 (client choice)" },
        { label: "Cure time", value: "Immediate walk · 24 hr forklift" },
        { label: "Chemical resistance", value: "Food-safe with guard applied" },
        { label: "Slip rating", value: "DCOF 0.45" },
        { label: "Warranty", value: "5 years workmanship" },
        { label: "Lead time", value: "2 days install, 2 days total" },
        { label: "Starts at", value: "$4.50 / sq ft" },
      ],
      faqs: commonFaqs,
      process: commonProcess,
    },
  ] as Finish[],
  work: [
    {
      src: "/gallery/metallic-resin-1.jpg",
      alt: "Hand-poured metallic resin floor in a great room",
      space: "Residential · Great room",
      finish: "Metallic Epoxy",
      category: "residential",
      featured: true,
    },
    {
      src: "/gallery/epoxy-flake-1.jpg",
      alt: "Decorative epoxy flake floor in a garage",
      space: "Residential · Garage",
      finish: "Epoxy Flake",
      category: "residential",
    },
    {
      src: "/gallery/metallic-resin-4.jpg",
      alt: "Finished metallic resin floor in a showroom",
      space: "Commercial · Showroom",
      finish: "Metallic Epoxy",
      category: "commercial",
    },
    {
      src: "/gallery/epoxy-flake-3.jpg",
      alt: "Flake floor with cabinetry",
      space: "Residential · Basement",
      finish: "Epoxy Flake",
      category: "residential",
    },
    {
      src: "/gallery/metallic-resin-3.jpg",
      alt: "Poured metallic surface in retail",
      space: "Commercial · Retail",
      finish: "Metallic Epoxy",
      category: "commercial",
    },
    {
      src: "/gallery/epoxy-flake-2.jpg",
      alt: "Epoxy flake floor close-up",
      space: "Residential · Garage",
      finish: "Epoxy Flake",
      category: "residential",
    },
    {
      src: "/gallery/metallic-resin-2.jpg",
      alt: "Metallic finish in a lobby",
      space: "Commercial · Lobby",
      finish: "Metallic Epoxy",
      category: "commercial",
    },
  ] as WorkItem[],
  beforeAfters: [
    {
      before: "/gallery/before-after-1.jpg",
      after: "/gallery/epoxy-flake-1.jpg",
      label: "Garage · Flake",
      finish: "Epoxy Flake",
    },
    {
      before: "/gallery/before-after-2.jpg",
      after: "/gallery/metallic-resin-2.jpg",
      label: "Showroom · Metallic",
      finish: "Metallic Epoxy",
    },
  ] as BeforeAfterItem[],
  process: commonProcess,
  reviews: [
    {
      author: "Carla M.",
      avatarColor: "#FF1AA3",
      isLocalGuide: true,
      stars: 5,
      timeAgo: "2 months ago",
      text: "Prep was no joke — ground the whole slab before they touched a drop of resin. Floor looks poured, not painted. Oswaldo kept us in the loop the whole time.",
      project: "Residential · Garage",
      googleUrl: "https://g.page/REPLACE_ME",
      placeholder: true,
    },
    {
      author: "Devon R.",
      avatarColor: "#7B2CF5",
      stars: 5,
      timeAgo: "4 months ago",
      text: "Oswaldo walked the slab with me and flagged two moisture spots the other bid missed. We're not having re-do issues. Showroom floor is a conversation piece.",
      project: "Commercial · Showroom",
      googleUrl: "https://g.page/REPLACE_ME",
      placeholder: true,
    },
    {
      author: "Priya S.",
      avatarColor: "#0B0B0D",
      isLocalGuide: true,
      stars: 5,
      timeAgo: "6 months ago",
      text: "Clean crew, clean mobilization, clean floor. Worth every penny — and the written warranty gave us peace of mind. Would hire again for the office.",
      project: "Residential · Basement",
      googleUrl: "https://g.page/REPLACE_ME",
      placeholder: true,
    },
  ] as Review[],
};
