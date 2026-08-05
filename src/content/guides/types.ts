import type { ComponentType } from "react";

export type GuideCategory = "coworkers" | "operators";

export type GuideMeta = {
  slug: string;
  title: string;
  dek: string;
  category: GuideCategory;
  readMins: number;
};

export type GuideModule = GuideMeta & { Body: ComponentType };
