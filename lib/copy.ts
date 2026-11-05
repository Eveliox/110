import { finishes as finishData, projects as projectData, questions as questionData, steps as stepData } from "./design";
import { floorSystems, lightingStops, roomNames, sheenNames } from "./floor-studio";

// Every visible string on the site, in English and Miami/LatAm Spanish ("usted", sentence case,
// opening ¿ ¡, accents on capitals). Data lists line up by index with lib/design and lib/floor-studio.
export type Lang = "en" | "es";
export const langs: Lang[] = ["en", "es"];

/** The same page in the given language: English lives at /, Spanish under /es. */
export function localePath(lang: Lang, href: string) {
  if (lang === "en" || !href.startsWith("/")) return href;
  if (href === "/") return "/es";
  return href.startsWith("/#") ? `/es${href.slice(1)}` : `/es${href}`;
}

/** The current path, moved to the other language. */
export function switchPath(pathname: string, to: Lang) {
  const bare = pathname === "/es" ? "/" : pathname.startsWith("/es/") ? pathname.slice(3) : pathname;
  return localePath(to, bare);
}

const nbsp = " ";

type FinishText = { name: string; label: string; description: string; uses: string; detail: string };
type ProjectText = { name: string; type: string; note: string };

const en = {
  lang: "en" as Lang,
  locale: "en-US",
  sqft: "sq ft",
  nav: {
    skip: "Skip to content", home: "110% Coatings home", main: "Main navigation", mobile: "Mobile navigation", open: "Open menu", close: "Close menu",
    finishes: "Our finishes", work: "Our work", studio: "Floor studio", process: "The process", about: "About us", homeLink: "Home",
    talk: "Let’s talk floors", plan: "Plan your project",
    other: "Español", otherLabel: "Ver este sitio en español", otherLang: "es" as Lang,
  },
  bar: { quick: "Quick navigation", finishes: "Finishes", studio: "Floor studio", work: "Our work", process: "Process", quote: "Get a quote", quoteShort: "Get a quote", dmTitle: "DM us on Instagram" },
  contact: {
    lead: (name: string) => `Rather talk it through? Call, text or DM ${name} directly.`,
    call: (phone: string) => `Call ${phone}`, text: "Text", textLabel: (phone: string) => `Text ${phone}`,
    dm: (handle: string) => `DM @${handle}`, dmLabel: (handle: string) => `Send @${handle} a DM on Instagram`,
  },
  hero: {
    meta: ["110% COATINGS", "CRAFT / COLOR / CONCRETE"], overline: "A DIFFERENT KIND OF FLOOR COMPANY",
    title: ["We create surfaces", "that change the", "way you feel."], cta: "Start your transformation",
    taglines: [["Made for your space.", "Built around your vision."], ["Design-led finishes.", "Detail-driven application."], ["Residential, commercial,", "and anything but ordinary."]],
    scroll: "Explore selected work",
  },
  showcase: {
    overline: "SELECTED WORK", photo: "ORIGINAL PROJECT PHOTOGRAPH", explore: (name: string, type: string) => `Explore ${name}: ${type}`,
    prev: "Previous project", next: "Next project", all: "Discover all projects",
  },
  library: {
    eyebrow: "02 / THE MATERIAL LIBRARY", title: ["For spaces that", "deserve more."],
    intro: "Your floor sets the tone for everything above it. Explore a finish that makes the space yours.",
    adviceQ: "Not sure where to begin?", adviceLink: "Try the floor studio.",
    prepAlt: "Concrete surface preparation in progress", photoAlt: (name: string) => `${name} floor coating`, prepLabel: "SURFACE PREPARATION IN PROGRESS",
    collections: ["THE FLAKE COLLECTION", "THE METALLIC COLLECTION", "THE CONCRETE COLLECTION"], explore: "Explore finish",
    deck: "Explore floor finishes", stamp: "110% · 4×4 SAMPLE",
    tiltPointer: "Move your cursor to tilt the sample under the light.", tiltTouch: "Tilt your phone to catch the light",
  },
  squeegee: {
    eyebrow: "03 / THE TRANSFORMATION", title: ["Pull the coat", "across the slab."],
    intro: ["Drag across the bare concrete to squeegee on the finish.", "One of our rooms, before and after."],
    canvas: "Interactive before and after of one of our projects: a bare, dusty concrete slab that becomes a glossy blue and white metallic epoxy floor as you drag across it.",
    before: "Raw slab", after: "Metallic epoxy", cue: "Drag to pull the coat",
    cured: "100% coated · Cured", coated: (n: number) => `${n}% coated`, finish: "Finish the coat", reset: "Back to bare concrete",
    caption: "Original project photographs. Same room, before and after.",
  },
  process: { eyebrow: "04 / BEHIND THE SURFACE", title: ["Exceptional is", "in the details."], intro: ["A considered process.", "From your first idea to the final walkthrough."] },
  about: {
    alt: "Concrete grinding equipment preparing the surface before coating", label: "THE WORK BENEATH THE FINISH",
    eyebrow: "The 110% approach", title: ["Beauty on the surface.", "Precision beneath it."],
    body: ["A beautiful floor is the result of more than a color choice. It starts with understanding the space, preparing the surface and giving the small details the attention they deserve.", "That’s the thinking behind 110% Coatings. Thoughtful finishes for homes, garages and places of business."],
    points: ["A finish that fits your space", "Care from preparation to completion"], link: "Tell us what you have in mind",
  },
  faq: { eyebrow: "A little clarity", title: "Before we begin." },
  quote: {
    eyebrow: "Your space. Your next step.", title: ["Your space.", "Reimagined."],
    intro: "Have a space in mind? Tell us a little about it. Let’s find the right finish for your next chapter.",
    note: ["Start with the basics.", "We’ll take it from there."],
    heading: "Let’s talk about your project.", step: "01 / THE DETAILS",
    sampleRequested: "Free 4×4 sample requested", studioChoice: "Your floor studio selection", removeChoice: "Remove floor studio selection",
    name: "Your name", namePh: "First and last name", email: "Email address", emailPh: "you@example.com",
    phone: "Phone", optional: "(optional)", phonePh: "Your phone number", zip: "Project ZIP code", zipPh: "e.g. 33131",
    finish: "Finish you’re considering", finishPh: "Select a finish", helpChoose: "Help me choose",
    size: "Square footage", sizePh: "e.g. 450 · a guess is fine",
    details: "A little about your space", detailsPh: "A garage refresh? A new showroom? Tell us what you’re thinking.",
    sending: "Sending…", send: "Request a conversation", save: "Save my project brief",
    privacy: "Your details will only be used to discuss your project.",
    closed: (name: string) => `Online inquiries are not open yet. Save your details as a project brief, or call, text or DM ${name} to get started.`,
    briefTitle: "110% COATINGS — PROJECT BRIEF", briefFooter: "This brief has been saved to your device. It has not been submitted.", briefFile: "110-coatings-project-brief.txt",
    briefReady: "Your project brief is ready. It was saved to your device, not submitted.",
    sent: "Thank you. Your project details have been sent.", failed: "Your request could not be sent. Your details are still here so you can try again.",
  },
  footer: { tagline: ["A better floor.", "A whole new feeling."], explore: "Explore finishes", work: "See our work", plan: "Plan your project", kind: "Residential & commercial floor finishes", top: "Back to top ↑", credit: "Site by Azul" },
  workPage: {
    eyebrow: "The project collection", title: ["Real spaces.", "Remarkable floors."], intro: "Explore the textures, movement and details in our original job photographs.",
    compareEyebrow: "A change in perspective", compareTitle: "Before meets after.", compareIntro: ["The original project comparisons.", "Same space. A different feeling."],
    compareAlt: ["Original stacked before and after comparison of a garage flake floor", "Original stacked before and after comparison of a blue metallic floor"],
    compareCaption: ["Garage transformation / Epoxy flake", "Surface transformation / Metallic epoxy"],
  },
  gallery: {
    all: "All finishes", filter: "Filter projects", count: (n: number) => `${n} projects`, view: (name: string) => `View ${name}`,
    close: "Close photograph", prev: "Previous photograph", next: "Next photograph",
  },
  finishPage: {
    back: "← All finishes", plan: (name: string) => `Plan a ${name.toLowerCase()} floor`, prepAlt: "Concrete grinding and surface preparation",
    photoAlt: (name: string) => `${name} original project photograph`, eyebrow: "The details, up close", slab: "It starts with the slab.", inspire: "Find your inspiration.",
    open: (name: string, n: number) => `Open original ${name} photo ${n}`, galleryAlt: (name: string, prep: boolean, n: number) => `${name} ${prep ? "preparation" : "finish"}, photograph ${n}`,
  },
  studio: {
    eyebrow: "NOT SURE WHAT TO CHOOSE?", title: ["See the possibilities.", "Find your floor."], intro: ["Try a finish. Change the light. Look around.", "A little inspiration before the real transformation."],
    modes: "Preview mode", room: "3D Studio", photo: "Try in my photo", walk: "Walk the room", overview: "Overview", reset: "Reset view",
    play: "Play install", stop: "Stop", share: "Share", shareLabel: "Share this look", save: "Save preview",
    camera: "Camera controls", cameraHint: "Adjust your perspective", rotate: "Rotate", height: "Height", zoom: "Zoom",
    chooseFinish: "Choose a finish", chooseBlend: "Explore a color blend", scene: "Set the scene", space: "Space", sheen: "Sheen", lighting: "Lighting", timeOfDay: "Time of day",
    wearing: "The whole site is now wearing", wearReset: "Back to 110% colors", wearHint: "Pick a blend and the whole site will wear it.",
    wornName: (color: string, system: string) => `${color} ${system.toLowerCase()}`,
    estimate: "Ballpark the price", yourSize: "Your floor size", sqftLabel: "Square footage", sqftHint: "Optional. Type your real size and we'll include it with your request.", sqftPh: (n: number) => `e.g. ${n}`,
    measure: "Don't know it? Measure length × width", length: "Length (ft)", width: "Width (ft)", measured: (n: string) => `= ${n} sq ft`, area: "Floor area", areaLabel: "Floor area in square feet", installed: (name: string) => `${name}, installed`,
    samplePrices: "Sample prices · only shown in development", estimateNote: "A ballpark, not a quote. Slab condition, repairs and prep set the final price after a free site visit.",
    like: "I like this look", sample: "Request a free 4×4 sample",
    disclaimer: "A design concept, not an exact product sample. Patterns, color, sheen, and availability are confirmed with your project consultation.",
    used: "Your selected look has been added to the project form below.", sampleSet: "We've prefilled the form for a free 4×4 sample — just add your address.",
    shareTitle: "110% Coatings · Floor Studio", shared: "Shared.", copied: "Shareable link copied — paste it anywhere.", copyThis: (url: string) => `Copy this link: ${url}`,
    playing: "Playing a 110% install — bare concrete to sealed topcoat.", walking: "Walk mode on — W/A/S/D to move, drag to look. Toggle off to orbit.",
    downloaded: "Your concept preview has been downloaded.", noExport: "Image saving needs 3D support in your browser. You can still use this design in your project brief.",
    preparing: "Preparing your room preview…", loading: "LOADING PREVIEW", loadingShort: "Loading…", live: "LIVE 3D PREVIEW", walkBadge: "WALK MODE · W/A/S/D",
    orbitHint: "Drag to look around · or use the camera controls", walkHint: "Drag to look · W/A/S/D or arrows to walk",
    installHeading: "THE TRANSFORMATION", installNote: "Illustrative time-lapse · Application and cure times vary",
    install: (system: number) => system === 2
      ? ["Prepare & grind", "Refine the surface", "Polish the concrete", "Seal & reveal"]
      : ["Prepare & grind", "Prime & base coat", system === 1 ? "Broadcast the flakes" : "Flow the metallic pigment", "Seal & reveal"],
    exportTitle: "110% COATINGS / FLOOR STUDIO", exportNote: "Illustrative concept. Confirm final color, pattern and sheen with a physical sample.", exportFile: "110-coatings-floor-concept.png",
  },
  photo: {
    drop: "Drop a photo of your space", dropHint: "Garage, basement, living room — JPG or PNG, usually from your phone camera.",
    dropNote: "We find your floor and lay your chosen finish on it, right on your device. Your photo is never uploaded.",
    handles: "Drag the numbered handles to the four corners of your floor", corners: "Drag the four handles to the corners of your floor.",
    notImage: "That doesn't look like an image. Try a JPG or PNG.", loadFailed: "Couldn't open that image. If it's an iPhone HEIC photo, send it to yourself as a JPG or take a screenshot of it, then try again.",
    saved: "Saved. Share it with whoever needs to see it.", shareTitle: "My 110% Coatings floor", shared: "Shared.",
    another: "Use a different photo", share: "Share", save: "Save my photo", composed: "composed in Floor Studio",
    detecting: (percent: number) => `Loading floor detection · ${percent}%`, finding: "Finding your floor…", detected: "Floor detected",
    found: "We found your floor. Drag the handles to fine-tune it.",
    detectFailed: "Automatic floor detection isn't available on this device. Drag the handles to the corners of your floor.",
  },
  ar: {
    open: "View on my floor", opening: "Opening…", failed: "Couldn't start AR on this device. You can still try the finish in your own photo.",
    place: "Point at your floor, then tap to place a 3 m square. Tap again to move it.", leave: "Leave AR", done: "Done",
  },
  card: { designedFor: (room: string) => `Designed for a ${room.toLowerCase()}`, see: "See it in 3D →", shareDescription: (sheen: string, room: string) => `${sheen} finish for a ${room.toLowerCase()}. Open it in the 110% Coatings Floor Studio and look around in 3D.` },
  meta: {
    title: "110% Coatings | Epoxy & Metallic Floors in Miami",
    description: "Epoxy flake, metallic epoxy and polished concrete floors for homes and businesses across Miami and South Florida. See the work, design your floor in 3D, and call or text for a free estimate.",
    workTitle: "Our work | Epoxy floors in Miami | 110% Coatings", workDescription: "Original photographs of epoxy flake and metallic epoxy floors installed by 110% Coatings in Miami and South Florida.",
    finishTitle: (name: string) => `${name} floors in Miami | 110% Coatings`, notFound: "Finish not found",
  },
  // Data, in English as written in lib/design and lib/floor-studio.
  finishes: finishData.map(({ name, label, description, uses, detail }): FinishText => ({ name, label, description, uses, detail })),
  projects: projectData.map(({ name, type, note }): ProjectText => ({ name, type, note })),
  steps: stepData.map(([title, text]) => [title, text] as [string, string]),
  questions: questionData.map(([q, a]) => [q, a] as [string, string]),
  systems: floorSystems.map(s => ({ name: s.name as string, description: s.description as string, colors: s.colors.map(c => c.name as string) })),
  rooms: [...roomNames] as string[],
  sheens: [...sheenNames] as string[],
  lighting: lightingStops.map(s => s.label as string),
  am: "AM", pm: "PM",
};

export type Copy = typeof en;

const es: Copy = {
  lang: "es",
  locale: "es-US",
  sqft: "pies²",
  nav: {
    skip: "Saltar al contenido", home: "Inicio de 110% Coatings", main: "Navegación principal", mobile: "Navegación móvil", open: "Abrir menú", close: "Cerrar menú",
    finishes: "Acabados", work: "Proyectos", studio: "Estudio de pisos", process: "El proceso", about: "Nosotros", homeLink: "Inicio",
    talk: "Hablemos de pisos", plan: "Planee su proyecto",
    other: "English", otherLabel: "View this site in English", otherLang: "en",
  },
  bar: { quick: "Navegación rápida", finishes: "Acabados", studio: "Estudio", work: "Proyectos", process: "Proceso", quote: "Cotización gratis", quoteShort: "Cotizar", dmTitle: "Escríbanos por Instagram" },
  contact: {
    lead: name => `¿Prefiere conversarlo? Llame, envíe un texto o escríbale a ${name} directamente.`,
    call: phone => `Llamar al ${phone}`, text: "Texto", textLabel: phone => `Enviar un texto al ${phone}`,
    dm: handle => `DM @${handle}`, dmLabel: handle => `Enviar un DM a @${handle} en Instagram`,
  },
  hero: {
    meta: ["110% COATINGS", "OFICIO / COLOR / CONCRETO"], overline: "UNA EMPRESA DE PISOS DIFERENTE",
    title: ["Creamos superficies", "que cambian cómo", `se siente su${nbsp}espacio.`], cta: "Comience su transformación",
    taglines: [["Hecho para su espacio.", "Pensado para su visión."], ["Acabados con diseño.", "Aplicación al detalle."], ["Residencial, comercial", "y nada ordinario."]],
    scroll: "Ver proyectos destacados",
  },
  showcase: {
    overline: "PROYECTOS DESTACADOS", photo: "FOTO ORIGINAL DEL PROYECTO", explore: (name, type) => `Ver ${name}: ${type}`,
    prev: "Proyecto anterior", next: "Proyecto siguiente", all: "Ver todos los proyectos",
  },
  library: {
    eyebrow: "02 / LA MATERIOTECA", title: ["Para espacios que", `merecen${nbsp}más.`],
    intro: "Su piso marca el tono de todo lo que está encima. Descubra un acabado que haga suyo el espacio.",
    adviceQ: "¿No sabe por dónde empezar?", adviceLink: "Pruebe el estudio de pisos.",
    prepAlt: "Preparación de la superficie de concreto en proceso", photoAlt: name => `Recubrimiento de piso: ${name.toLowerCase()}`, prepLabel: "PREPARACIÓN DE SUPERFICIE EN PROCESO",
    collections: ["COLECCIÓN HOJUELAS", "COLECCIÓN METÁLICA", "COLECCIÓN CONCRETO"], explore: "Ver acabado",
    deck: "Explore los acabados de piso", stamp: "110% · MUESTRA 4×4",
    tiltPointer: "Mueva el cursor para inclinar la muestra bajo la luz.", tiltTouch: "Incline su teléfono para ver el brillo",
  },
  squeegee: {
    eyebrow: "03 / LA TRANSFORMACIÓN", title: ["Extienda la capa", "sobre el concreto."],
    intro: ["Deslice sobre el concreto para aplicar el acabado.", "Uno de nuestros espacios, antes y después."],
    canvas: "Antes y después interactivo de uno de nuestros proyectos: una losa de concreto desnuda y polvorienta que se convierte en un piso de epóxico metálico azul y blanco, con brillo, a medida que desliza sobre ella.",
    before: "Concreto crudo", after: "Epóxico metálico", cue: "Deslice para aplicar la capa",
    cured: "100% cubierto · Curado", coated: n => `${n}% cubierto`, finish: "Terminar la capa", reset: "Volver al concreto",
    caption: "Fotos originales del proyecto. El mismo espacio, antes y después.",
  },
  process: { eyebrow: "04 / DETRÁS DE LA SUPERFICIE", title: ["Lo excepcional", "está en los detalles."], intro: ["Un proceso bien pensado.", "Desde su primera idea hasta la entrega final."] },
  about: {
    alt: "Equipo de pulido preparando la superficie de concreto antes del recubrimiento", label: "EL TRABAJO DEBAJO DEL ACABADO",
    eyebrow: "El enfoque 110%", title: ["Belleza en la superficie.", "Precisión debajo."],
    body: ["Un piso hermoso es más que la elección de un color. Empieza por entender el espacio, preparar la superficie y darle a cada detalle la atención que merece.", "Esa es la idea detrás de 110% Coatings: acabados bien pensados para hogares, garajes y negocios."],
    points: ["Un acabado a la medida de su espacio", "Cuidado desde la preparación hasta la entrega"], link: "Cuéntenos lo que tiene en mente",
  },
  faq: { eyebrow: "Un poco de claridad", title: "Antes de empezar." },
  quote: {
    eyebrow: "Su espacio. Su próximo paso.", title: ["Su espacio.", "Renovado."],
    intro: "¿Tiene un espacio en mente? Cuéntenos un poco. Encontremos el acabado ideal para su próxima etapa.",
    note: ["Empiece por lo básico.", "Nosotros nos encargamos del resto."],
    heading: "Hablemos de su proyecto.", step: "01 / LOS DETALLES",
    sampleRequested: "Muestra gratis de 4×4 solicitada", studioChoice: "Su selección del estudio de pisos", removeChoice: "Quitar la selección del estudio",
    name: "Su nombre", namePh: "Nombre y apellido", email: "Correo electrónico", emailPh: "usted@ejemplo.com",
    phone: "Teléfono", optional: "(opcional)", phonePh: "Su número de teléfono", zip: "Código postal del proyecto", zipPh: "p. ej. 33131",
    finish: "Acabado que está considerando", finishPh: "Elija un acabado", helpChoose: "Ayúdenme a elegir",
    size: "Pies cuadrados", sizePh: "p. ej. 450 · un estimado está bien",
    details: "Cuéntenos sobre su espacio", detailsPh: "¿Renovar el garaje? ¿Un showroom nuevo? Cuéntenos su idea.",
    sending: "Enviando…", send: "Solicitar una conversación", save: "Guardar el resumen de mi proyecto",
    privacy: "Sus datos solo se usarán para hablar de su proyecto.",
    closed: name => `Las solicitudes en línea aún no están abiertas. Guarde sus datos como resumen del proyecto, o llame, envíe un texto o escríbale a ${name} para empezar.`,
    briefTitle: "110% COATINGS — RESUMEN DEL PROYECTO", briefFooter: "Este resumen se guardó en su dispositivo. No se ha enviado.", briefFile: "110-coatings-resumen-del-proyecto.txt",
    briefReady: "Su resumen está listo. Se guardó en su dispositivo; no se envió.",
    sent: "Gracias. Recibimos los detalles de su proyecto.", failed: "No pudimos enviar su solicitud. Sus datos siguen aquí para que lo intente de nuevo.",
  },
  footer: { tagline: ["Un mejor piso.", "Una sensación nueva."], explore: "Ver acabados", work: "Ver proyectos", plan: "Planee su proyecto", kind: "Acabados de pisos residenciales y comerciales", top: "Volver arriba ↑", credit: "Sitio por Azul" },
  workPage: {
    eyebrow: "La colección de proyectos", title: ["Espacios reales.", "Pisos extraordinarios."], intro: "Explore las texturas, el movimiento y los detalles en las fotos originales de nuestros trabajos.",
    compareEyebrow: "Un cambio de perspectiva", compareTitle: "El antes y el después.", compareIntro: ["Las comparaciones originales del proyecto.", "El mismo espacio. Otra sensación."],
    compareAlt: ["Comparación original de antes y después de un piso de hojuelas en un garaje", "Comparación original de antes y después de un piso metálico azul"],
    compareCaption: ["Transformación de garaje / Epóxico con hojuelas", "Transformación de superficie / Epóxico metálico"],
  },
  gallery: {
    all: "Todos los acabados", filter: "Filtrar proyectos", count: n => `${n} proyectos`, view: name => `Ver ${name}`,
    close: "Cerrar foto", prev: "Foto anterior", next: "Foto siguiente",
  },
  finishPage: {
    back: "← Todos los acabados", plan: name => `Planee un piso de ${name.toLowerCase()}`, prepAlt: "Pulido y preparación de la superficie de concreto",
    photoAlt: name => `${name}: foto original del proyecto`, eyebrow: "Los detalles, de cerca", slab: "Todo empieza por la losa.", inspire: "Encuentre su inspiración.",
    open: (name, n) => `Abrir la foto original ${n} de ${name.toLowerCase()}`, galleryAlt: (name, prep, n) => `${name}, ${prep ? "preparación" : "acabado"}, foto ${n}`,
  },
  studio: {
    eyebrow: "¿NO SABE QUÉ ELEGIR?", title: ["Vea las posibilidades.", "Encuentre su piso."], intro: ["Pruebe un acabado. Cambie la luz. Mire alrededor.", "Un poco de inspiración antes de la transformación real."],
    modes: "Modo de vista", room: "Estudio 3D", photo: "Probar en mi foto", walk: "Recorrer el espacio", overview: "Vista general", reset: "Restablecer vista",
    play: "Ver instalación", stop: "Detener", share: "Compartir", shareLabel: "Compartir este diseño", save: "Guardar imagen",
    camera: "Controles de cámara", cameraHint: "Ajuste la perspectiva", rotate: "Girar", height: "Altura", zoom: "Zoom",
    chooseFinish: "Elija un acabado", chooseBlend: "Explore una mezcla de color", scene: "Prepare la escena", space: "Espacio", sheen: "Brillo", lighting: "Iluminación", timeOfDay: "Hora del día",
    wearing: "Todo el sitio ahora luce", wearReset: "Volver a los colores de 110%", wearHint: "Elija una mezcla y todo el sitio la lucirá.",
    wornName: (color, system) => `${system} ${color.toLowerCase()}`,
    estimate: "Precio aproximado", yourSize: "El tamaño de su piso", sqftLabel: "Pies cuadrados", sqftHint: "Opcional. Escriba el tamaño real y lo incluimos con su solicitud.", sqftPh: n => `p. ej. ${n}`,
    measure: "¿No lo sabe? Mida largo × ancho", length: "Largo (pies)", width: "Ancho (pies)", measured: n => `= ${n} pies²`, area: "Área del piso", areaLabel: "Área del piso en pies cuadrados", installed: name => `${name}, instalado`,
    samplePrices: "Precios de ejemplo · solo en desarrollo", estimateNote: "Un estimado, no una cotización. La condición de la losa, las reparaciones y la preparación definen el precio final tras una visita gratis.",
    like: "Me gusta este diseño", sample: "Pedir una muestra gratis de 4×4",
    disclaimer: "Un concepto de diseño, no una muestra exacta del producto. El patrón, el color, el brillo y la disponibilidad se confirman en la consulta de su proyecto.",
    used: "Agregamos el diseño que eligió al formulario de abajo.", sampleSet: "Preparamos el formulario para una muestra gratis de 4×4; solo agregue su dirección.",
    shareTitle: "110% Coatings · Estudio de pisos", shared: "Compartido.", copied: "Enlace copiado; péguelo donde quiera.", copyThis: url => `Copie este enlace: ${url}`,
    playing: "Viendo una instalación 110%: del concreto desnudo a la capa final sellada.", walking: "Modo recorrido: W/A/S/D para moverse, arrastre para mirar. Desactívelo para girar.",
    downloaded: "Se descargó la imagen de su diseño.", noExport: "Para guardar la imagen, su navegador necesita soporte 3D. Aún puede usar este diseño en el resumen de su proyecto.",
    preparing: "Preparando la vista de su espacio…", loading: "CARGANDO VISTA", loadingShort: "Cargando…", live: "VISTA 3D EN VIVO", walkBadge: "MODO RECORRIDO · W/A/S/D",
    orbitHint: "Arrastre para mirar alrededor · o use los controles de cámara", walkHint: "Arrastre para mirar · W/A/S/D o flechas para caminar",
    installHeading: "LA TRANSFORMACIÓN", installNote: "Time-lapse ilustrativo · Los tiempos de aplicación y curado varían",
    install: system => system === 2
      ? ["Preparar y pulir", "Refinar la superficie", "Pulir el concreto", "Sellar y revelar"]
      : ["Preparar y pulir", "Imprimación y capa base", system === 1 ? "Esparcir las hojuelas" : "Verter el pigmento metálico", "Sellar y revelar"],
    exportTitle: "110% COATINGS / ESTUDIO DE PISOS", exportNote: "Concepto ilustrativo. Confirme el color, el patrón y el brillo finales con una muestra física.", exportFile: "110-coatings-concepto-de-piso.png",
  },
  photo: {
    drop: "Suba una foto de su espacio", dropHint: "Garaje, sótano, sala — JPG o PNG, normalmente desde la cámara de su teléfono.",
    dropNote: "Encontramos su piso y le aplicamos el acabado que eligió, en su propio dispositivo. Su foto nunca se sube.",
    handles: "Arrastre los puntos numerados a las cuatro esquinas de su piso", corners: "Arrastre los cuatro puntos a las esquinas de su piso.",
    notImage: "Eso no parece una imagen. Pruebe con un JPG o PNG.", loadFailed: "No pudimos abrir esa imagen. Si es una foto HEIC de iPhone, envíesela como JPG o tómele una captura de pantalla y vuelva a intentarlo.",
    saved: "Guardada. Compártala con quien necesite verla.", shareTitle: "Mi piso de 110% Coatings", shared: "Compartida.",
    another: "Usar otra foto", share: "Compartir", save: "Guardar mi foto", composed: "creada en el Estudio de pisos",
    detecting: percent => `Cargando la detección del piso · ${percent}%`, finding: "Buscando su piso…", detected: "Piso detectado",
    found: "Encontramos su piso. Arrastre los puntos para ajustarlo.",
    detectFailed: "La detección automática del piso no está disponible en este dispositivo. Arrastre los puntos a las esquinas de su piso.",
  },
  ar: {
    open: "Ver en mi piso", opening: "Abriendo…", failed: "No se pudo iniciar la realidad aumentada en este dispositivo. Aún puede probar el acabado en su propia foto.",
    place: "Apunte a su piso y toque para colocar un cuadrado de 3 m. Toque de nuevo para moverlo.", leave: "Salir de la realidad aumentada", done: "Listo",
  },
  card: { designedFor: room => `Diseñado para: ${room.toLowerCase()}`, see: "Véalo en 3D →", shareDescription: (sheen, room) => `Acabado ${sheen.toLowerCase()} para: ${room.toLowerCase()}. Ábralo en el estudio de pisos de 110% Coatings y mire alrededor en 3D.` },
  meta: {
    title: "110% Coatings | Pisos epóxicos y metálicos en Miami",
    description: "Pisos epóxicos con hojuelas, epóxico metálico y concreto pulido para hogares y negocios en Miami y el sur de la Florida. Vea nuestros trabajos, diseñe su piso en 3D y llame o envíe un texto para una cotización gratis.",
    workTitle: "Proyectos | Pisos epóxicos en Miami | 110% Coatings", workDescription: "Fotos originales de pisos epóxicos con hojuelas y epóxico metálico instalados por 110% Coatings en Miami y el sur de la Florida.",
    finishTitle: name => `${name} en Miami | 110% Coatings`, notFound: "Acabado no encontrado",
  },
  finishes: [
    { name: "Epóxico con hojuelas", label: "Hecho para el día a día", description: "Un acabado texturizado y moteado que le da un aspecto limpio y cuidado a los espacios de mucho uso.", uses: "Garajes · Áreas de servicio · Interiores comerciales", detail: "Elija una mezcla de hojuelas que complemente su espacio, con una capa protectora pensada para el uso que le dará a su piso. Antes de recomendar un sistema, hablamos de la condición de la superficie, la textura y el mantenimiento." },
    { name: "Epóxico metálico", label: "Nada ordinario", description: "Pigmentos que fluyen, profundidad y un acabado con carácter propio.", uses: "Salas · Showrooms · Tiendas", detail: "Los pigmentos metálicos crean movimiento y variación en toda la superficie. Explore un carbón discreto, un plateado de contraste o acentos dorados cálidos. Cada aplicación tiene su propio carácter; las fotos son inspiración, no un patrón exacto que se pueda repetir." },
    { name: "Concreto pulido", label: "La belleza de la base", description: "Un acabado de concreto discreto, con la losa misma como centro del diseño.", uses: "Tiendas · Espacios abiertos · Áreas de trabajo", detail: "La condición inicial de su concreto influye en el aspecto final. Hablemos de la exposición del agregado, el brillo y la preparación que necesita su losa. La foto muestra la preparación de la superficie, no un acabado pulido terminado." },
  ],
  projects: [
    { name: "Plata y carbón", type: "Epóxico metálico", note: "Movimiento fluido. Profundidad de espejo." },
    { name: "Un nuevo comienzo", type: "Epóxico con hojuelas", note: "Un acabado limpio para un garaje de mucho uso." },
    { name: "Un toque de oro", type: "Epóxico metálico", note: "Tonos oscuros con acentos metálicos cálidos." },
    { name: "Lo cotidiano, elevado", type: "Epóxico con hojuelas", note: "Textura fina y una paleta clara y neutra." },
    { name: "Humo y plata", type: "Epóxico metálico", note: "Un acabado metálico carbón que fluye." },
    { name: "Espacio para trabajar", type: "Epóxico con hojuelas", note: "Un acabado uniforme en todo un garaje abierto." },
    { name: "Carbón profundo", type: "Epóxico metálico", note: "Movimiento sutil en una superficie oscura e intensa." },
  ],
  steps: [
    ["Hablemos de pisos.", "Cuéntenos sobre su espacio, cómo lo usa y el aspecto que tiene en mente."],
    ["Empezamos por la superficie.", "Evaluamos el concreto y planificamos el pulido, las reparaciones y la preparación que necesita."],
    ["Le damos vida.", "Aplicamos el acabado elegido con atención a los bordes, la textura y la capa final."],
    ["Siéntase en casa.", "Revisamos juntos el piso terminado y le explicamos el cuidado y el curado de su sistema."],
  ],
  questions: [
    ["¿Qué acabado es el adecuado para mi espacio?", "Empiece por cómo se usa el espacio. Las hojuelas dan un aspecto texturizado y moteado; el epóxico metálico ofrece color que fluye y profundidad; el concreto pulido resalta la losa existente. Podemos hablar del enfoque ideal para su superficie y sus prioridades."],
    ["¿Pueden trabajar con mi concreto actual?", "Primero hay que evaluar la losa. Los recubrimientos existentes, las grietas y la humedad pueden afectar la preparación y el sistema elegido. Incluya fotos y cualquier problema conocido en los detalles de su proyecto."],
    ["¿Cuánto tiempo tomará mi proyecto?", "Depende del tamaño, la preparación, el sistema de recubrimiento y las condiciones del lugar. Los tiempos de instalación y de uso se confirman para su proyecto antes de empezar."],
    ["¿Cuánto cuesta un piso nuevo?", "El área, la preparación de la superficie, las reparaciones y el acabado elegido influyen en el precio. Comparta los pies cuadrados aproximados y el acabado que le gusta para empezar la conversación."],
  ],
  systems: [
    { name: "Epóxico metálico", description: "Movimiento fluido con un acabado de profundidad.", colors: ["Humo plateado", "Champán", "Azul medianoche", "Perla"] },
    { name: "Epóxico con hojuelas", description: "Una mezcla texturizada de pequeñas hojuelas decorativas.", colors: ["Sal y pimienta", "Arenisca", "Grafito", "Glaciar"] },
    { name: "Concreto pulido", description: "Variación de aspecto natural con un carácter más sereno.", colors: ["Gris natural", "Piedra cálida", "Carbón", "Piedra caliza"] },
  ],
  rooms: ["Sala", "Garaje", "Showroom", "Sótano", "Patio"],
  sheens: ["Mate", "Satinado", "Brillante"],
  lighting: ["Nublado", "Mediodía", "Atardecer", "Noche"],
  am: "a. m.", pm: "p. m.",
};

export const copy: Record<Lang, Copy> = { en, es };

/** The site's finishes and projects with their text in the given language. */
export function localized(c: Copy) {
  return {
    finishes: finishData.map((f, i) => ({ ...f, ...c.finishes[i] })),
    // `kind` keeps the English finish type for filtering and links; `type` is what's shown.
    projects: projectData.map((p, i) => ({ ...p, kind: p.type as string, ...c.projects[i] })),
  };
}
