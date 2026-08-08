export const SITE_URL = "https://www.coworkingdispatch.com";

export const canonicalLink = (path: string) => ({ rel: "canonical", href: `${SITE_URL}${path}` });
