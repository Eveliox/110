export const finishes = [
    { slug: "epoxy-flake", name: "Epoxy flake", label: "Made for everyday life", image: "/gallery/epoxy-flake-1.jpg", description: "A textured, speckled finish that brings a clean, considered look to hardworking spaces.", uses: "Garages · Utility spaces · Commercial interiors", detail: "Choose a flake blend that complements your space, with a protective topcoat selected for how you use your floor. We’ll discuss surface condition, texture and maintenance before recommending a system.", gallery: ["/gallery/epoxy-flake-1.jpg", "/gallery/epoxy-flake-2.jpg", "/gallery/epoxy-flake-3.jpg"] },
    { slug: "metallic-epoxy", name: "Metallic epoxy", label: "Anything but ordinary", image: "/gallery/metallic-resin-4.jpg", description: "Flowing pigments, rich depth and a finish with a character all its own.", uses: "Living spaces · Showrooms · Retail interiors", detail: "Metallic pigments create movement and variation across the surface. Explore understated charcoal, contrasting silver or warm gold accents. Each application has its own character; photographs are inspiration, not an exact repeatable pattern.", gallery: ["/gallery/metallic-resin-4.jpg", "/gallery/metallic-resin-3.jpg", "/gallery/metallic-resin-1.jpg", "/gallery/metallic-resin-2.jpg"] },
    { slug: "polished-concrete", name: "Polished concrete", label: "The beauty in the base", image: "/gallery/concrete-grinding.jpg", description: "An understated concrete finish, with the slab itself at the center of the design.", uses: "Retail · Open-plan interiors · Workspaces", detail: "The starting condition of your concrete influences the finished look. Discuss aggregate exposure, sheen and the preparation your slab needs. The photograph shown here documents surface preparation, not a completed polished finish.", gallery: ["/gallery/concrete-grinding.jpg"] },
] as const;
export type Finish = (typeof finishes)[number];
export const projects = [
    { image: "/gallery/metallic-resin-4.jpg", name: "Silver & charcoal", type: "Metallic epoxy", note: "Fluid movement. Mirror-like depth." },
    { image: "/gallery/epoxy-flake-1.jpg", name: "A fresh start", type: "Epoxy flake", note: "A clean finish for a hardworking garage." },
    { image: "/gallery/metallic-resin-3.jpg", name: "A touch of gold", type: "Metallic epoxy", note: "Dark tones with warm metallic accents." },
    { image: "/gallery/epoxy-flake-3.jpg", name: "Everyday, elevated", type: "Epoxy flake", note: "Fine texture and a light, neutral palette." },
    { image: "/gallery/metallic-resin-1.jpg", name: "Smoke & silver", type: "Metallic epoxy", note: "A flowing charcoal metallic finish." },
    { image: "/gallery/epoxy-flake-2.jpg", name: "Room to work", type: "Epoxy flake", note: "A consistent finish across an open garage." },
    { image: "/gallery/metallic-resin-2.jpg", name: "Deep charcoal", type: "Metallic epoxy", note: "Subtle movement in a rich, dark surface." },
] as const;
export const steps = [
    ["Let’s talk floors.", "Tell us about your space, how you use it and the look you have in mind."],
    ["Start with the surface.", "Assess the concrete and plan the grinding, repairs and preparation it needs."],
    ["Bring it to life.", "Apply the selected finish, with attention to the edges, texture and final topcoat."],
    ["Make yourself at home.", "Review the finished floor and the care and cure guidance for your chosen system."],
] as const;
export const questions = [
    ["Which finish is right for my space?", "Start with how the space is used. Flake offers a textured, speckled look; metallic epoxy offers flowing color and visual depth; polished concrete highlights the existing slab. We can discuss the right approach for your surface and priorities."],
    ["Can you work with my existing concrete?", "The slab needs an assessment first. Existing coatings, cracks and moisture can affect preparation and system selection. Include photographs and any known issues in your project details."],
    ["How long will my project take?", "Timing depends on the size, preparation, coating system and site conditions. Installation and return-to-use guidance should be confirmed for your specific project before work begins."],
    ["How much does a new floor cost?", "Floor area, surface preparation, repairs and finish selection all affect the price. Share the approximate square footage and finish you like to start a project conversation."],
] as const;
