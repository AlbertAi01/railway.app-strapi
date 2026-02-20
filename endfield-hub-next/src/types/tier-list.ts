/**
 * Type definitions for Tier List feature
 */

export type TierLevel = 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

/**
 * Character entry in a tier list
 */
export interface TierListEntry {
  slug: string;
  name: string;
  tier: TierLevel;
  element: string;
  role: string;
}

/**
 * Complete tier list structure from API
 */
export interface DefaultTierList {
  SS: TierListEntry[];
  S: TierListEntry[];
  A: TierListEntry[];
  B: TierListEntry[];
  C: TierListEntry[];
  D: TierListEntry[];
  lastUpdated?: string;
  description?: string;
}

/**
 * Internal tier list structure used in the page component
 * Includes Bench and Unranked for UI purposes
 */
export interface TierListState {
  SS: string[];
  S: string[];
  A: string[];
  B: string[];
  C: string[];
  D: string[];
  Bench: string[];
  Unranked: string[];
}

/**
 * Strapi API response format for default tier list
 */
export interface StrapiDefaultTierListResponse {
  data: {
    id: number;
    tierSS: TierListEntry[];
    tierS: TierListEntry[];
    tierA: TierListEntry[];
    tierB: TierListEntry[];
    tierC: TierListEntry[];
    tierD: TierListEntry[];
    lastUpdated?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  meta: Record<string, unknown>;
}
