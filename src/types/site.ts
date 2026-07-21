export interface NavLink {
  label: string;
  href: string;
}

export interface PortfolioCategory {
  label: string;
  href: string;
}

/** A "Latest Posts" gallery thumbnail (Instagram cross-post). */
export interface GalleryPost {
  src: string;
  alt: string;
  /** Some thumbnails on the live site are not linked. */
  href: string | null;
}

/** One of the two italic-lead service descriptions in the Services section. */
export interface ServiceLine {
  lead: string;
  body: string;
}
