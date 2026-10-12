/**
 * Types for the content related API response
 */
import type {CategoryType} from "~/types/CategoryType";

export interface ContentRelatedResponse {
  status: string;
  related: ContentRelatedItem[];
}

export interface ContentRelatedItem {
  title: string;
  slug: string;
  excerpt: string;
  type: string;
  images: {
    small?: string;
    medium?: string;
  };
  updated_at: string;
  categories?: CategoryType[],
  subcategories?: CategoryType[],
  url?: string,
  path?: string,
}