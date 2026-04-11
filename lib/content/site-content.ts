export type Service = {
  title: string;
  description: string;
  bullets: string[];
};

export type Publication = {
  title: string;
  year: string;
  type: string;
  summary: string;
  fileUrl?: string;
};

export type ResearchProject = {
  title: string;
  summary: string;
  category: string;
  status: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

export const siteContent = {
  hero: {
    name: "Stephen Asatsa, PhD",
    eyebrow: "Psychologist, Academic, Research Leader",
    headline: "Evidence-based psychological care and culturally grounded scholarship for people and institutions shaping healthier futures.",
    subheadline:
      "Dr. Stephen Asatsa is a Kenyan psychologist, senior lecturer, and Head of Department of Psychology at the Catholic University of Eastern Africa with deep experience in teaching, research, mentorship, and professional practice.",
    primaryCta: {
      label: "Book a Consultation",
      href: "/services#booking",
    },
    secondaryCta: {
      label: "Download CV",
      href: "/Stephen_Asatsa-CV-2025.pdf",
    },
  },
  aboutShort:
    "Dr. Stephen is a senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa with extensive experience in academic strategy and research. He is an experienced Consultant Psychologist registered and licensed by the Kenya Counselors and Psychologists Board and co-founder of BeautifulMind Consultants, a Kenyan mental health social enterprise.",
  aboutFull: [
    "Dr. Stephen is a senior Lecturer and Head of Department of Psychology at the Catholic University of Eastern Africa with extensive experience in academic strategy and research. Proven track record as a Lecturer of Psychology, excelling in teaching, research, and student mentorship.",
    "He is an experienced Consultant Psychologist registered and licensed by the Kenya Counselors and Psychologists Board and co-founder of BeautifulMind Consultants, a Kenyan mental health social enterprise.",
    "He serves on the governing Council of the Society for Research in Child Development (SRCD). He is the Africa regional representative for the European Association of Personality Psychology (EAPP). He is the e-newsletter editor for the International Society for the Study of Behavioral Development (ISSBD).",
    "He is also a review editor for Frontiers in Psychology and Frontiers in Reproductive Health. His research interests span Indigenous knowledge systems, decolonization of psychology, thanatology, and cultural evolution. He is a strong advocate for the indigenization of psychological practice.",
  ],
  quote: {
    text: "We are all in the gutter, but some of us are looking at the stars. Everyone has problems to deal with, but the people who are mesmerized by the beauty of their dreams are the ones who actually live life to the fullest.",
    author: "Oscar Wilde",
  },
  services: [
    {
      title: "Psychotherapy",
      description:
        "Thoughtful support for stress, burnout, grief and loss, trauma, adolescent difficulties, relationship challenges, anxiety, depression, and life transitions.",
      bullets: ["Individual support", "Couples and family guidance", "Premarital and career counseling"],
    },
    {
      title: "Consulting",
      description:
        "Professional psychological consultation for organizations, institutions, and teams navigating change, wellbeing, leadership, and workplace resilience.",
      bullets: ["Corporate wellbeing", "Academic strategy", "Advisory engagements"],
    },
    {
      title: "Research Leadership",
      description:
        "Research design, collaboration, and dissemination for interdisciplinary projects rooted in local context and rigorous scholarship.",
      bullets: ["Grant-aligned research support", "Research mentorship", "Publication strategy"],
    },
    {
      title: "Mentorship",
      description:
        "Guidance for students, early-career researchers, and professionals building meaningful careers in psychology and allied disciplines.",
      bullets: ["Graduate supervision", "Career development", "Writing and publishing support"],
    },
    {
      title: "Corporate Training",
      description:
        "Engaging sessions for institutions looking to strengthen mental health literacy, coping skills, and culture-sensitive human support systems.",
      bullets: ["Mental health education", "Trauma-informed practice", "Leadership workshops"],
    },
    {
      title: "Booking Support",
      description:
        "A dedicated consultation flow for people seeking one-on-one guidance and support through an accessible booking process.",
      bullets: ["Calendly integration", "Virtual counseling", "Professional follow-up"],
    },
  ] satisfies Service[],
  researchProjects: [
    {
      title: "Decolonizing Psychology Through Indigenous Knowledge Systems",
      summary:
        "A research stream exploring culturally grounded psychological frameworks and the indigenization of practice in African settings.",
      category: "Decolonizing Psychology",
      status: "Active",
    },
    {
      title: "Thanatology and Cultural Understandings of Mourning",
      summary:
        "Work centered on death preparedness, mourning rituals, and the psychological meaning-making processes embedded in community traditions.",
      category: "Thanatology",
      status: "Active",
    },
    {
      title: "Cultural Evolution and Social Learning",
      summary:
        "Cross-cultural scholarship examining developmental pathways, social learning, and cultural logics shaping human behavior.",
      category: "Cultural Evolution",
      status: "Collaborative",
    },
    {
      title: "Substance Use Prevention and Recovery Support",
      summary:
        "International conference-aligned work on prevention, harm reduction, treatment, and recovery support systems.",
      category: "Mental Health",
      status: "Ongoing",
    },
  ] satisfies ResearchProject[],
  publications: [
    {
      title: "Stephen Asatsa CV 2025",
      year: "2025",
      type: "CV",
      summary: "Complete professional curriculum vitae including affiliations, appointments, and scholarly activity.",
      fileUrl: "/Stephen_Asatsa-CV-2025.pdf",
    },
    {
      title: "Research for Posterity",
      year: "2024",
      type: "Presentation",
      summary: "Research dissemination work focused on preserving scholarship and extending community impact.",
    },
    {
      title: "Afrocentric Psychology and Mourning Rituals",
      year: "2025",
      type: "Invited Talk",
      summary: "A perspective on Afrocentric psychology through Luhya mourning rituals and culturally informed healing frameworks.",
    },
  ] satisfies Publication[],
  grants: [
    "Jan 2025: European Association of Personality Psychology Focus Meeting Grant (Euro 10,000)",
    "April 2024: ICUDDR Travel Grant (ICUDDR Conference in Greece, June 22-28, 2024)",
    "March 2024: ISSBD Travel Grant (Portugal Biennial Meeting, June 17-21, 2024)",
    "April 2023: Cultural Evolution Society ACE Grant for scholar mobility (USD 6,000)",
    "August 2022: Cultural Evolution Society Cultural Transformation Grant (GBP 89,200)",
    "June 2022: John Templeton Travel Grant (Templeton Annual Meeting, Bahamas)",
  ],
  conferences: [
    "Cultural Evolution Society Capstone Conference, Durham University, UK, September 9-12, 2024",
    "21st European Conference on Personality, Humboldt-Universität, Berlin, Germany, August 6-9, 2024",
    "ICUDDR Conference, Thessaloniki, Greece, June 24-28, 2024",
    "ISSBD Biennial Meeting, Lisbon, Portugal, June 16-20, 2024",
    "Thailand Addiction Scientific Conference, Chiang Mai University, Thailand, August 9-11, 2023",
    "College on Problems of Drug Dependence Conference, Denver, Colorado, June 17-21, 2023",
  ],
  invitedTalks: [
    "Colloquium on African Psychology: Luhya Traditional Mourning Rituals",
    "Publishing Research from Thesis or Dissertation",
    "Trauma of Imposed Civilization Seminar",
    "Towards Afrocentric Psychology: Insights from Luhya Mourning Rituals",
  ],
  testimonials: [
    {
      name: "Prof. Luzelle Naudé",
      role: "Academic Collaborator",
      quote:
        "Stephen brings clarity, compassion, and intellectual depth to both research and mentorship. He is a thoughtful collaborator with a strong grounding in culturally meaningful scholarship.",
      image: "/assets/people/prof-luzelle-naude.png",
    },
    {
      name: "Dr. Elizabeth Shino",
      role: "Professional Colleague",
      quote:
        "His work bridges practice and academia in a way that feels rigorous, humane, and deeply relevant to African realities.",
      image: "/assets/people/dr-elizabeth-shino.jpg",
    },
    {
      name: "Research Mentee",
      role: "Early-Career Scholar",
      quote:
        "Dr. Asatsa creates space for bold thinking while giving practical guidance that makes research feel possible and purposeful.",
      image: "/assets/people/asatsa.png",
    },
  ] satisfies Testimonial[],
  gallery: [
    "/assets/gallery/asatsa-7.jpeg",
    "/assets/gallery/steve3.jpg",
    "/assets/gallery/awards.jpeg",
    "/assets/gallery/steve15-scaled.jpg",
    "/assets/gallery/project.jpeg",
  ],
  contact: {
    addressLines: ["P.O Box 954 00502", "Karen – Nairobi"],
    phones: ["+254 770 140 889", "+254 716 842 028"],
    socialLinks: [
      { label: "Facebook", href: "https://facebook.com/dr.stephenasatsa" },
      { label: "Twitter", href: "https://x.com/DAsatsa21589" },
      { label: "Instagram", href: "https://www.instagram.com/dr.stephenasatsa/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/stephen-asatsa-phd-b119837a/" },
    ],
    mapEmbed:
      "https://maps.google.com/maps?q=cuea&t=m&z=10&output=embed&iwloc=near",
    bookingUrl: "https://calendly.com/booking-stephen/online-counseling",
  },
  blogCategories: [
    "Mental Health",
    "Decolonizing Psychology",
    "Thanatology",
    "Research",
    "Academic Leadership",
  ],
};
