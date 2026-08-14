import type { ComponentType } from "react";

export type BlogMeta = {
  slug: string;
  title: string;
  category: string;
  date: string;
  read: string;
  excerpt: string;
  metaDescription: string;
  image: string;
  featured?: boolean;
};

export type BlogModule = BlogMeta & { Body: ComponentType };
