'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, CHARACTER_GACHA } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Sword, Zap, Crosshair, Flame, FilePlus2, Copy, Link2, Check, Shield, Heart, Swords, Target, Sparkles, Sun, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';
import { WEAPON_DATA, getAtkAtLevel, type WeaponData } from '@/data/weapons';
import { WEAPON_ESSENCES } from '@/data/essences';
import { GEAR_SETS, STANDALONE_GEAR, TIER_COLORS, type GearPiece, type GearSet } from '@/data/gear';
import { OPERATOR_STATS, getOperatorStatsAtLevel, getTalentAttributeBonus } from '@/data/operator-stats';

// ──────────── Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; accent: string; glow: string; secondary: string }> = {
  Physical: { primary: '#C0C8D0', bg: '#0a0e14', accent: '#7888A0', glow: 'rgba(192,200,208,0.3)', secondary: '#4A5568' },
  Heat:     { primary: '#FF6B35', bg: '#0a0e14', accent: '#CC5522', glow: 'rgba(255,107,53,0.4)', secondary: '#8B3A1A' },
  Cryo:     { primary: '#00BFFF', bg: '#0a0e14', accent: '#0088CC', glow: 'rgba(0,191,255,0.4)', secondary: '#004466' },
  Electric: { primary: '#C084FC', bg: '#0a0e14', accent: '#9060CC', glow: 'rgba(192,132,252,0.4)', secondary: '#5B3A8C' },
  Nature:   { primary: '#34D399', bg: '#0a0e14', accent: '#22AA77', glow: 'rgba(52,211,153,0.4)', secondary: '#1A6B4A' },
};

// ──────────── Color Scheme Presets ────────────

type ColorScheme = 'auto' | 'standard' | 'classified' | 'midnight' | 'arctic' | 'ember' | 'nature' | 'monochrome';

const COLOR_SCHEMES: Record<string, { label: string; description: string; bgGrad: string; overlayOpacity: number; tint: string }> = {
  auto:       { label: 'Auto', description: 'Match element', bgGrad: 'linear-gradient(135deg, #080b10 0%, #0d1118 40%, #111620 100%)', overlayOpacity: 0.025, tint: '' },
  standard:   { label: 'Standard Issue', description: 'Default dark', bgGrad: 'linear-gradient(135deg, #080b10 0%, #0d1118 40%, #111620 100%)', overlayOpacity: 0.025, tint: '' },
  classified: { label: 'Classified', description: 'Deep red tint', bgGrad: 'linear-gradient(135deg, #100808 0%, #180d0d 40%, #1a1010 100%)', overlayOpacity: 0.03, tint: '#FF3030' },
  midnight:   { label: 'Midnight', description: 'Deep blue', bgGrad: 'linear-gradient(135deg, #050810 0%, #0a1020 40%, #0d1428 100%)', overlayOpacity: 0.03, tint: '#4488FF' },
  arctic:     { label: 'Arctic', description: 'Ice blue white', bgGrad: 'linear-gradient(135deg, #0a1018 0%, #0e1825 40%, #122030 100%)', overlayOpacity: 0.04, tint: '#88CCEE' },
  ember:      { label: 'Ember', description: 'Warm amber', bgGrad: 'linear-gradient(135deg, #100a06 0%, #181008 40%, #1a1208 100%)', overlayOpacity: 0.03, tint: '#FF8833' },
  nature:     { label: 'Nature', description: 'Forest green', bgGrad: 'linear-gradient(135deg, #060e08 0%, #0a160c 40%, #0c1a10 100%)', overlayOpacity: 0.03, tint: '#33CC66' },
  monochrome: { label: 'Monochrome', description: 'Grayscale', bgGrad: 'linear-gradient(135deg, #0a0a0a 0%, #111111 40%, #161616 100%)', overlayOpacity: 0.02, tint: '#AAAAAA' },
};

// ──────────── Equipment Data ────────────

function getPieceSlotType(piece: GearPiece): 'Body' | 'Hand' | 'EDC' {
  const iconLower = (piece.icon || '').toLowerCase();
  const nameLower = piece.name.toLowerCase();
  if (iconLower.includes('_body_') || nameLower.includes('armor') || nameLower.includes('cuirass') || nameLower.includes('overalls') || nameLower.includes('jacket') || nameLower.includes('poncho') || nameLower.includes('plating') || nameLower.includes('exoskeleton') || nameLower.includes('vest') || nameLower.includes('suit') || nameLower.includes('cleansuit')) return 'Body';
  if (iconLower.includes('_hand_') || nameLower.includes('gloves') || nameLower.includes('gauntlets') || nameLower.includes('fists') || nameLower.includes('wrists') || nameLower.includes('hands ppe') || nameLower.includes('tac fists')) return 'Hand';
  return 'EDC';
}

interface EquipmentSlotState {
  setName: string;
  pieceName: string;
  artifice: number;
}

// ──────────── Computed Stats ────────────

/** Parse equipment stat strings like "+65", "+23.0%", "HP +5.8%" into { flat, percent, statKey } */
function parseEquipStat(statName: string, statValue: string): { key: string; flat: number; percent: number } {
  const name = statName.toLowerCase();
  let key = 'unknown';
  if (name.includes('hp')) key = 'hp';
  else if (name.includes('atk') || name.includes('attack')) key = 'atk';
  else if (name.includes('def') || name.includes('defense')) key = 'def';
  else if (name.includes('str') || name.includes('strength')) key = 'str';
  else if (name.includes('agi') || name.includes('agility')) key = 'agi';
  else if (name.includes('int') || name.includes('intellect')) key = 'int';
  else if (name.includes('wil') || name.includes('will')) key = 'wil';
  else if (name.includes('crit rate') || name.includes('critical rate')) key = 'critRate';
  else if (name.includes('crit dmg') || name.includes('critical dmg')) key = 'critDmg';

  const numMatch = statValue.match(/[+-]?\d+\.?\d*/);
  const num = numMatch ? parseFloat(numMatch[0]) : 0;
  const isPercent = statValue.includes('%');

  return { key, flat: isPercent ? 0 : num, percent: isPercent ? num : 0 };
}

/**
 * Comprehensive stat calculator using real operator progression data.
 *
 * Stat sources aggregated:
 * 1. Operator base stats interpolated to current level within elite tier
 * 2. Talent attribute bonus (+10/+25/+40/+60 to main attribute based on breakthrough)
 * 3. Weapon ATK (linear interpolation based on weapon level)
 * 4. Weapon passive attribute bonus (flat STR/AGI/INT/WIL/Main Attribute)
 * 5. Equipment flat stat bonuses (parsed from gear piece stat strings)
 * 6. Equipment percentage bonuses applied after flat bonuses
 */
function computeStats(
  char: Character,
  level: number,
  potential: number,
  breakthrough?: number,
  weaponData?: WeaponData | null,
  weaponLevel?: number,
  equippedPieces?: ({ piece: GearPiece; setName: string } | null)[]
) {
  // 1. Get real operator stats at level from progression data
  const bt = breakthrough ?? Math.min(Math.floor(level / 20), 4);
  const opStats = getOperatorStatsAtLevel(char.Name, level, bt);

  let hp: number, atk: number, str: number, agi: number, int: number, wil: number;

  if (opStats) {
    hp = opStats.hp;
    atk = opStats.atk;
    str = opStats.str;
    agi = opStats.agi;
    int = opStats.int;
    wil = opStats.wil;
  } else {
    // Fallback for operators not yet in OPERATOR_STATS (should not happen)
    const lvScale = level / 80;
    hp = Math.round(500 + (5000) * lvScale);
    atk = Math.round(30 + (270) * lvScale);
    str = char.Strength;
    agi = char.Agility;
    int = char.Intellect;
    wil = char.Will;
  }

  // 2. Add talent attribute bonus (Forged/Skirmisher/Keen Mind/Stalwart)
  const talentBonus = getTalentAttributeBonus(char.Name, bt);
  if (talentBonus) {
    switch (talentBonus.attribute) {
      case 'str': str += talentBonus.bonus; break;
      case 'agi': agi += talentBonus.bonus; break;
      case 'int': int += talentBonus.bonus; break;
      case 'wil': wil += talentBonus.bonus; break;
    }
  }

  // 3. Add weapon ATK
  let weaponAtk = 0;
  if (weaponData && weaponLevel) {
    weaponAtk = getAtkAtLevel(weaponData.BaseAtk, weaponData.MaxAtk, weaponLevel);
    atk += weaponAtk;
  }

  // 4. Add weapon passive attribute bonus
  if (weaponData?.PassiveAttribute) {
    const pa = weaponData.PassiveAttribute;
    if (!pa.isPercentage) {
      const paKey = pa.key.toLowerCase();
      if (paKey === 'str' || paKey === 'strength') str += pa.value;
      else if (paKey === 'agi' || paKey === 'agility') agi += pa.value;
      else if (paKey === 'int' || paKey === 'wisd' || paKey === 'intellect') int += pa.value;
      else if (paKey === 'wil' || paKey === 'will') wil += pa.value;
      else if (paKey === 'mainattr' || paKey === 'main attribute') {
        // "Main Attribute" — applies to the operator's main attribute
        const opData = OPERATOR_STATS[char.Name];
        if (opData) {
          switch (opData.mainAttribute) {
            case 'str': str += pa.value; break;
            case 'agi': agi += pa.value; break;
            case 'int': int += pa.value; break;
            case 'wil': wil += pa.value; break;
          }
        }
      }
    }
  }

  // 5. Parse and add equipment stat bonuses
  let equipHpFlat = 0, equipAtkFlat = 0, equipDefFlat = 0;
  let equipHpPct = 0, equipAtkPct = 0;
  let equipCritRate = 0, equipCritDmg = 0;

  if (equippedPieces) {
    for (const ep of equippedPieces) {
      if (!ep) continue;
      for (const st of ep.piece.stats) {
        const parsed = parseEquipStat(st.name, st.value);
        switch (parsed.key) {
          case 'hp':
            equipHpFlat += parsed.flat;
            equipHpPct += parsed.percent;
            break;
          case 'atk':
            equipAtkFlat += parsed.flat;
            equipAtkPct += parsed.percent;
            break;
          case 'def':
            equipDefFlat += parsed.flat;
            break;
          case 'str': str += parsed.flat; break;
          case 'agi': agi += parsed.flat; break;
          case 'int': int += parsed.flat; break;
          case 'wil': wil += parsed.flat; break;
          case 'critRate': equipCritRate += parsed.percent || parsed.flat; break;
          case 'critDmg': equipCritDmg += parsed.percent || parsed.flat; break;
        }
      }
      // Add gear DEF (from piece.def)
      if (ep.piece.def) {
        equipDefFlat += ep.piece.def;
      }
    }
  }

  // Apply flat equipment bonuses
  hp += equipHpFlat;
  atk += equipAtkFlat;
  const def = equipDefFlat;

  // Apply percentage equipment bonuses
  if (equipHpPct) hp = Math.round(hp * (1 + equipHpPct / 100));
  if (equipAtkPct) atk = Math.round(atk * (1 + equipAtkPct / 100));

  // Crit stats
  const critRate = 5.0 + equipCritRate;
  const critDmg = 50.0 + equipCritDmg;

  return {
    HP: hp, ATK: atk, DEF: def,
    STR: str, AGI: agi, INT: int, WILL: wil,
    'CRIT Rate': Math.round(critRate * 10) / 10,
    'CRIT DMG': Math.round(critDmg * 10) / 10,
  };
}

// ──────────── Gear Helpers ────────────

function findGearPieceByName(pieceName: string): GearPiece | null {
  for (const set of GEAR_SETS) {
    const piece = set.pieces.find(p => p.name === pieceName);
    if (piece) return piece;
  }
  return STANDALONE_GEAR.find(p => p.name === pieceName) || null;
}

function findGearSetByName(setName: string): GearSet | null {
  return GEAR_SETS.find(s => s.name === setName) || null;
}

// ──────────── Skill Data ────────────

const SKILL_TYPES = [
  { key: 'basic', label: 'Basic Attack', short: 'ATK', icon: Sword },
  { key: 'normal', label: 'Normal Skill', short: 'SKL', icon: Zap },
  { key: 'combo', label: 'Combo Skill', short: 'CMB', icon: Crosshair },
  { key: 'ultimate', label: 'Ultimate Skill', short: 'ULT', icon: Flame },
];

const CHAR_BREAKTHROUGH_LABELS = ['B0', 'B1', 'B2', 'B3', 'B4'];
const WEAPON_BREAKTHROUGH_LABELS = ['B0', 'B1', 'B2', 'B3', 'B4'];

type TalentState = 'locked' | 'base' | 'upgrade';

// ──────────── Showcase State ────────────

interface ShowcaseState {
  name: string;
  charName: string;
  level: number;
  potential: number;
  affinity: number;
  charBreakthrough: number;
  weaponName: string;
  weaponLevel: number;
  weaponBreakthrough: number;
  weaponPotential: number;
  essenceLevels: number[];
  username: string;
  userCode: string;
  server: string;
  skillLevels: { basic: number; normal: number; combo: number; ultimate: number };
  equipBody: EquipmentSlotState;
  equipHand: EquipmentSlotState;
  equipEdc1: EquipmentSlotState;
  equipEdc2: EquipmentSlotState;
  talentStates: TalentState[];
  brightness: number; // 0.5 to 1.5, default 1.0
  colorScheme: ColorScheme;
}

function defaultEquipSlot(): EquipmentSlotState {
  return { setName: '', pieceName: '', artifice: 0 };
}

function defaultShowcaseState(): ShowcaseState {
  const defaultChar = CHARACTERS[0];
  const defaultWeapon = WEAPONS.find(w => w.WeaponType === defaultChar.WeaponType) || WEAPONS[0];
  return {
    name: '', charName: defaultChar.Name, level: 80, potential: 0, affinity: 0, charBreakthrough: 3,
    weaponName: defaultWeapon.Name, weaponLevel: 80, weaponBreakthrough: 3, weaponPotential: 0,
    essenceLevels: [1, 1, 1], username: '', userCode: '', server: '',
    skillLevels: { basic: 1, normal: 1, combo: 1, ultimate: 1 },
    equipBody: defaultEquipSlot(), equipHand: defaultEquipSlot(),
    equipEdc1: defaultEquipSlot(), equipEdc2: defaultEquipSlot(),
    talentStates: ['locked', 'locked'],
    brightness: 1.0,
    colorScheme: 'auto' as ColorScheme,
  };
}

// ──────────── URL State Encoding ────────────

function encodeState(s: ShowcaseState): string {
  try {
    const compact = {
      n: s.name, c: s.charName, l: s.level, p: s.potential, a: s.affinity, cb: s.charBreakthrough,
      w: s.weaponName, wl: s.weaponLevel, wb: s.weaponBreakthrough, wp: s.weaponPotential,
      el: s.essenceLevels, u: s.username, uc: s.userCode, sv: s.server,
      sk: [s.skillLevels.basic, s.skillLevels.normal, s.skillLevels.combo, s.skillLevels.ultimate],
      eb: [s.equipBody.setName, s.equipBody.pieceName, s.equipBody.artifice],
      eh: [s.equipHand.setName, s.equipHand.pieceName, s.equipHand.artifice],
      e1: [s.equipEdc1.setName, s.equipEdc1.pieceName, s.equipEdc1.artifice],
      e2: [s.equipEdc2.setName, s.equipEdc2.pieceName, s.equipEdc2.artifice],
      ts: s.talentStates.map(t => t === 'locked' ? 0 : t === 'base' ? 1 : 2),
      br: s.brightness, cs: s.colorScheme,
    };
    return btoa(JSON.stringify(compact));
  } catch { return ''; }
}

function decodeState(encoded: string): ShowcaseState | null {
  try {
    const d = JSON.parse(atob(encoded));
    return {
      name: d.n || '', charName: d.c || CHARACTERS[0].Name, level: d.l || 80, potential: d.p || 0,
      affinity: d.a || 0, charBreakthrough: d.cb || 3, weaponName: d.w || '',
      weaponLevel: d.wl || 80, weaponBreakthrough: d.wb || 3, weaponPotential: d.wp || 0,
      essenceLevels: d.el || [1, 1, 1], username: d.u || '', userCode: d.uc || '', server: d.sv || '',
      skillLevels: { basic: d.sk?.[0] || 1, normal: d.sk?.[1] || 1, combo: d.sk?.[2] || 1, ultimate: d.sk?.[3] || 1 },
      equipBody: { setName: d.eb?.[0] || '', pieceName: d.eb?.[1] || '', artifice: d.eb?.[2] || 0 },
      equipHand: { setName: d.eh?.[0] || '', pieceName: d.eh?.[1] || '', artifice: d.eh?.[2] || 0 },
      equipEdc1: { setName: d.e1?.[0] || '', pieceName: d.e1?.[1] || '', artifice: d.e1?.[2] || 0 },
      equipEdc2: { setName: d.e2?.[0] || '', pieceName: d.e2?.[1] || '', artifice: d.e2?.[2] || 0 },
      talentStates: (d.ts || [0, 0]).map((t: number) => t === 0 ? 'locked' : t === 1 ? 'base' : 'upgrade') as TalentState[],
      brightness: d.br ?? 1.0,
      colorScheme: (d.cs || 'auto') as ColorScheme,
    };
  } catch { return null; }
}

// ──────────── Character Picker Modal ────────────

function CharacterPickerModal({ open, onClose, onSelect, currentName }: {
  open: boolean; onClose: () => void; onSelect: (c: Character) => void; currentName: string;
}) {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [elementFilter, setElementFilter] = useState<Element | null>(null);

  const filtered = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarityFilter && c.Rarity !== rarityFilter) return false;
      if (elementFilter && c.Element !== elementFilter) return false;
      return true;
    });
  }, [search, rarityFilter, elementFilter]);

  if (!open) return null;

  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <h3 className="text-white font-bold text-base">Select Operator</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search operators..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([6, 5, 4] as number[]).map(r => (
              <button key={r} onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
                className={`px-2.5 py-1 text-sm font-bold border transition-colors ${rarityFilter === r ? '' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'}`}
                style={rarityFilter === r ? { borderColor: RARITY_COLORS[r], color: RARITY_COLORS[r], backgroundColor: RARITY_COLORS[r] + '15' } : undefined}
              >{'★'.repeat(r)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'] as Element[]).map(el => (
              <button key={el} onClick={() => setElementFilter(elementFilter === el ? null : el)}
                className={`px-2.5 py-1 text-sm font-bold border transition-colors ${elementFilter === el ? '' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                style={elementFilter === el ? { borderColor: ELEMENT_COLORS[el], color: ELEMENT_COLORS[el], backgroundColor: ELEMENT_COLORS[el] + '15' } : undefined}
              >{el}</button>
            ))}
          </div>
        </div>
        <div className="rios-modal-body p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {filtered.map(c => (
              <button key={c.id} onClick={() => { onSelect(c); onClose(); }}
                className={`flex flex-col items-center gap-1.5 p-2.5 border transition-all hover:scale-105 ${
                  c.Name === currentName ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                }`}>
                {CHARACTER_ICONS[c.Name] ? (
                  <Image src={CHARACTER_ICONS[c.Name]} alt={c.Name} width={56} height={56} className="w-14 h-14 object-contain" />
                ) : (
                  <div className="w-14 h-14 bg-[var(--color-surface-2)] flex items-center justify-center text-lg font-bold text-[var(--color-text-muted)]">{c.Name[0]}</div>
                )}
                <span className="text-xs text-white font-medium text-center leading-tight">{c.Name}</span>
                <span className="text-[10px] font-mono" style={{ color: RARITY_COLORS[c.Rarity] }}>{'★'.repeat(c.Rarity)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Weapon Picker Modal ────────────

function WeaponPickerModal({ open, onClose, onSelect, weaponType, currentName }: {
  open: boolean; onClose: () => void; onSelect: (w: Weapon) => void; weaponType: WeaponType; currentName: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    return WEAPONS.filter(w => w.WeaponType === weaponType && (!search || w.Name.toLowerCase().includes(search.toLowerCase())));
  }, [search, weaponType]);
  if (!open) return null;
  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-md" onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <h3 className="text-white font-bold text-base">Select Weapon</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search weapons..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
        </div>
        <div className="rios-modal-body p-3">
          <div className="space-y-1.5">
            {filtered.map(w => (
              <button key={w.id} onClick={() => { onSelect(w); onClose(); }}
                className={`w-full flex items-center gap-3 p-2.5 border transition-all ${
                  w.Name === currentName ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                }`}>
                {WEAPON_ICONS[w.Name] ? (
                  <Image src={WEAPON_ICONS[w.Name]} alt={w.Name} width={40} height={40} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-[var(--color-surface-2)] flex items-center justify-center"><Sword size={16} className="text-[var(--color-text-muted)]" /></div>
                )}
                <div className="flex-1 text-left">
                  <div className="text-white text-sm font-medium">{w.Name}</div>
                  <div className="text-[10px] font-mono" style={{ color: RARITY_COLORS[w.Rarity] }}>{'★'.repeat(w.Rarity)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Equipment Picker Modal ────────────

function EquipmentPickerModal({ open, onClose, onSelect, slotType, currentPieceName }: {
  open: boolean; onClose: () => void; onSelect: (piece: GearPiece, setName: string) => void;
  slotType: 'Body' | 'Hand' | 'EDC'; currentPieceName: string;
}) {
  const [search, setSearch] = useState('');
  const pieces = useMemo(() => {
    const allPieces: { piece: GearPiece; setName: string }[] = [];
    for (const set of GEAR_SETS) {
      for (const p of set.pieces) {
        if (getPieceSlotType(p) === slotType) allPieces.push({ piece: p, setName: set.name });
      }
    }
    for (const p of STANDALONE_GEAR) {
      if (getPieceSlotType(p) === slotType) allPieces.push({ piece: p, setName: '' });
    }
    if (search) return allPieces.filter(({ piece }) => piece.name.toLowerCase().includes(search.toLowerCase()));
    return allPieces;
  }, [slotType, search]);
  if (!open) return null;
  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-md" onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <h3 className="text-white font-bold text-base">{slotType} Equipment</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${slotType.toLowerCase()} pieces...`}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
        </div>
        <div className="rios-modal-body p-3">
          <div className="space-y-1.5">
            {pieces.map(({ piece, setName }) => (
              <button key={piece.id} onClick={() => { onSelect(piece, setName); onClose(); }}
                className={`w-full flex items-center gap-3 p-2.5 border transition-all text-left ${
                  piece.name === currentPieceName ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                }`}>
                {piece.icon ? (
                  <Image src={piece.icon} alt={piece.name} width={36} height={36} className="w-9 h-9 object-contain flex-shrink-0" unoptimized />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center font-bold text-xs border border-[var(--color-border)]" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1 py-0.5" style={{ color: TIER_COLORS[piece.tier], backgroundColor: TIER_COLORS[piece.tier] + '15', border: `1px solid ${TIER_COLORS[piece.tier]}30` }}>{piece.tier}</span>
                    <span className="text-white text-sm font-medium truncate">{piece.name}</span>
                  </div>
                  {setName && <div className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">{setName}</div>}
                </div>
              </button>
            ))}
            {pieces.length === 0 && <p className="text-center text-sm text-[var(--color-text-muted)] py-4">No {slotType.toLowerCase()} pieces found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Skill Level Button ────────────

function SkillLevelBtn({ level, active, onClick }: { level: number; active: boolean; onClick: () => void }) {
  const display = level <= 9 ? String(level) : level === 10 ? '10' : level === 11 ? '11' : '12';
  return (
    <button onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center text-xs font-bold border transition-all ${
        active
          ? level >= 10
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
            : 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
      }`}>
      {display}
    </button>
  );
}

// ──────────── Section Header ────────────

function FormSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical border-b border-[var(--color-border)] pb-1.5 mb-3 hover:text-[var(--color-accent-hover)] transition-colors">
        <span>{title}</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

// ──────────── Dossier Helpers ────────────

function generateOperatorID(name: string, rarity: number): string {
  const prefix = 'EI';
  const rarityCode = ['', '', '', 'C', 'B', 'A', 'S'][rarity] || 'C';
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const serial = hash.toString().padStart(6, '0').slice(-6);
  return `${prefix}-${rarityCode}${serial}`;
}

function getEliteLabel(breakthrough: number): string {
  return breakthrough >= 4 ? 'E4' : breakthrough >= 3 ? 'E3' : breakthrough >= 2 ? 'E2' : breakthrough >= 1 ? 'E1' : 'E0';
}

function getDossierTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ──────────── CARD CANVAS (the exported image) ────────────
// Art-forward operator showcase — character art dominates the left,
// semi-transparent data panel on the right. Inspired by Enka.Network / StarDB.
// 1200x675 (16:9) — optimized for Twitter/Discord/Reddit embeds.

function CardCanvas({ state, theme, char, weapon, colorScheme }: {
  state: ShowcaseState; theme: typeof THEME_COLORS.Physical;
  char: Character; weapon: Weapon | undefined;
  colorScheme: ColorScheme;
}) {
  const splashUrl = CHARACTER_SPLASH[char.Name];
  const gachaUrl = CHARACTER_GACHA[char.Name];
  const charIcon = CHARACTER_ICONS[char.Name];
  const weaponIcon = weapon ? WEAPON_ICONS[weapon.Name] : null;
  const roleIcon = PROFESSION_ICONS[char.Role];
  const weaponData: WeaponData | undefined = weapon ? WEAPON_DATA.find(w => w.Name === weapon.Name) : undefined;
  const weaponAtk = weaponData ? getAtkAtLevel(weaponData.BaseAtk, weaponData.MaxAtk, state.weaponLevel) : null;

  const equipSlots = [
    { slot: state.equipBody, label: 'BODY' },
    { slot: state.equipHand, label: 'HAND' },
    { slot: state.equipEdc1, label: 'EDC-1' },
    { slot: state.equipEdc2, label: 'EDC-2' },
  ];
  const equippedPieces = equipSlots.map(({ slot }) => {
    if (!slot.pieceName) return null;
    const piece = findGearPieceByName(slot.pieceName);
    return piece ? { piece, setName: slot.setName, artifice: slot.artifice } : null;
  });

  const stats = computeStats(char, state.level, state.potential, state.charBreakthrough, weaponData, state.weaponLevel, equippedPieces);

  const setCount: Record<string, number> = {};
  equippedPieces.forEach(ep => { if (ep && ep.setName) setCount[ep.setName] = (setCount[ep.setName] || 0) + 1; });
  const activeSets = Object.entries(setCount).filter(([, count]) => count >= 3);

  const F = "'Rajdhani', 'Exo 2', sans-serif";
  const FM = "'Share Tech Mono', 'Courier New', monospace";
  const operatorID = generateOperatorID(char.Name, char.Rarity);
  const eliteLabel = getEliteLabel(state.charBreakthrough);
  const schemeConfig = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.auto;
  const brightnessFilter = state.brightness !== 1.0 ? `brightness(${state.brightness})` : undefined;
  const ac = schemeConfig.tint || theme.primary; // accent color

  // Panel widths
  const DATA_W = 520; // right data panel
  const ART_W = 1200 - DATA_W; // left art area = 680

  return (
    <div style={{
      width: 1200, height: 675, position: 'relative', overflow: 'hidden',
      background: '#080a0f', fontFamily: FM, filter: brightnessFilter,
    }}>

      {/* ═══ FULL-BLEED CHARACTER ART ═══ */}
      {(splashUrl || gachaUrl) && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: ART_W + 80, height: '100%', zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={splashUrl || gachaUrl || ''} alt={char.Name} style={{
            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%',
            filter: 'brightness(0.85) contrast(1.05)',
          }} />
          {/* Fade to black on right edge */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 200, height: '100%',
            background: 'linear-gradient(to right, transparent, #080a0f)',
          }} />
          {/* Fade to black on bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
            background: 'linear-gradient(to top, #080a0fEE, #080a0f88, transparent)',
          }} />
          {/* Fade to black on top for header */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, #080a0fCC, transparent)',
          }} />
        </div>
      )}

      {/* Element glow behind character */}
      <div style={{
        position: 'absolute', left: ART_W / 2 - 150, top: '30%', width: 300, height: 300,
        borderRadius: '50%', zIndex: 0,
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, opacity: 0.3,
      }} />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, opacity: 0.015, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
      }} />

      {/* ═══ TOP-LEFT: LEVEL BADGE ═══ */}
      <div style={{
        position: 'absolute', top: 16, left: 20, zIndex: 15,
        display: 'flex', alignItems: 'flex-end', gap: 10,
      }}>
        <div style={{
          width: 62, height: 62, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${ac}EE, ${theme.accent}DD)`,
          border: `2px solid ${ac}`,
          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: '#080a0f', lineHeight: 1, fontFamily: F }}>{state.level}</span>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#080a0f', opacity: 0.6, letterSpacing: 2 }}>LEVEL</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 2 }}>
          <div style={{
            padding: '2px 8px', background: 'rgba(8,10,15,0.85)', border: `1px solid ${ac}40`,
            fontSize: 9, color: '#ccc', letterSpacing: 1.5, fontWeight: 600,
          }}>
            POT <span style={{ color: ac, fontWeight: 800 }}>{state.potential}</span>
            <span style={{ color: '#555', margin: '0 4px' }}>|</span>
            AFF <span style={{ color: ac, fontWeight: 800 }}>{state.affinity}</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{
                width: 18, height: 4,
                backgroundColor: i <= state.charBreakthrough ? ac : '#333',
                opacity: i <= state.charBreakthrough ? 1 : 0.5,
              }} />
            ))}
            <span style={{ fontSize: 9, color: ac, fontWeight: 800, marginLeft: 4 }}>{CHAR_BREAKTHROUGH_LABELS[state.charBreakthrough]}</span>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM-LEFT: NAME PLATE ═══ */}
      <div style={{
        position: 'absolute', bottom: 36, left: 20, zIndex: 15,
        maxWidth: ART_W - 40,
      }}>
        {/* Name */}
        <div style={{
          fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: F,
          letterSpacing: 4, textTransform: 'uppercase', lineHeight: 1,
          textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)',
        }}>
          {char.Name}
        </div>

        {/* Showcase name */}
        {state.name && (
          <div style={{
            fontSize: 13, color: ac, fontWeight: 600, letterSpacing: 2,
            textTransform: 'uppercase', marginTop: 4, fontFamily: F,
            textShadow: '0 1px 8px rgba(0,0,0,0.6)',
          }}>
            {state.name}
          </div>
        )}

        {/* Rarity + Element + Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: char.Rarity }, (_, i) => (
              <span key={i} style={{ color: RARITY_COLORS[char.Rarity], fontSize: 14, textShadow: `0 0 6px ${RARITY_COLORS[char.Rarity]}60` }}>★</span>
            ))}
          </div>
          <div style={{ width: 1, height: 14, background: '#555' }} />
          {roleIcon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={roleIcon} alt={char.Role} style={{ width: 16, height: 16, opacity: 0.9, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }} />
          )}
          <span style={{ fontSize: 11, color: ac, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, fontFamily: F }}>
            {char.Element} / {char.Role}
          </span>
        </div>

        {/* User info */}
        {state.username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>{state.username}</span>
            {state.userCode && <span style={{ fontSize: 9, color: '#555' }}>#{state.userCode}</span>}
            {state.server && <span style={{ fontSize: 9, color: '#555' }}>[{state.server}]</span>}
          </div>
        )}
      </div>

      {/* ═══ RIGHT DATA PANEL ═══ */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: DATA_W, height: '100%', zIndex: 10,
        background: 'rgba(8,10,15,0.88)',
        borderLeft: `1px solid ${ac}15`,
        display: 'flex', flexDirection: 'column',
        padding: '14px 18px 10px',
      }}>

        {/* ── Stats Section ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 3, height: 14, background: ac }} />
            <span style={{ fontSize: 12, color: ac, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, fontFamily: F }}>STATS</span>
            <div style={{ flex: 1, height: 1, background: `${ac}20` }} />
          </div>

          {/* HP / ATK / DEF row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[
              { label: 'HP', value: stats.HP, max: 12000, color: '#EF4444' },
              { label: 'ATK', value: stats.ATK, max: 800, color: '#F5A623' },
              { label: 'DEF', value: stats.DEF, max: 500, color: '#3B82F6' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <span style={{ fontSize: 9, color: s.color, letterSpacing: 1.5, fontWeight: 700 }}>{s.label}</span>
                  <span style={{ fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: FM, lineHeight: 1 }}>{s.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 3, background: '#1a1e28' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (s.value / s.max) * 100)}%`, background: `linear-gradient(to right, ${s.color}60, ${s.color})` }} />
                </div>
              </div>
            ))}
          </div>

          {/* STR / AGI / INT / WILL + Crit */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 3, flex: 1 }}>
              {[
                { label: 'STR', value: stats.STR, color: '#FF6B35' },
                { label: 'AGI', value: stats.AGI, color: '#00BFFF' },
                { label: 'INT', value: stats.INT, color: '#C084FC' },
                { label: 'WILL', value: stats.WILL, color: '#34D399' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '5px 0',
                  background: 'rgba(16,20,28,0.7)', borderBottom: `2px solid ${s.color}50`,
                }}>
                  <div style={{ fontSize: 8, color: s.color, fontWeight: 800, letterSpacing: 1.5, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 18, color: '#eee', fontWeight: 700, fontFamily: FM, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: 90 }}>
              {[
                { label: 'CRIT%', value: `${stats['CRIT Rate']}%` },
                { label: 'CDMG%', value: `${stats['CRIT DMG']}%` },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, padding: '3px 6px', background: 'rgba(16,20,28,0.7)',
                  borderBottom: `2px solid ${ac}40`, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 7, color: '#666', letterSpacing: 1, fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: ac, fontWeight: 800, fontFamily: FM, lineHeight: 1.1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 3, height: 12, background: ac }} />
            <span style={{ fontSize: 11, color: ac, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, fontFamily: F }}>SKILLS</span>
            <div style={{ flex: 1, height: 1, background: `${ac}20` }} />
            {/* Talents inline */}
            <div style={{ display: 'flex', gap: 4 }}>
              {state.talentStates.map((t, i) => (
                <span key={i} style={{
                  padding: '1px 6px', fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
                  color: t === 'locked' ? '#444' : t === 'base' ? '#888' : ac,
                  background: t === 'upgrade' ? `${ac}12` : 'rgba(16,20,28,0.7)',
                  border: `1px solid ${t === 'upgrade' ? ac + '40' : '#222'}`,
                }}>
                  T{i+1}:{t === 'locked' ? 'OFF' : t === 'base' ? 'α' : 'β'}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
            {SKILL_TYPES.map(sk => {
              const lvl = state.skillLevels[sk.key as keyof typeof state.skillLevels];
              const isMax = lvl >= 9;
              return (
                <div key={sk.key} style={{
                  textAlign: 'center', padding: '6px 0',
                  background: isMax ? `${ac}0D` : 'rgba(16,20,28,0.7)',
                  borderBottom: `2px solid ${isMax ? ac : '#282e38'}`,
                }}>
                  <div style={{ fontSize: 8, color: isMax ? ac : '#666', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 2 }}>{sk.short}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: isMax ? ac : '#ddd', fontFamily: F, lineHeight: 1 }}>{lvl}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Weapon ── */}
        {weapon && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 3, height: 12, background: '#F5A623' }} />
              <span style={{ fontSize: 11, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, fontFamily: F }}>WEAPON</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(245,166,35,0.15)' }} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
              background: 'rgba(16,20,28,0.8)', border: `1px solid ${ac}12`,
            }}>
              {weaponIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={weaponIcon} alt={weapon.Name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700, fontFamily: F, letterSpacing: 1 }}>{weapon.Name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: RARITY_COLORS[weapon.Rarity] }}>{'★'.repeat(weapon.Rarity)}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>Lv.{state.weaponLevel}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>{WEAPON_BREAKTHROUGH_LABELS[state.weaponBreakthrough]}</span>
                  <span style={{ fontSize: 10, color: '#888' }}>P{state.weaponPotential}</span>
                  {weaponAtk != null && <span style={{ fontSize: 10, color: '#F5A623', fontWeight: 700 }}>ATK {weaponAtk}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Equipment ── */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 3, height: 12, background: ac }} />
            <span style={{ fontSize: 11, color: ac, textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, fontFamily: F }}>EQUIPMENT</span>
            <div style={{ flex: 1, height: 1, background: `${ac}20` }} />
            {activeSets.length > 0 && activeSets.map(([name, count]) => (
              <span key={name} style={{ fontSize: 8, color: ac, fontWeight: 700, padding: '1px 6px', background: `${ac}10`, border: `1px solid ${ac}30` }}>
                {name} ({count}pc)
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
            {equippedPieces.map((ep, i) => {
              const slotLabel = equipSlots[i].label;
              if (!ep) {
                return (
                  <div key={i} style={{
                    padding: '8px 4px', background: 'rgba(16,20,28,0.4)', border: '1px dashed #1e2430',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: 80, gap: 4,
                  }}>
                    <span style={{ fontSize: 8, color: '#333', fontWeight: 700, letterSpacing: 1 }}>{slotLabel}</span>
                    <span style={{ fontSize: 8, color: '#222' }}>EMPTY</span>
                  </div>
                );
              }
              const tc = TIER_COLORS[ep.piece.tier];
              return (
                <div key={i} style={{
                  padding: '6px 4px', background: 'rgba(16,20,28,0.7)',
                  borderBottom: `2px solid ${tc}60`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 2px' }}>
                    <span style={{ fontSize: 7, color: '#555', fontWeight: 700, letterSpacing: 1 }}>{slotLabel}</span>
                    <span style={{ fontSize: 7, color: tc, fontWeight: 700 }}>
                      {ep.piece.tier}{ep.artifice > 0 ? ` +${ep.artifice}` : ''}
                    </span>
                  </div>
                  {ep.piece.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ep.piece.icon} alt={ep.piece.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${tc}10` }}>
                      <span style={{ fontSize: 14, color: tc, fontWeight: 900 }}>{ep.piece.tier}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 7, color: '#bbb', fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', padding: '0 2px' }}>
                    {ep.piece.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Equipment stats detail */}
          {equippedPieces.filter(Boolean).length > 0 && (
            <div style={{ marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {equippedPieces.filter(Boolean).flatMap((ep) =>
                ep!.piece.stats.map((st, si) => ({ ...st, key: `${ep!.piece.name}-${si}` }))
              ).slice(0, 8).map((st) => (
                <div key={st.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 5px', background: 'rgba(16,20,28,0.35)' }}>
                  <span style={{ fontSize: 7, color: '#555' }}>{st.name}</span>
                  <span style={{ fontSize: 7, color: '#888', fontWeight: 600, fontFamily: FM }}>{st.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Essence levels */}
          {state.essenceLevels.some(l => l > 1) && (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 8, color: '#555', letterSpacing: 1, fontWeight: 600 }}>ESSENCE</span>
              {state.essenceLevels.map((l, i) => (
                <span key={i} style={{ fontSize: 9, color: l > 1 ? ac : '#555', fontWeight: 700 }}>
                  E{i+1}:{l}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer inside panel ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: `1px solid ${ac}15`, paddingTop: 6, marginTop: 6,
        }}>
          <span style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>{operatorID}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {charIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={charIcon} alt={char.Name} style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.6 }} />
            )}
            <span style={{ fontSize: 8, color: '#555', fontWeight: 700, letterSpacing: 0.5 }}>{char.Element} {char.Role}</span>
          </div>
          <span style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>{eliteLabel}</span>
        </div>
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: ART_W, height: 32, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        {/* Rarity element badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={ac} fillOpacity="0.7" />
          </svg>
          <span style={{ fontSize: 9, color: '#666', letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>
            {char.Rarity}★ {char.Element}
          </span>
        </div>
      </div>

      {/* ═══ WATERMARK ═══ */}
      <div style={{
        position: 'absolute', bottom: 8, right: 18, zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg width="12" height="12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 2 L62 32 L32 62 L2 32 Z" fill={ac} fillOpacity="0.5" />
          <path d="M32 7 L57 32 L32 57 L7 32 Z" fill="#080a0f" />
          <path d="M22 22h18v4.5L26 40h14v4H21v-4.5L35 26H22z" fill={ac} fillOpacity="0.6" />
        </svg>
        <span style={{ fontSize: 8, color: '#444', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>ZeroSanity.app</span>
      </div>
    </div>
  );
}

// ──────────── Config Tab Button ────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
        active
          ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
      }`}>
      {label}
    </button>
  );
}

// ──────────── MAIN PAGE ────────────

export default function CharacterCardPage() {
  const [state, setState] = useState<ShowcaseState>(defaultShowcaseState);
  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const [equipPickerOpen, setEquipPickerOpen] = useState<{ slot: 'Body' | 'Hand' | 'EDC'; target: 'equipBody' | 'equipHand' | 'equipEdc1' | 'equipEdc2' } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'operator' | 'weapon' | 'equipment' | 'skills' | 'style'>('operator');
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const char = useMemo(() => CHARACTERS.find(c => c.Name === state.charName) || CHARACTERS[0], [state.charName]);
  const weapon = useMemo(() => WEAPONS.find(w => w.Name === state.weaponName), [state.weaponName]);
  const theme = THEME_COLORS[char.Element] || THEME_COLORS.Physical;

  // Auto-scale preview to fit container
  useEffect(() => {
    function updateScale() {
      if (previewRef.current) {
        const containerWidth = previewRef.current.clientWidth;
        const scale = Math.min(1, containerWidth / 1200);
        setPreviewScale(scale);
      }
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Load from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (encoded) {
      const decoded = decodeState(encoded);
      if (decoded) setState(decoded);
    }
  }, []);

  const updateState = useCallback((patch: Partial<ShowcaseState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleCharacterSelect = useCallback((c: Character) => {
    const compatWeapon = WEAPONS.find(w => w.WeaponType === c.WeaponType);
    updateState({
      charName: c.Name,
      weaponName: compatWeapon?.Name || state.weaponName,
    });
  }, [state.weaponName, updateState]);

  const handleWeaponSelect = useCallback((w: Weapon) => {
    updateState({ weaponName: w.Name });
  }, [updateState]);

  const handleEquipSelect = useCallback((piece: GearPiece, setName: string, target: string) => {
    updateState({
      [target]: { setName, pieceName: piece.name, artifice: 0 },
    });
  }, [updateState]);

  // Export handlers
  const exportCard = useCallback(async (format: 'png' | 'jpg') => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      // Clone the card and prepare images for html2canvas
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      // Replace all images with simple img tags using unoptimized URLs
      const images = clone.querySelectorAll('img');
      const loadPromises: Promise<void>[] = [];
      images.forEach(img => {
        const src = img.src || img.getAttribute('src') || '';
        // Get the actual source URL (strip Next.js optimization params)
        let actualSrc = src;
        if (src.includes('/_next/image')) {
          const urlParam = new URL(src, window.location.origin).searchParams.get('url');
          if (urlParam) actualSrc = decodeURIComponent(urlParam);
        }
        // Use proxy for external images to avoid CORS
        if (actualSrc.startsWith('http') && !actualSrc.includes(window.location.host)) {
          actualSrc = `/api/proxy-image?url=${encodeURIComponent(actualSrc)}`;
        }
        const newImg = document.createElement('img');
        newImg.crossOrigin = 'anonymous';
        newImg.style.cssText = img.style.cssText;
        newImg.className = img.className;
        newImg.width = img.width;
        newImg.height = img.height;
        newImg.alt = img.alt;
        loadPromises.push(new Promise<void>((resolve) => {
          newImg.onload = () => resolve();
          newImg.onerror = () => resolve(); // Continue even if image fails
          newImg.src = actualSrc;
        }));
        img.replaceWith(newImg);
      });

      // Wait for all images to load
      await Promise.all(loadPromises);
      // Small delay for rendering
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        width: 1200,
        height: 675,
      });

      document.body.removeChild(clone);

      const link = document.createElement('a');
      link.download = `${char.Name.toLowerCase()}-showcase.${format}`;
      link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [char.Name]);

  const copyShareLink = useCallback(() => {
    const encoded = encodeState(state);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [state]);

  const copyToClipboard = useCallback(async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const clone = cardRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      document.body.appendChild(clone);

      const images = clone.querySelectorAll('img');
      const loadPromises: Promise<void>[] = [];
      images.forEach(img => {
        const src = img.src || img.getAttribute('src') || '';
        let actualSrc = src;
        if (src.includes('/_next/image')) {
          const urlParam = new URL(src, window.location.origin).searchParams.get('url');
          if (urlParam) actualSrc = decodeURIComponent(urlParam);
        }
        if (actualSrc.startsWith('http') && !actualSrc.includes(window.location.host)) {
          actualSrc = `/api/proxy-image?url=${encodeURIComponent(actualSrc)}`;
        }
        const newImg = document.createElement('img');
        newImg.crossOrigin = 'anonymous';
        newImg.style.cssText = img.style.cssText;
        newImg.className = img.className;
        newImg.width = img.width;
        newImg.height = img.height;
        newImg.alt = img.alt;
        loadPromises.push(new Promise<void>((resolve) => {
          newImg.onload = () => resolve();
          newImg.onerror = () => resolve();
          newImg.src = actualSrc;
        }));
        img.replaceWith(newImg);
      });

      await Promise.all(loadPromises);
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(clone, {
        scale: 2, useCORS: true, allowTaint: false, backgroundColor: null, width: 1200, height: 675,
      });
      document.body.removeChild(clone);

      canvas.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      });
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <div className="min-h-screen text-white">
      {/* ════════════════════════════════════════════
          CARD PREVIEW — FULL WIDTH, MAXIMUM SIZE
          ════════════════════════════════════════════ */}
      <div className="w-full bg-black/40">
        <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 pt-3 pb-3">
          {/* Compact header inline with export actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-5" style={{ background: 'var(--color-accent)' }} />
              <h1 className="text-sm font-black uppercase tracking-wider font-tactical text-[var(--color-text-primary)]">Operator Card</h1>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono hidden sm:inline">RIOS-CARD-001</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => exportCard('png')} disabled={exporting}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent)] text-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1">
                <Download size={11} /> PNG
              </button>
              <button onClick={() => exportCard('jpg')} disabled={exporting}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all disabled:opacity-50 flex items-center gap-1">
                <Download size={11} /> JPG
              </button>
              <button onClick={copyToClipboard} disabled={exporting}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-white hover:border-[var(--color-text-secondary)] transition-all disabled:opacity-50 flex items-center gap-1">
                <Copy size={11} /> Copy
              </button>
              <button onClick={copyShareLink}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-white hover:border-[var(--color-text-secondary)] transition-all flex items-center gap-1">
                {copied ? <><Check size={11} /> Copied!</> : <><Link2 size={11} /> Share</>}
              </button>
              <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />
              <button onClick={() => {
                const text = `Check out my ${char.Name} build on Zero Sanity!`;
                const shareUrl = `${window.location.origin}${window.location.pathname}?s=${encodeState(state)}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=550,height=420');
              }} className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-white hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all flex items-center gap-1" title="Share on X/Twitter">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button onClick={() => {
                const text = `Check out my ${char.Name} build!`;
                const shareUrl = `${window.location.origin}${window.location.pathname}?s=${encodeState(state)}`;
                window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`, '_blank');
              }} className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-border)] text-white hover:border-[#FF4500] hover:text-[#FF4500] transition-all flex items-center gap-1" title="Share on Reddit">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.27c.068.378.069.77 0 1.149-.607 3.44-4.268 6.08-8.066 6.08s-7.46-2.64-8.066-6.08a3.012 3.012 0 010-1.15C2.49 10.41 3.88 8.55 6.27 7.67a3.27 3.27 0 012.263.129 11.653 11.653 0 013.463-1.15l1.37-4.4a.501.501 0 01.595-.337l3.2.72a1.78 1.78 0 113.32-.078l-3.52-.79-1.25 4a11.565 11.565 0 013.106 1.05 3.27 3.27 0 012.257-.13c2.39.88 3.78 2.74 4.34 5.6zM8 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-8.25 2.75a.75.75 0 011.06 0c1.12 1.12 3.26 1.12 4.38 0a.75.75 0 111.06 1.06c-1.71 1.71-4.79 1.71-6.5 0a.75.75 0 010-1.06z"/></svg>
              </button>
              <button onClick={() => setState(defaultShowcaseState())}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-white transition-colors flex items-center gap-1 border border-[var(--color-border)] hover:border-[var(--color-text-secondary)]">
                <FilePlus2 size={11} /> New
              </button>
            </div>
          </div>

          {/* Full-width card preview */}
          <div ref={previewRef} className="border border-[var(--color-border)]/50 overflow-hidden" style={{ borderRadius: 2, height: 675 * previewScale }}>
            <div style={{
              width: 1200, height: 675,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
            }}>
              <div ref={cardRef}>
                <CardCanvas state={state} theme={theme} char={char} weapon={weapon} colorScheme={state.colorScheme} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          CONFIG PANEL — TABBED, BELOW THE CARD
          ════════════════════════════════════════════ */}
      <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 py-4">
        {/* Tab bar */}
        <div className="flex border-b border-[var(--color-border)] mb-4 overflow-x-auto">
          <TabButton label="Operator" active={activeTab === 'operator'} onClick={() => setActiveTab('operator')} />
          <TabButton label="Weapon" active={activeTab === 'weapon'} onClick={() => setActiveTab('weapon')} />
          <TabButton label="Equipment" active={activeTab === 'equipment'} onClick={() => setActiveTab('equipment')} />
          <TabButton label="Skills & Info" active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} />
          <TabButton label="Style" active={activeTab === 'style'} onClick={() => setActiveTab('style')} />
        </div>

        {/* ──── OPERATOR TAB ──── */}
        {activeTab === 'operator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Character Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Character</h3>
              <button onClick={() => setCharPickerOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 transition-colors">
                {CHARACTER_ICONS[char.Name] ? (
                  <Image src={CHARACTER_ICONS[char.Name]} alt={char.Name} width={48} height={48} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-[var(--color-surface-2)] flex items-center justify-center text-lg font-bold">{char.Name[0]}</div>
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-mono" style={{ color: RARITY_COLORS[char.Rarity] }}>{'★'.repeat(char.Rarity)}</div>
                  <div className="text-white font-bold">{char.Name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{char.Element} {char.Role} - {char.WeaponType}</div>
                </div>
              </button>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Level</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">Lv.</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={state.level}
                    onChange={e => {
                      const v = Math.max(1, Math.min(90, Number(e.target.value) || 1));
                      updateState({ level: v });
                    }}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Breakthrough / Potential / Affinity */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Progression</h3>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Breakthrough</label>
                <div className="flex gap-1.5">
                  {CHAR_BREAKTHROUGH_LABELS.map((label, i) => (
                    <button key={i} onClick={() => updateState({ charBreakthrough: i })}
                      className={`flex-1 py-2 text-center text-sm font-bold border transition-colors ${
                        state.charBreakthrough === i
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Potential</label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map(p => (
                    <button key={p} onClick={() => updateState({ potential: p })}
                      className={`flex-1 py-2 text-center text-sm font-bold border transition-colors ${
                        state.potential === p
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Affinity</label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(a => (
                    <button key={a} onClick={() => updateState({ affinity: a })}
                      className={`flex-1 py-2 text-center text-sm font-bold border transition-colors ${
                        state.affinity === a
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Talent Levels */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Talents</h3>
              {state.talentStates.map((ts, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="text-xs text-[var(--color-text-muted)]">Talent {i + 1}</div>
                  <div className="flex gap-1.5">
                    {(['locked', 'base', 'upgrade'] as TalentState[]).map(t => (
                      <button key={t} onClick={() => {
                        const newTalents = [...state.talentStates];
                        newTalents[i] = t;
                        updateState({ talentStates: newTalents });
                      }}
                        className={`flex-1 py-2 text-xs font-bold border transition-colors ${
                          ts === t
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                            : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                        }`}>{t === 'locked' ? 'Locked' : t === 'base' ? 'Base' : 'Upgrade'}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── WEAPON TAB ──── */}
        {activeTab === 'weapon' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Weapon Selection</h3>
              <button onClick={() => setWeaponPickerOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 transition-colors">
                {weapon && WEAPON_ICONS[weapon.Name] ? (
                  <Image src={WEAPON_ICONS[weapon.Name]} alt={weapon.Name} width={40} height={40} className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-[var(--color-surface-2)] flex items-center justify-center"><Sword size={16} /></div>
                )}
                <div className="flex-1 text-left">
                  {weapon && <div className="text-sm font-mono" style={{ color: RARITY_COLORS[weapon.Rarity] }}>{'★'.repeat(weapon.Rarity)}</div>}
                  <div className="text-white font-bold">{weapon?.Name || 'Select Weapon'}</div>
                </div>
              </button>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Weapon Level</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">Lv.</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={state.weaponLevel}
                    onChange={e => {
                      const v = Math.max(1, Math.min(90, Number(e.target.value) || 1));
                      updateState({ weaponLevel: v });
                    }}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Weapon Progression</h3>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Breakthrough</label>
                <div className="flex gap-1.5">
                  {WEAPON_BREAKTHROUGH_LABELS.map((label, i) => (
                    <button key={i} onClick={() => updateState({ weaponBreakthrough: i })}
                      className={`flex-1 py-2 text-xs font-bold border transition-colors ${
                        state.weaponBreakthrough === i
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Weapon Potential</label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map(p => (
                    <button key={p} onClick={() => updateState({ weaponPotential: p })}
                      className={`flex-1 py-2 text-center text-sm font-bold border transition-colors ${
                        state.weaponPotential === p
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── EQUIPMENT TAB ──── */}
        {activeTab === 'equipment' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['equipBody', 'equipHand', 'equipEdc1', 'equipEdc2'] as const).map((slotKey) => {
              const slot = state[slotKey];
              const slotLabel = slotKey === 'equipBody' ? 'Body' : slotKey === 'equipHand' ? 'Hand' : slotKey === 'equipEdc1' ? 'EDC 1' : 'EDC 2';
              const slotType: 'Body' | 'Hand' | 'EDC' = slotKey === 'equipBody' ? 'Body' : slotKey === 'equipHand' ? 'Hand' : 'EDC';
              const piece = slot.pieceName ? findGearPieceByName(slot.pieceName) : null;
              return (
                <div key={slotKey} className="border border-[var(--color-border)] p-3 space-y-2 bg-[var(--color-surface)]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-accent)] font-bold uppercase tracking-wider">{slotLabel}</span>
                    {slot.pieceName && (
                      <button onClick={() => updateState({ [slotKey]: defaultEquipSlot() })}
                        className="text-[10px] text-[var(--color-text-muted)] hover:text-red-400 transition-colors">Clear</button>
                    )}
                  </div>
                  <button onClick={() => setEquipPickerOpen({ slot: slotType, target: slotKey })}
                    className="w-full flex items-center gap-2.5 p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] transition-colors text-left min-h-[48px]">
                    {piece ? (
                      <>
                        {piece.icon ? (
                          <Image src={piece.icon} alt={piece.name} width={32} height={32} className="w-8 h-8 object-contain flex-shrink-0" unoptimized />
                        ) : (
                          <span className="text-xs font-bold w-8 h-8 flex items-center justify-center" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white truncate block">{piece.name}</span>
                          <span className="text-[10px] font-bold" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-[var(--color-text-muted)]">Click to select</span>
                    )}
                  </button>
                  {slot.pieceName && (
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Artifice Level</label>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map(a => (
                          <button key={a} onClick={() => updateState({ [slotKey]: { ...slot, artifice: a } })}
                            className={`flex-1 py-1.5 text-xs font-bold border transition-colors ${
                              slot.artifice === a
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                            }`}>+{a}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ──── SKILLS & INFO TAB ──── */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Skill Levels */}
            <div className="space-y-3 md:col-span-2 lg:col-span-2">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Skill Levels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILL_TYPES.map(sk => {
                  const currentLevel = state.skillLevels[sk.key as keyof typeof state.skillLevels];
                  return (
                    <div key={sk.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--color-text-muted)]">{sk.label}</span>
                        <span className="text-xs text-[var(--color-accent)] font-bold font-mono">Lv. {currentLevel}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(lv => (
                          <SkillLevelBtn key={lv} level={lv} active={currentLevel === lv}
                            onClick={() => updateState({ skillLevels: { ...state.skillLevels, [sk.key]: lv } })} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customization / Card Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical">Card Info</h3>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Showcase Name</label>
                <input type="text" value={state.name} onChange={e => updateState({ name: e.target.value })} placeholder="Optional title"
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Username</label>
                <input type="text" value={state.username} onChange={e => updateState({ username: e.target.value })} placeholder="In-game name"
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">User Code</label>
                  <input type="text" value={state.userCode} onChange={e => updateState({ userCode: e.target.value })} placeholder="ID"
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Server</label>
                  <select value={state.server} onChange={e => updateState({ server: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]">
                    <option value="">Select</option>
                    <option value="NA/EU">NA / EU</option>
                    <option value="Asia">Asia</option>
                    <option value="CN">CN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── STYLE TAB ──── */}
        {activeTab === 'style' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color Scheme */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical flex items-center gap-2">
                <Palette size={14} /> Color Scheme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(COLOR_SCHEMES) as [ColorScheme, typeof COLOR_SCHEMES.auto][]).map(([key, scheme]) => (
                  <button key={key} onClick={() => updateState({ colorScheme: key as ColorScheme })}
                    className={`flex items-center gap-3 p-3 border transition-all text-left ${
                      state.colorScheme === key
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
                    }`}>
                    <div className="w-8 h-8 flex-shrink-0 border border-[var(--color-border)]" style={{
                      background: scheme.bgGrad,
                      boxShadow: scheme.tint ? `inset 0 0 12px ${scheme.tint}30` : undefined,
                    }} />
                    <div>
                      <div className="text-sm text-white font-bold">{scheme.label}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">{scheme.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider font-tactical flex items-center gap-2">
                <Sun size={14} /> Brightness
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={state.brightness}
                    onChange={e => updateState({ brightness: parseFloat(e.target.value) })}
                    className="flex-1 h-1 bg-[var(--color-border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--color-accent)] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="text-sm font-mono text-[var(--color-accent)] font-bold w-12 text-right">
                    {Math.round(state.brightness * 100)}%
                  </span>
                </div>
                <div className="flex gap-2">
                  {[0.6, 0.8, 1.0, 1.2, 1.4].map(v => (
                    <button key={v} onClick={() => updateState({ brightness: v })}
                      className={`flex-1 py-2 text-xs font-bold border transition-colors ${
                        state.brightness === v
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                          : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
                      }`}>{Math.round(v * 100)}%</button>
                  ))}
                </div>
                <button onClick={() => updateState({ brightness: 1.0 })}
                  className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors underline">
                  Reset to default
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CharacterPickerModal open={charPickerOpen} onClose={() => setCharPickerOpen(false)} onSelect={handleCharacterSelect} currentName={state.charName} />
      <WeaponPickerModal open={weaponPickerOpen} onClose={() => setWeaponPickerOpen(false)} onSelect={handleWeaponSelect} weaponType={char.WeaponType} currentName={state.weaponName} />
      {equipPickerOpen && (
        <EquipmentPickerModal
          open={true}
          onClose={() => setEquipPickerOpen(null)}
          onSelect={(piece, setName) => handleEquipSelect(piece, setName, equipPickerOpen.target)}
          slotType={equipPickerOpen.slot}
          currentPieceName={state[equipPickerOpen.target].pieceName}
        />
      )}
    </div>
  );
}
