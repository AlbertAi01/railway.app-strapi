export type Element = 'Physical' | 'Heat' | 'Cryo' | 'Electric' | 'Nature';
export type Role = 'Guard' | 'Defender' | 'Supporter' | 'Caster' | 'Vanguard' | 'Striker';
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
  BaseHP: number;
  BaseATK: number;
  BaseDEF: number;
  MaxHP: number;
  MaxATK: number;
  MaxDEF: number;
  Description?: string;
  Lore?: string;
  Skills?: Skill[];
  AscensionMaterials?: Record<string, number>[];
  StatScaling?: Record<string, number[]>;
  Tags?: string[];
  IsLimited?: boolean;
}

export interface Skill {
  id: number;
  Name: string;
  SkillType: 'Normal Attack' | 'Elemental Skill' | 'Endfield Skill' | 'Passive' | 'Talent';
  Description: string;
  Cooldown?: number;
  EnergyCost?: number;
  DamageMultipliers?: Record<string, number>;
  LevelScaling?: Record<string, number[]>;
  Order: number;
}

export interface Weapon {
  id: number;
  Name: string;
  Slug: string;
  Rarity: number;
  WeaponType: WeaponType;
  BaseATK: number;
  MaxATK: number;
  SubStat?: string;
  SubStatValue?: number;
  PassiveName?: string;
  PassiveDescription?: string;
  Description?: string;
  ObtainMethod?: string;
}

export interface EquipmentSet {
  id: number;
  Name: string;
  Slug: string;
  Rarity: number;
  TwoPieceBonus: string;
  FourPieceBonus?: string;
  Description?: string;
  RecommendedFor?: string[];
  ObtainMethod?: string;
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
