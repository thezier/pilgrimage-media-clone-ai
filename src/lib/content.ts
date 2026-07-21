// All copy and asset paths below are verbatim from the live pilgrimage.media
// homepage — extracted via element.textContent / href, not paraphrased.
import type {
  GalleryPost,
  NavLink,
  PortfolioCategory,
  ServiceLine,
} from "@/types/site";

export const WORDMARK = "Pilgrimage Media";

export const NAV_LINKS: NavLink[] = [
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const HERO_HEADING = [
  "Media for those on",
  "a journey to make",
  "themselves and",
  "others better.",
];

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { label: "Athletes & Fitness", href: "/fitness-athletes" },
  { label: "Sports & Events", href: "/sports-events" },
  { label: "Health & Adventure", href: "/health-adventure" },
];

// Note the curly apostrophe in "Let’s" — the live site uses U+2019 here, but a
// straight quote in the "Let's Connect" button labels.
export const PORTFOLIO_BODY =
  "I strive to craft visuals that inspire everyday people to pursue strength, vitality, and a more active life — Let’s inspire action and elevate lives through authentic, impactful media.";

// Three paragraphs. Only the first wraps its lead in <strong><em> (weight 700);
// the other two use a plain <em> (weight 600).
export const SERVICE_LINES: ServiceLine[] = [
  {
    lead: "Personal Branding",
    body: " for athletes, trainers, and coaches building a healthier, more vibrant future through movement and discipline.",
  },
  {
    lead: "Commercial photography & videography",
    body: " for teams and brands that inspire action, build community, and redefine what it means to live vibrantly.",
  },
  {
    lead: "Content for Web & Social Media",
    body: " — Stay consistent and relevant with curated visuals optimized for digital platforms—built to connect, convert, and inspire.",
  },
];

export const GALLERY_POSTS: GalleryPost[] = [
  {
    src: "/images/posts/post-1.jpg",
    alt: "",
    href: "https://www.instagram.com/p/DPeh0HdkkwX/",
  },
  { src: "/images/posts/post-2.jpg", alt: "", href: null },
  {
    src: "/images/posts/post-3.jpg",
    alt: "",
    href: "https://www.instagram.com/p/DPEgDesEYBD/",
  },
  {
    src: "/images/posts/post-4.jpg",
    alt: "",
    href: "https://www.instagram.com/p/DPAEwqMkprD/",
  },
  { src: "/images/posts/post-5.jpg", alt: "", href: null },
  { src: "/images/posts/post-6.jpg", alt: "", href: null },
  {
    src: "/images/posts/post-7.jpg",
    alt: "",
    href: "https://www.instagram.com/p/DOGsA-IEYT8/",
  },
  {
    src: "/images/posts/post-8.jpg",
    alt: "",
    href: "https://www.instagram.com/p/DOFMlEGiar7/",
  },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Athletes & Fitness", href: "/fitness-athletes" },
  { label: "Sports & Events", href: "/sports-events" },
  { label: "Health & Adventure", href: "/health-adventure" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const INSTAGRAM_URL = "https://instagram.com/pilgrimagemedia";
export const CONTACT_URL = "/contact";
