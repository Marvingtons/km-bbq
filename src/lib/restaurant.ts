// One source for the restaurant's contact facts. Contact, the menu info band,
// and the footer all render from here so hours/address/phone/socials can never
// drift out of sync across the three places that used to hard-code them.

export const PHONE = {
  display: "(760) 433-1888",
  href: "tel:+17604331888",
} as const;

export const ADDRESS = {
  street: "2216 S El Camino Real #108–109",
  region: "Oceanside, CA 92054",
} as const;

export const HOURS = [
  { days: "Sunday – Thursday", short: "Sun–Thu", time: "12:00 PM – 9:30 PM" },
  { days: "Friday – Saturday", short: "Fri–Sat", time: "12:00 PM – 10:00 PM" },
] as const;

export type SocialKey = "instagram" | "tiktok" | "yelp";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/kmkoreanbbq/" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@kmkoreanbbq" },
  { key: "yelp", label: "Yelp", href: "https://www.yelp.com/biz/km-bbq-oceanside-2" },
];
