export type Element = 'Physical' | 'Heat' | 'Cryo' | 'Electric' | 'Nature';
export type Role = 'Guard' | 'Defender' | 'Supporter' | 'Caster' | 'Vanguard' | 'Assault';
export type WeaponType = 'Greatsword' | 'Polearm' | 'Handcannon' | 'Sword' | 'Arts Unit';
export type Rarity = 4 | 5 | 6;

export interface Character {
  id: number;
  Name: string;
  Slug: string;
  Rarity: Rarity;
  Element: Element;
  Role: Role;
  WeaponType: WeaponType;
  Strength: number;
  Agility: number;
  Intellect: number;
  Will: number;
  Description?: string;
  Lore?: string;
  Skills?: Skill[];
  Tags?: string[];
  IsLimited?: boolean;
}

export interface Skill {
  id: number;
  Name: string;
  SkillType: 'Normal Attack' | 'Battle Skill' | 'Combo Skill' | 'Ultimate' | 'Passive' | 'Talent';
  Description: string;
  Cooldown?: number;
  SPCost?: number;
  Order: number;
}

export interface Weapon {
  id: number;
  Name: string;
  Slug: string;
  Rarity: number;
  WeaponType: WeaponType;
  Description?: string;
}

export interface EquipmentSet {
  id: number;
  Name: string;
  Slug: string;
  SetBonus: string; // 3-piece set effect
  Tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  RecommendedFor?: string[];
}

export interface Guide {
  id: number;
  Title: string;
  Slug: string;
  Category: string;
  Content: string;
  Summary: string;
  Author: string;
  Difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  IsVerified: boolean;
  FactCheckNotes?: string;
  ViewCount: number;
  Upvotes: number;
  Tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Blueprint {
  id: number;
  Title: string;
  Description: string;
  ImportString: string;
  Upvotes: number;
  Region?: 'Asia' | 'NA / EU' | 'CN';
  Screenshot?: { url: string }[];
}

export interface Recipe {
  id: number;
  Name: string;
  Slug: string;
  Category: string;
  Inputs: { item: string; quantity: number }[];
  Outputs: { item: string; quantity: number }[];
  CraftingTime?: number;
  FacilityRequired?: string;
  FacilityLevel?: number;
  EnergyConsumption?: number;
  ThroughputPerMin?: number;
}

export interface MapMarker {
  id: number;
  Name: string;
  MapRegion: 'Valley IV' | 'Wuling' | 'Talos-II';
  MarkerType: string;
  PosX: number;
  PosY: number;
  Description?: string;
  Tips?: string;
  Rewards?: Record<string, number>;
}

export interface Banner {
  id: number;
  Name: string;
  BannerType: 'Standard' | 'Limited' | 'Weapon' | 'Event';
  StartDate?: string;
  EndDate?: string;
  PityRates?: Record<string, number>;
  IsActive: boolean;
}

export const ELEMENT_COLORS: Record<Element, string> = {
  Physical: '#CCCCCC',
  Heat: '#FF6B35',
  Cryo: '#00BFFF',
  Electric: '#9B59B6',
  Nature: '#27AE60',
};

export const RARITY_COLORS: Record<number, string> = {
  6: '#FF8C00',
  5: '#FFD700',
  4: '#9B59B6',
  3: '#3498DB',
};
