'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, CHARACTER_GACHA, CHARACTER_BANNERS, PROFESSION_ICONS, WEAPON_ICONS, STAT_ICONS, EQUIPMENT_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, Role, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Star, Sparkles, Share2, ChevronDown, Sword, Shield, Zap, Heart, Crosshair, Flame, Save, FolderOpen, FilePlus2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { WEAPON_DATA } from '@/data/weapons';
import { WEAPON_ESSENCES } from '@/data/essences';

// ──────────── Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; accent: string; glow: string }> = {
  Physical: { primary: '#CCCCCC', bg: '#0a0e14', accent: '#888899', glow: 'rgba(200,200,200,0.3)' },
  Heat: { primary: '#FF6B35', bg: '#0a0e14', accent: '#CC5522', glow: 'rgba(255,107,53,0.4)' },
  Cryo: { primary: '#00BFFF', bg: '#0a0e14', accent: '#0088CC', glow: 'rgba(0,191,255,0.4)' },
  Electric: { primary: '#C084FC', bg: '#0a0e14', accent: '#9060CC', glow: 'rgba(192,132,252,0.4)' },
  Nature: { primary: '#34D399', bg: '#0a0e14', accent: '#22AA77', glow: 'rgba(52,211,153,0.4)' },
};

// ──────────── Equipment Data ────────────

const EQUIPMENT_SETS = [
  { name: 'Swordmancer', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Æthertech', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Type 50 Yinglung', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'LYNX', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Eternal Xiranite', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Tide Surge', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Hot Work', tier: 'T4', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Catastrophe', tier: 'T3', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Mordvolt Insulation', tier: 'T2', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Mordvolt Resistant', tier: 'T2', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'Armored MSGR', tier: 'T2', slots: ['Body', 'Hand', 'EDC'] },
  { name: 'AIC Heavy', tier: 'T1', slots: ['Body', 'Hand', 'EDC'] },
];

const SLOT_SUFFIXES: Record<string, string> = {
  Body: 'Heavy Armor',
  Hand: 'Gloves',
  'EDC 1': 'Flint',
  'EDC 2': 'Flint',
};

const ARTIFICE_STATS = ['ATK %', 'DEF %', 'HP %', 'CRIT Rate', 'CRIT DMG', 'Elem DMG'];

interface EquipmentSlotState {
  setName: string;
  artifice: number;
  substat1: string;
  substat2: string;
  substat3: string;
}

// ──────────── Computed Stats ────────────

function computeStats(char: Character, level: number, potential: number) {
  const lvScale = level / 80;
  const potScale = 1 + potential * 0.02;
  const hp = Math.round((3200 + char.Strength * 18 + char.Will * 8) * lvScale * potScale);
  const atk = Math.round((120 + char.Strength * 8 + char.Intellect * 6 + char.Agility * 3) * lvScale * potScale);
  const def = Math.round((80 + char.Will * 4 + char.Strength * 3) * lvScale * potScale);
  const critRate = 5.0 + char.Agility * 0.008;
  const critDmg = 50.0 + char.Intellect * 0.02;
  return {
    HP: hp, ATK: atk, DEF: def,
    STR: char.Strength, AGI: char.Agility, INT: char.Intellect, WILL: char.Will,
    'CRIT Rate': Math.round(critRate * 10) / 10,
    'CRIT DMG': Math.round(critDmg * 10) / 10,
  };
}

// ──────────── Skill Data ────────────

const SKILL_TYPES = [
  { key: 'basic', label: 'Basic Attack', short: 'ATK', icon: Sword },
  { key: 'normal', label: 'Normal Skill', short: 'SKL', icon: Zap },
  { key: 'combo', label: 'Combo Skill', short: 'CMB', icon: Crosshair },
  { key: 'ultimate', label: 'Ultimate Skill', short: 'ULT', icon: Flame },
];

// ──────────── Breakthrough Data ────────────

const CHAR_BREAKTHROUGH_LABELS = ['B0', 'B1', 'B2', 'B3', 'B4'];
const WEAPON_BREAKTHROUGH_LABELS = ['B0', 'B1', 'B2', 'B3'];

// ──────────── Character Talents ────────────
// Each character has 2 talents. We use generic names since we don't have per-character talent data.
const CHARACTER_TALENTS: Record<string, { name: string; type: string }[]> = {
  Laevatain: [{ name: 'Blazing Will', type: 'Character' }, { name: 'Flame Resonance', type: 'Character' }],
  Endministrator: [{ name: 'Essence Disintegration', type: 'Character' }, { name: 'Realspace Stasis', type: 'Character' }],
  'Chen Qianyu': [{ name: 'Cryo Convergence', type: 'Character' }, { name: 'Frozen Dominion', type: 'Character' }],
  Ember: [{ name: 'Ember Ignition', type: 'Character' }, { name: 'Thermal Cascade', type: 'Character' }],
  Perlica: [{ name: 'Crystal Resonance', type: 'Character' }, { name: 'Prismatic Aegis', type: 'Character' }],
  Lifeguard: [{ name: 'Tidal Recovery', type: 'Character' }, { name: 'Ocean Barrier', type: 'Character' }],
  Akekuri: [{ name: 'Shadow Step', type: 'Character' }, { name: 'Void Strike', type: 'Character' }],
  Wulfgard: [{ name: 'Pack Hunter', type: 'Character' }, { name: 'Savage Instinct', type: 'Character' }],
  Ardelia: [{ name: 'Nature Binding', type: 'Character' }, { name: 'Verdant Shield', type: 'Character' }],
};
const DEFAULT_TALENTS = [{ name: 'Talent 1', type: 'Character' }, { name: 'Talent 2', type: 'Character' }];

type TalentState = 'locked' | 'base' | 'upgrade';

// ──────────── Equipment Substat Data ────────────

const EQUIPMENT_SUBSTATS: Record<string, { stat: string; base: number }[]> = {
  Swordmancer: [{ stat: 'Agility', base: 87 }, { stat: 'Strength', base: 58 }, { stat: 'Arts Intensity', base: 21 }],
  'Æthertech': [{ stat: 'Agility', base: 65 }, { stat: 'Strength', base: 43 }, { stat: 'Arts Intensity', base: 35 }],
  'Type 50 Yinglung': [{ stat: 'Strength', base: 78 }, { stat: 'Will', base: 52 }, { stat: 'Physical DMG', base: 18 }],
  LYNX: [{ stat: 'Agility', base: 72 }, { stat: 'Intellect', base: 48 }, { stat: 'Electric DMG', base: 23 }],
  'Eternal Xiranite': [{ stat: 'Intellect', base: 82 }, { stat: 'Will', base: 55 }, { stat: 'Cryo DMG', base: 20 }],
  'Tide Surge': [{ stat: 'Will', base: 76 }, { stat: 'Strength', base: 51 }, { stat: 'Nature DMG', base: 22 }],
  'Hot Work': [{ stat: 'Strength', base: 84 }, { stat: 'Agility', base: 56 }, { stat: 'Heat DMG', base: 19 }],
  Catastrophe: [{ stat: 'Agility', base: 52 }, { stat: 'Strength', base: 35 }, { stat: 'Physical DMG', base: 15 }],
  'Mordvolt Insulation': [{ stat: 'Will', base: 42 }, { stat: 'Intellect', base: 28 }, { stat: 'Electric DMG', base: 12 }],
  'Mordvolt Resistant': [{ stat: 'Strength', base: 45 }, { stat: 'Will', base: 30 }, { stat: 'Physical DMG', base: 13 }],
  'Armored MSGR': [{ stat: 'Agility', base: 38 }, { stat: 'Strength', base: 25 }, { stat: 'Arts Intensity', base: 10 }],
  'AIC Heavy': [{ stat: 'Strength', base: 28 }, { stat: 'Will', base: 19 }, { stat: 'Physical DMG', base: 8 }],
};

function getSubstatValue(base: number, artificeLevel: number): string {
  const multiplier = 1 + artificeLevel * 0.15;
  const val = Math.round(base * multiplier);
  const stat = base > 50 ? `+${val}` : `+${(val / 10).toFixed(1)}%`;
  return stat;
}

// ──────────── Showcase State Type ────────────

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
  colorTheme: string;
}

// ──────────── Character Picker Modal ────────────

function CharacterPickerModal({
  open, onClose, onSelect, currentName,
}: {
  open: boolean; onClose: () => void; onSelect: (c: Character) => void; currentName: string;
}) {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);

  const filtered = useMemo(() => {
    return CHARACTERS.filter(c => {
      if (search && !c.Name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarityFilter && c.Rarity !== rarityFilter) return false;
      if (elementFilter && c.Element !== elementFilter) return false;
      if (roleFilter && c.Role !== roleFilter) return false;
      return true;
    });
  }, [search, rarityFilter, elementFilter, roleFilter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
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
                className={`px-2.5 py-1 text-sm font-bold border transition-colors ${elementFilter === el ? '' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'}`}
                style={elementFilter === el ? { borderColor: ELEMENT_COLORS[el], color: ELEMENT_COLORS[el], backgroundColor: ELEMENT_COLORS[el] + '15' } : undefined}
              >{el}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Guard', 'Assault', 'Defender', 'Vanguard', 'Supporter', 'Caster'] as Role[]).map(r => (
              <button key={r} onClick={() => setRoleFilter(roleFilter === r ? null : r)}
                className={`px-2.5 py-1 text-sm font-bold border transition-colors ${roleFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'}`}
              >{r}</button>
            ))}
          </div>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {filtered.map(c => {
              const icon = CHARACTER_ICONS[c.Name];
              const isSelected = c.Name === currentName;
              return (
                <button key={c.Name} onClick={() => { onSelect(c); onClose(); }}
                  className={`relative flex flex-col items-center border p-1.5 transition-all ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
                >
                  <div className="relative w-full aspect-square bg-[#0A0A0A] overflow-hidden">
                    {icon && <Image src={icon} alt={c.Name} fill className="object-cover" sizes="80px" unoptimized />}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex justify-center py-0.5">
                      {Array.from({ length: c.Rarity }).map((_, i) => (
                        <Star key={i} size={8} className="fill-current" style={{ color: RARITY_COLORS[c.Rarity] }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-white mt-1 text-center leading-tight truncate w-full">{c.Name}</span>
                  <span className="text-[10px] mt-0.5" style={{ color: ELEMENT_COLORS[c.Element] }}>{c.Element}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Weapon Picker Modal ────────────

function WeaponPickerModal({
  open, onClose, onSelect, weaponType, currentName,
}: {
  open: boolean; onClose: () => void; onSelect: (w: Weapon) => void; weaponType: WeaponType; currentName: string;
}) {
  const compatible = useMemo(() => WEAPONS.filter(w => w.WeaponType === weaponType), [weaponType]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Select {weaponType}</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          {compatible.map(w => {
            const icon = WEAPON_ICONS[w.Name];
            const isSelected = w.Name === currentName;
            return (
              <button key={w.Name} onClick={() => { onSelect(w); onClose(); }}
                className={`w-full flex items-center gap-3 p-2 border transition-colors ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
              >
                <div className="w-12 h-12 bg-[var(--color-surface-2)] flex-shrink-0 relative">
                  {icon && <Image src={icon} alt={w.Name} fill className="object-contain p-0.5" sizes="48px" unoptimized />}
                </div>
                <div className="text-left">
                  <div className="text-sm text-white">{w.Name}</div>
                  <div className="text-sm flex items-center gap-0.5">
                    {Array.from({ length: w.Rarity }).map((_, i) => (
                      <Star key={i} size={10} className="fill-current" style={{ color: RARITY_COLORS[w.Rarity] || '#888' }} />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────── Equipment Picker Modal ────────────

function EquipmentPickerModal({
  open, onClose, onSelect, slot, currentSet,
}: {
  open: boolean; onClose: () => void; onSelect: (setName: string) => void; slot: string; currentSet: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-sm max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Select {slot} Equipment</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          <button onClick={() => { onSelect(''); onClose(); }}
            className={`w-full flex items-center gap-3 p-2 border transition-colors ${!currentSet ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
          >
            <div className="w-12 h-12 bg-[var(--color-surface-2)] flex-shrink-0 flex items-center justify-center">
              <X size={18} className="text-[var(--color-text-muted)]" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">None</span>
          </button>
          {EQUIPMENT_SETS.map(eq => {
            const icon = EQUIPMENT_ICONS[eq.name];
            const isSelected = eq.name === currentSet;
            return (
              <button key={eq.name} onClick={() => { onSelect(eq.name); onClose(); }}
                className={`w-full flex items-center gap-3 p-2 border transition-colors ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
              >
                <div className="w-12 h-12 bg-[var(--color-surface-2)] flex-shrink-0 relative">
                  {icon && <Image src={icon} alt={eq.name} fill className="object-contain p-0.5" sizes="48px" unoptimized />}
                </div>
                <div className="text-left">
                  <div className="text-sm text-white">{eq.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{eq.tier}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────── Main Page ────────────

const inputClass = "w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]";
const sectionClass = "bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 space-y-3 shadow-[var(--shadow-card)]";

export default function CharacterCardPage() {
  // Character - Pre-load Laevatain
  const [selectedCharName, setSelectedCharName] = useState('Laevatain');
  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const [level, setLevel] = useState(80);
  const [potential, setPotential] = useState(0);
  const [affinity, setAffinity] = useState(5);
  const [charBreakthrough, setCharBreakthrough] = useState(3);

  // Weapon - Pre-load Forgeborn Scathe
  const [selectedWeaponName, setSelectedWeaponName] = useState('Forgeborn Scathe');
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const [weaponLevel, setWeaponLevel] = useState(80);
  const [weaponBreakthrough, setWeaponBreakthrough] = useState(3);
  const [weaponPotential, setWeaponPotential] = useState(0);
  const [essenceLevels, setEssenceLevels] = useState([3, 2, 1]);

  // User Info
  const [showcaseName, setShowcaseName] = useState('');
  const [username, setUsername] = useState('');
  const [userCode, setUserCode] = useState('');
  const [server, setServer] = useState('');

  // Skills - Pre-loaded values
  const [skillLevels, setSkillLevels] = useState({ basic: 10, normal: 10, combo: 8, ultimate: 10 });

  // Talents
  const [talentStates, setTalentStates] = useState<TalentState[]>(['locked', 'locked']);

  // Equipment - Pre-load Swordmancer set
  const defaultEquip: EquipmentSlotState = { setName: '', artifice: 0, substat1: '', substat2: '', substat3: '' };
  const [equipBody, setEquipBody] = useState<EquipmentSlotState>({ setName: 'Swordmancer', artifice: 3, substat1: '', substat2: '', substat3: '' });
  const [equipHand, setEquipHand] = useState<EquipmentSlotState>({ setName: 'Swordmancer', artifice: 3, substat1: '', substat2: '', substat3: '' });
  const [equipEdc1, setEquipEdc1] = useState<EquipmentSlotState>({ setName: 'Swordmancer', artifice: 2, substat1: '', substat2: '', substat3: '' });
  const [equipEdc2, setEquipEdc2] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipPickerSlot, setEquipPickerSlot] = useState<string | null>(null);

  // Theme
  const [colorTheme, setColorTheme] = useState('auto');

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Save/Load
  const [saveMessage, setSaveMessage] = useState('');

  // Preview scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        setPreviewScale(containerWidth / 1200);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const character = CHARACTERS.find(c => c.Name === selectedCharName) || null;
  const weapon = WEAPONS.find(w => w.Name === selectedWeaponName) || null;
  const effectiveTheme = colorTheme === 'auto' && character ? character.Element : colorTheme;
  const theme = THEME_COLORS[effectiveTheme] || THEME_COLORS.Physical;

  const splashUrl = character ? CHARACTER_SPLASH[character.Name] : null;
  const iconUrl = character ? CHARACTER_ICONS[character.Name] : null;
  const roleIconUrl = character ? PROFESSION_ICONS[character.Role] : null;
  const weaponIconUrl = weapon ? WEAPON_ICONS[weapon.Name] : null;

  const stats = character ? computeStats(character, level, potential) : null;

  // Weapon data from detailed weapons database
  const weaponData = weapon ? WEAPON_DATA.find(w => w.Name === weapon.Name) : null;
  const weaponEssence = weapon ? WEAPON_ESSENCES.find(e => e.name === weapon.Name) : null;

  // Talents for current character
  const talents = CHARACTER_TALENTS[selectedCharName] || DEFAULT_TALENTS;

  // Save showcase to localStorage
  const saveShowcase = useCallback(() => {
    const state: ShowcaseState = {
      name: showcaseName || `${selectedCharName} Build`,
      charName: selectedCharName, level, potential, affinity, charBreakthrough,
      weaponName: selectedWeaponName, weaponLevel, weaponBreakthrough, weaponPotential, essenceLevels,
      username, userCode, server, skillLevels,
      equipBody, equipHand, equipEdc1, equipEdc2,
      talentStates, colorTheme,
    };
    const saves = JSON.parse(localStorage.getItem('zs-showcases') || '[]');
    saves.push({ ...state, savedAt: new Date().toISOString() });
    localStorage.setItem('zs-showcases', JSON.stringify(saves));
    setSaveMessage('Saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  }, [showcaseName, selectedCharName, level, potential, affinity, charBreakthrough, selectedWeaponName, weaponLevel, weaponBreakthrough, weaponPotential, essenceLevels, username, userCode, server, skillLevels, equipBody, equipHand, equipEdc1, equipEdc2, talentStates, colorTheme]);

  // Load showcase from localStorage
  const loadShowcase = useCallback((state: ShowcaseState) => {
    setSelectedCharName(state.charName);
    setLevel(state.level);
    setPotential(state.potential);
    setAffinity(state.affinity);
    setCharBreakthrough(state.charBreakthrough || 0);
    setSelectedWeaponName(state.weaponName);
    setWeaponLevel(state.weaponLevel);
    setWeaponBreakthrough(state.weaponBreakthrough || 0);
    setWeaponPotential(state.weaponPotential || 0);
    setEssenceLevels(state.essenceLevels || [1, 1, 1]);
    setShowcaseName(state.name);
    setUsername(state.username);
    setUserCode(state.userCode);
    setServer(state.server);
    setSkillLevels(state.skillLevels);
    setEquipBody(state.equipBody);
    setEquipHand(state.equipHand);
    setEquipEdc1(state.equipEdc1);
    setEquipEdc2(state.equipEdc2);
    setTalentStates(state.talentStates || ['locked', 'locked']);
    setColorTheme(state.colorTheme);
  }, []);

  // Reset to new
  const resetShowcase = useCallback(() => {
    setSelectedCharName('Laevatain');
    setLevel(80);
    setPotential(0);
    setAffinity(5);
    setCharBreakthrough(3);
    setSelectedWeaponName('Forgeborn Scathe');
    setWeaponLevel(80);
    setWeaponBreakthrough(3);
    setWeaponPotential(0);
    setEssenceLevels([3, 2, 1]);
    setShowcaseName('');
    setUsername('');
    setUserCode('');
    setServer('');
    setSkillLevels({ basic: 10, normal: 10, combo: 8, ultimate: 10 });
    setEquipBody({ setName: 'Swordmancer', artifice: 3, substat1: '', substat2: '', substat3: '' });
    setEquipHand({ setName: 'Swordmancer', artifice: 3, substat1: '', substat2: '', substat3: '' });
    setEquipEdc1({ setName: 'Swordmancer', artifice: 2, substat1: '', substat2: '', substat3: '' });
    setEquipEdc2({ setName: '', artifice: 0, substat1: '', substat2: '', substat3: '' });
    setTalentStates(['locked', 'locked']);
    setColorTheme('auto');
  }, []);

  // Load saved showcases list
  const [showLoadModal, setShowLoadModal] = useState(false);
  const savedShowcases: (ShowcaseState & { savedAt: string })[] = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('zs-showcases') || '[]'); } catch { return []; }
  }, [showLoadModal]); // re-read when modal opens

  const equipSlots = [
    { label: 'Body', state: equipBody, setter: setEquipBody },
    { label: 'Hand', state: equipHand, setter: setEquipHand },
    { label: 'EDC 1', state: equipEdc1, setter: setEquipEdc1 },
    { label: 'EDC 2', state: equipEdc2, setter: setEquipEdc2 },
  ];

  const currentEquipPickerState = equipSlots.find(s => s.label === equipPickerSlot);

  // Export functions
  const downloadCard = async (format: 'png' | 'jpg' = 'png') => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 2, useCORS: true, allowTaint: true, logging: false,
      });
      const url = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zerosanity-${(character?.Name || 'card').toLowerCase().replace(/\s+/g, '-')}.${format}`;
      a.click();
    } catch { /* ignore */ }
    setIsExporting(false);
  };

  const exportCard = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 2, useCORS: true, allowTaint: true, logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => { resolve(blob); setIsExporting(false); }, 'image/png');
      });
    } catch { setIsExporting(false); return null; }
  }, []);

  const copyToClipboard = async () => {
    const blob = await exportCard();
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert('Card copied to clipboard!');
    } catch { alert('Clipboard copy not supported. Use download instead.'); }
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const text = showcaseName
      ? `${showcaseName} - ${character?.Name} Showcase | Made with Zero Sanity`
      : `Check out my ${character?.Name} build! Made with Zero Sanity`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToReddit = () => {
    window.open(`https://reddit.com/submit?title=${encodeURIComponent(`${character?.Name} Showcase - Zero Sanity`)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank');
    setShowShareMenu(false);
  };

  const equippedSets = [equipBody, equipHand, equipEdc1, equipEdc2].filter(e => e.setName);

  return (
    <div className="text-[var(--color-text-secondary)]">
      <RIOSHeader title="Operator Showcase Creator" category="MEDIA" code="RIOS-CARD-001" icon={<Sparkles size={28} />}
        subtitle="Create and share beautiful character showcase cards" />

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* ═══════ LEFT: Card Preview ═══════ */}
        <div className="order-2 xl:order-1 flex-1 min-w-0">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-bold text-white mb-4">Card Preview</h2>

            {character && stats ? (
              <div ref={previewContainerRef} style={{ width: '100%', overflow: 'hidden' }}>
                <div
                  ref={cardRef}
                  style={{
                    width: '1200px',
                    height: '675px',
                    transformOrigin: 'top left',
                    transform: `scale(${previewScale})`,
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a0e14',
                  }}
                >
                  {/* ── Background: Character Art Zone (Left 0-700px) ── */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '700px',
                    height: '675px',
                    overflow: 'hidden',
                  }}>
                    {splashUrl && (
                      <img
                        src={splashUrl}
                        alt={character.Name}
                        crossOrigin="anonymous"
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                      />
                    )}
                    {/* Bottom gradient fade */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '200px',
                      background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)`,
                    }} />
                    {/* Right gradient fade to data panel */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: '150px',
                      background: `linear-gradient(to right, transparent 0%, ${theme.bg} 100%)`,
                    }} />
                    {/* Element glow around art area */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      boxShadow: `inset 0 0 80px ${theme.glow}`,
                      pointerEvents: 'none',
                    }} />
                  </div>

                  {/* ── Top accent line ── */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: theme.primary,
                    zIndex: 30,
                  }} />

                  {/* ── Right Side: Data Dossier Panel (680-1200px) ── */}
                  <div style={{
                    position: 'absolute',
                    left: '680px',
                    top: 0,
                    width: '520px',
                    height: '675px',
                    background: 'rgba(10, 14, 20, 0.92)',
                    borderLeft: `3px solid ${theme.primary}`,
                    padding: '30px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10,
                  }}>
                    {/* Scanline overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                      pointerEvents: 'none',
                    }} />

                    {/* Grid pattern */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `linear-gradient(${theme.primary}15 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}15 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      opacity: 0.3,
                      pointerEvents: 'none',
                    }} />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {/* Top: OPERATOR FILE label */}
                      <div style={{
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '10px',
                        letterSpacing: '2px',
                        color: theme.accent,
                        marginBottom: '8px',
                      }}>OPERATOR FILE</div>

                      {/* Character name */}
                      <h1 style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '40px',
                        fontWeight: 700,
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        lineHeight: '1',
                        marginBottom: '8px',
                      }}>{character.Name}</h1>

                      {/* Rarity stars */}
                      <div style={{ marginBottom: '12px' }}>
                        {Array.from({ length: character.Rarity }).map((_, i) => (
                          <span key={i} style={{ color: theme.primary, fontSize: '14px' }}>★</span>
                        ))}
                      </div>

                      {/* Divider line */}
                      <div style={{
                        height: '1px',
                        background: `linear-gradient(to right, ${theme.primary} 0%, transparent 100%)`,
                        marginBottom: '16px',
                      }} />

                      {/* Element + Role badges */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          background: ELEMENT_COLORS[character.Element] + '30',
                          border: `1px solid ${ELEMENT_COLORS[character.Element]}`,
                        }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: ELEMENT_COLORS[character.Element],
                            textTransform: 'uppercase',
                          }}>{character.Element}</span>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}>
                          {roleIconUrl && (
                            <img src={roleIconUrl} alt={character.Role} crossOrigin="anonymous" style={{ width: '14px', height: '14px' }} />
                          )}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}>{character.Role}</span>
                        </div>
                      </div>

                      {/* Level + Breakthrough display */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: 'rgba(0,0,0,0.5)',
                          border: `2px solid ${theme.primary}`,
                        }}>
                          <span style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '12px',
                            color: theme.accent,
                            marginRight: '6px',
                          }}>LV</span>
                          <span style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '32px',
                            fontWeight: 700,
                            color: '#ffffff',
                          }}>{level}</span>
                        </div>
                        {charBreakthrough > 0 && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {Array.from({ length: charBreakthrough }).map((_, i) => (
                              <span key={i} style={{ color: theme.primary, fontSize: '14px' }}>✦</span>
                            ))}
                          </div>
                        )}
                        {potential > 0 && (
                          <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '11px', color: theme.accent }}>P{potential}</span>
                        )}
                      </div>

                      {/* Core attributes: 2x2 grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {[
                          { label: 'STR', value: stats.STR, icon: STAT_ICONS.Strength },
                          { label: 'AGI', value: stats.AGI, icon: STAT_ICONS.Agility },
                          { label: 'INT', value: stats.INT, icon: STAT_ICONS.Intellect },
                          { label: 'WILL', value: stats.WILL, icon: STAT_ICONS.Will },
                        ].map(attr => (
                          <div key={attr.label} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.4)',
                            border: `1px solid ${theme.primary}30`,
                          }}>
                            <img src={attr.icon} alt={attr.label} crossOrigin="anonymous" style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{attr.label}</span>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginLeft: 'auto' }}>{attr.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Combat stats: HP/ATK/DEF in a row */}
                      <div style={{ marginBottom: '16px' }}>
                        {[
                          { label: 'HP', value: stats.HP.toLocaleString() },
                          { label: 'ATK', value: stats.ATK.toLocaleString() },
                          { label: 'DEF', value: stats.DEF.toLocaleString() },
                        ].map(stat => (
                          <div key={stat.label} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: `1px solid ${theme.primary}15`,
                          }}>
                            <span style={{ fontSize: '12px', color: theme.accent, fontWeight: 700 }}>{stat.label}</span>
                            <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 700 }}>{stat.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* CRIT Rate and CRIT DMG */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                        }}>
                          <span style={{ fontSize: '11px', color: theme.primary, fontWeight: 700 }}>CRIT Rate</span>
                          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{stats['CRIT Rate']}%</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 0',
                        }}>
                          <span style={{ fontSize: '11px', color: theme.primary, fontWeight: 700 }}>CRIT DMG</span>
                          <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{stats['CRIT DMG']}%</span>
                        </div>
                      </div>

                      {/* Skills section */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{
                          fontSize: '10px',
                          color: theme.accent,
                          marginBottom: '8px',
                          letterSpacing: '1px',
                          fontWeight: 700,
                        }}>COMBAT SKILLS</div>
                        {SKILL_TYPES.map(skill => {
                          const lv = skillLevels[skill.key as keyof typeof skillLevels];
                          return (
                            <div key={skill.key} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '6px',
                            }}>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', width: '32px' }}>{skill.short}</span>
                              <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                                {Array.from({ length: 12 }).map((_, idx) => (
                                  <div key={idx} style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: idx < lv ? theme.primary : 'rgba(255,255,255,0.15)',
                                  }} />
                                ))}
                              </div>
                              <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: 700, width: '24px', textAlign: 'right' }}>{lv}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Weapon display */}
                      {weapon && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px',
                          background: 'rgba(0,0,0,0.5)',
                          border: `1px solid ${theme.primary}30`,
                          marginBottom: '12px',
                        }}>
                          {weaponIconUrl && (
                            <img src={weaponIconUrl} alt={weapon.Name} crossOrigin="anonymous" style={{ width: '32px', height: '32px' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700 }}>{weapon.Name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {Array.from({ length: weapon.Rarity }).map((_, i) => (
                                <span key={i} style={{ color: RARITY_COLORS[weapon.Rarity] || '#888', fontSize: '9px' }}>★</span>
                              ))}
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Lv.{weaponLevel}</span>
                              {weaponBreakthrough > 0 && (
                                <span style={{ fontSize: '8px', color: theme.accent }}>B{weaponBreakthrough}</span>
                              )}
                              {weaponPotential > 0 && (
                                <span style={{ fontSize: '8px', color: theme.primary }}>P{weaponPotential}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Equipment summary */}
                      {equippedSets.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{
                            fontSize: '9px',
                            color: theme.accent,
                            marginBottom: '6px',
                            letterSpacing: '1px',
                          }}>EQUIPMENT SET</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {equippedSets.slice(0, 4).map((eq, idx) => {
                              const eqIcon = EQUIPMENT_ICONS[eq.setName];
                              return (
                                <div key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  background: 'rgba(0,0,0,0.4)',
                                  border: `1px solid ${theme.primary}20`,
                                }}>
                                  {eqIcon && (
                                    <img src={eqIcon} alt={eq.setName} crossOrigin="anonymous" style={{ width: '18px', height: '18px' }} />
                                  )}
                                  <span style={{ fontSize: '9px', color: '#ffffff' }}>+{eq.artifice}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Talents display */}
                      {talentStates.some(t => t !== 'locked') && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{
                            fontSize: '9px',
                            color: theme.accent,
                            marginBottom: '4px',
                            letterSpacing: '1px',
                          }}>TALENTS</div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {talents.map((talent, idx) => (
                              talentStates[idx] !== 'locked' && (
                                <div key={idx} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 6px',
                                  background: 'rgba(0,0,0,0.4)',
                                  border: `1px solid ${theme.primary}20`,
                                  fontSize: '8px',
                                  color: 'rgba(255,255,255,0.7)',
                                }}>
                                  <span style={{ color: theme.primary, fontWeight: 700 }}>{talentStates[idx] === 'base' ? 'α' : 'β'}</span>
                                  <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{talent.name}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Bottom bar: username + watermark ── */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'rgba(10, 14, 20, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    zIndex: 30,
                    borderTop: `1px solid ${theme.primary}30`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {username && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{username}</span>}
                      {userCode && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>#{userCode}</span>}
                      {server && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{server}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: theme.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: '#000000' }}>ZS</span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>zerosanity.app</span>
                    </div>
                  </div>

                  {/* ── Corner brackets (all 4 corners) ── */}
                  {/* Top-left */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '20px',
                    height: '20px',
                    borderTop: `2px solid ${theme.primary}60`,
                    borderLeft: `2px solid ${theme.primary}60`,
                    zIndex: 25,
                  }} />
                  {/* Top-right */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderTop: `2px solid ${theme.primary}60`,
                    borderRight: `2px solid ${theme.primary}60`,
                    zIndex: 25,
                  }} />
                  {/* Bottom-left */}
                  <div style={{
                    position: 'absolute',
                    bottom: '52px',
                    left: '12px',
                    width: '20px',
                    height: '20px',
                    borderBottom: `2px solid ${theme.primary}60`,
                    borderLeft: `2px solid ${theme.primary}60`,
                    zIndex: 25,
                  }} />
                  {/* Bottom-right */}
                  <div style={{
                    position: 'absolute',
                    bottom: '52px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    borderBottom: `2px solid ${theme.primary}60`,
                    borderRight: `2px solid ${theme.primary}60`,
                    zIndex: 25,
                  }} />
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-[var(--color-text-muted)]" style={{ aspectRatio: '16 / 9', maxWidth: '100%', margin: '0 auto' }}>
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a character to create a showcase card</p>
                <p className="text-sm mt-2 text-[var(--color-text-muted)]/60">Configure stats, equipment, skills, and export as image</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══════ RIGHT: Controls ═══════ */}
        <div className="order-1 xl:order-2 w-full xl:w-[360px] xl:shrink-0 space-y-3 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-1 xl:sticky xl:top-4">

          {/* Showcase Name */}
          <div className={sectionClass}>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)]">Showcase Name</label>
            <input type="text" value={showcaseName} onChange={e => setShowcaseName(e.target.value)}
              placeholder="Enter showcase name" className={inputClass} />
          </div>

          {/* User Info */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-white">User Information</h3>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">User Code</label>
              <input type="text" value={userCode} onChange={e => setUserCode(e.target.value)}
                placeholder="Enter your in-game user ID" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Server</label>
              <select value={server} onChange={e => setServer(e.target.value)} className={inputClass}>
                <option value="">Select server region</option>
                <option value="Americas/Europe">Americas/Europe</option>
                <option value="Asia">Asia</option>
                <option value="China">China</option>
              </select>
            </div>
          </div>

          {/* Character */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-white">Character</h3>
            <button onClick={() => setCharPickerOpen(true)}
              className="w-full flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
            >
              {character ? (
                <>
                  <div className="w-14 h-14 bg-[var(--color-surface-2)] relative flex-shrink-0">
                    {iconUrl && <Image src={iconUrl} alt={character.Name} fill className="object-cover" sizes="48px" unoptimized />}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: character.Rarity }).map((_, i) => (
                        <Star key={i} size={12} className="fill-current" style={{ color: RARITY_COLORS[character.Rarity] }} />
                      ))}
                    </div>
                    <div className="text-sm text-white font-semibold">{character.Name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Click to change</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--color-text-muted)] py-2">Click to select a character...</div>
              )}
              <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
            </button>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Character Level</label>
              <select value={level} onChange={e => setLevel(Number(e.target.value))} className={inputClass}>
                {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                  <option key={lv} value={lv}>Lv. {lv}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Breakthrough - {CHAR_BREAKTHROUGH_LABELS[charBreakthrough]}/{CHAR_BREAKTHROUGH_LABELS.length - 1}</label>
              <div className="flex gap-1">
                {CHAR_BREAKTHROUGH_LABELS.map((label, i) => (
                  <button key={i} onClick={() => setCharBreakthrough(i)}
                    className={`flex-1 py-1.5 text-xs font-bold border transition-all ${charBreakthrough === i ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : charBreakthrough > i ? 'border-[var(--color-accent)]/40 text-[var(--color-accent)]/60' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                  >{'★'.repeat(i + 1).substring(0, 3)}{i > 2 ? '+' : ''}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Potential (Dupes)</label>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(p => (
                  <button key={p} onClick={() => setPotential(p)}
                    className={`flex-1 py-1.5 text-xs font-bold border transition-colors ${potential === p ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Affinity Lv.{affinity}</label>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(a => (
                  <button key={a} onClick={() => setAffinity(a)}
                    className={`flex-1 py-1.5 text-xs font-bold border transition-colors ${affinity === a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                  >{a}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Weapon */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-sm font-bold text-white">Weapon</h3>
              <button onClick={() => setWeaponPickerOpen(true)}
                className="w-full flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                {weapon ? (
                  <>
                    <div className="w-12 h-12 bg-[var(--color-surface-2)] relative flex-shrink-0">
                      {weaponIconUrl && <Image src={weaponIconUrl} alt={weapon.Name} fill className="object-contain p-0.5" sizes="40px" unoptimized />}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm text-white">{weapon.Name}</div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: weapon.Rarity }).map((_, i) => (
                          <Star key={i} size={8} className="fill-current" style={{ color: RARITY_COLORS[weapon.Rarity] || '#888' }} />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)] py-1">Click to select weapon...</div>
                )}
                <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
              </button>
              {weapon && (
                <>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Weapon Level</label>
                    <select value={weaponLevel} onChange={e => setWeaponLevel(Number(e.target.value))} className={inputClass}>
                      {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                        <option key={lv} value={lv}>Lv. {lv}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Breakthrough - {WEAPON_BREAKTHROUGH_LABELS[weaponBreakthrough]}/{WEAPON_BREAKTHROUGH_LABELS.length - 1}</label>
                    <div className="flex gap-1">
                      {WEAPON_BREAKTHROUGH_LABELS.map((_, i) => (
                        <button key={i} onClick={() => setWeaponBreakthrough(i)}
                          className={`flex-1 py-1.5 text-xs font-bold border transition-all flex items-center justify-center gap-0.5 ${weaponBreakthrough >= i ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                        >{Array.from({ length: i + 1 }).map((__, j) => <span key={j} style={{ fontSize: '8px' }}>{'>'}</span>)}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-[var(--color-text-muted)]">Weapon Potential - P{weaponPotential}/5</label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map(p => (
                        <button key={p} onClick={() => setWeaponPotential(p)}
                          className={`flex-1 py-1.5 text-xs font-bold border transition-colors ${weaponPotential === p ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                        >{p}</button>
                      ))}
                    </div>
                  </div>
                  {weaponEssence && (
                    <div className="space-y-2 pt-1 border-t border-[var(--color-border)]">
                      <label className="block text-xs font-bold text-[var(--color-text-muted)]">Weapon Skill Levels (Essence Bonuses)</label>
                      {[
                        { label: `${weaponEssence.primaryAttr} [L]`, maxLv: 9 },
                        { label: `${weaponEssence.secondaryStat || 'Secondary'} [L]`, maxLv: 9 },
                        { label: `${weaponData?.SkillName?.split(':')[0] || weaponEssence.skillStat}: ${weaponData?.SkillName?.split(':')[1]?.trim() || ''}`, maxLv: 9 },
                      ].map((ess, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[200px]">{ess.label}</span>
                            <span className="text-[10px] text-[var(--color-accent)]">Lv. {essenceLevels[idx]}/{ess.maxLv}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: ess.maxLv }).map((_, i) => (
                              <button key={i} onClick={() => setEssenceLevels(prev => { const n = [...prev]; n[idx] = i + 1; return n; })}
                                className={`flex-1 h-3 border transition-colors ${i < essenceLevels[idx] ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Equipment */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-sm font-bold text-white">Equipment</h3>
              {equipSlots.map(({ label, state, setter }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase">{label}</span>
                  </div>
                  <button onClick={() => setEquipPickerSlot(label)}
                    className="w-full flex items-center gap-2 p-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left"
                  >
                    {state.setName ? (
                      <>
                        <div className="w-10 h-10 bg-[var(--color-surface-2)] relative flex-shrink-0">
                          {EQUIPMENT_ICONS[state.setName] && (
                            <Image src={EQUIPMENT_ICONS[state.setName]} alt={state.setName} fill className="object-contain p-0.5" sizes="32px" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{state.setName} {SLOT_SUFFIXES[label] || ''}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">Click to change</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)] py-1">Select {label.toLowerCase()} equipment...</span>
                    )}
                  </button>
                  {state.setName && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-[var(--color-text-muted)]">Artifice</div>
                      {(EQUIPMENT_SUBSTATS[state.setName] || []).map((sub, si) => (
                        <div key={si}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-[var(--color-text-secondary)]">{sub.stat} +{sub.base}</span>
                          </div>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map(a => (
                              <button key={a} onClick={() => setter({ ...state, artifice: a })}
                                className={`flex-1 py-0.5 text-[10px] font-bold border transition-colors ${state.artifice >= a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                              >+{a}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {!EQUIPMENT_SUBSTATS[state.setName] && (
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map(a => (
                            <button key={a} onClick={() => setter({ ...state, artifice: a })}
                              className={`flex-1 py-0.5 text-xs font-bold border transition-colors ${state.artifice === a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                            >+{a}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skill Levels */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-sm font-bold text-white">Skill Levels</h3>
              {SKILL_TYPES.map(skill => {
                const currentLv = skillLevels[skill.key as keyof typeof skillLevels];
                return (
                  <div key={skill.key} className="border border-[var(--color-border)] p-2">
                    <label className="flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)] mb-1.5">
                      <span>{skill.label}</span>
                      <span className="text-[var(--color-accent)]">Lv. {currentLv}</span>
                    </label>
                    <div className="grid grid-cols-6 gap-0.5">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(lv => (
                        <button key={lv} onClick={() => setSkillLevels(prev => ({ ...prev, [skill.key]: lv }))}
                          className={`py-1 text-[10px] font-bold border transition-colors ${currentLv === lv ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/15' : currentLv > lv ? 'border-[var(--color-accent)]/30 text-[var(--color-accent)]/50 bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                        >{lv <= 9 ? lv : lv === 10 ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" /> : lv === 11 ? <span className="flex items-center justify-center gap-px"><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /></span> : <span className="flex items-center justify-center gap-px"><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /><span className="w-1 h-1 rounded-full bg-current" /></span>}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Talent Levels */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-sm font-bold text-[var(--color-accent)]">Talent Levels</h3>
              {talents.map((talent, idx) => (
                <div key={idx} className="border border-[var(--color-border)] border-dashed p-2">
                  <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1.5">{talent.name}<span className="text-[10px] text-[var(--color-text-muted)]/60 ml-1">({talent.type})</span></label>
                  <div className="flex gap-1">
                    {([
                      { key: 'locked' as TalentState, label: 'Locked', icon: '🔒' },
                      { key: 'base' as TalentState, label: 'Base (α)' },
                      { key: 'upgrade' as TalentState, label: 'Upgrade (β)' },
                    ]).map(opt => (
                      <button key={opt.key} onClick={() => setTalentStates(prev => { const n = [...prev]; n[idx] = opt.key; return n; })}
                        className={`flex-1 py-1.5 text-[10px] font-bold border transition-colors ${talentStates[idx] === opt.key ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                      >
                        <span className="border-l-2 pl-1.5" style={{ borderColor: talentStates[idx] === opt.key ? 'var(--color-accent)' : 'transparent' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Color Theme */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-white">Color Theme</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setColorTheme('auto')}
                className={`px-2.5 py-1.5 text-sm font-bold border transition-colors ${colorTheme === 'auto' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
              >Auto</button>
              {Object.entries(THEME_COLORS).map(([name, t]) => (
                <button key={name} onClick={() => setColorTheme(name)}
                  className={`px-2.5 py-1.5 text-sm font-bold border transition-colors ${colorTheme === name ? '' : 'border-[var(--color-border)]'}`}
                  style={colorTheme === name ? { borderColor: t.primary, color: t.primary, backgroundColor: t.primary + '15' } : { color: t.primary + '99' }}
                >{name}</button>
              ))}
            </div>
          </div>

          {/* Save / Load / New */}
          <div className={sectionClass}>
            <button onClick={saveShowcase}
              className="w-full py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:opacity-90 flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {saveMessage || 'Save Showcase'}
            </button>
            <div className="flex gap-2">
              <button onClick={() => setShowLoadModal(true)}
                className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent)] flex items-center justify-center gap-2"
              ><FolderOpen className="w-4 h-4" /> Load</button>
              <button onClick={resetShowcase}
                className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent)] flex items-center justify-center gap-2"
              ><FilePlus2 className="w-4 h-4" /> New</button>
            </div>
          </div>

          {/* Export Actions */}
          <div className={sectionClass}>
            <div className="flex gap-2">
              <button onClick={() => downloadCard('png')} disabled={!character || isExporting}
                className="flex-1 py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PNG'}
              </button>
              <button onClick={() => downloadCard('jpg')} disabled={!character || isExporting}
                className="py-2.5 px-4 border border-[var(--color-border)] text-white font-bold clip-corner-tl hover:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >JPG</button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} disabled={!character || isExporting}
                className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center gap-2"
              >Copy to Clipboard</button>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} disabled={!character}
                  className="py-2 px-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center gap-2"
                ><Share2 size={16} /> Share</button>
                {showShareMenu && character && (
                  <div className="absolute right-0 bottom-full mb-2 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl shadow-[var(--shadow-card-hover)] z-50">
                    <button onClick={shareToTwitter} className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">Post on X</button>
                    <button onClick={shareToReddit} className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">Post on Reddit</button>
                    <button onClick={copyToClipboard} className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">Copy for Discord</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CharacterPickerModal open={charPickerOpen} onClose={() => setCharPickerOpen(false)}
        onSelect={c => { setSelectedCharName(c.Name); setSelectedWeaponName(''); }} currentName={selectedCharName} />
      {character && (
        <WeaponPickerModal open={weaponPickerOpen} onClose={() => setWeaponPickerOpen(false)}
          onSelect={w => setSelectedWeaponName(w.Name)} weaponType={character.WeaponType} currentName={selectedWeaponName} />
      )}
      {equipPickerSlot && currentEquipPickerState && (
        <EquipmentPickerModal open={true} onClose={() => setEquipPickerSlot(null)} slot={equipPickerSlot}
          currentSet={currentEquipPickerState.state.setName}
          onSelect={name => { currentEquipPickerState.setter({ ...currentEquipPickerState.state, setName: name }); }} />
      )}
      {showShareMenu && <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowLoadModal(false)}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Load Showcase</h3>
              <button onClick={() => setShowLoadModal(false)} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {savedShowcases.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">No saved showcases yet. Create one and click Save!</div>
              ) : (
                savedShowcases.map((save, idx) => (
                  <button key={idx} onClick={() => { loadShowcase(save); setShowLoadModal(false); }}
                    className="w-full flex items-center gap-3 p-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-semibold truncate">{save.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{save.charName} Lv.{save.level} - {new Date(save.savedAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); const saves = [...savedShowcases]; saves.splice(idx, 1); localStorage.setItem('zs-showcases', JSON.stringify(saves)); setShowLoadModal(false); setTimeout(() => setShowLoadModal(true), 50); }}
                      className="text-[var(--color-text-muted)] hover:text-red-400 p-1"><X size={14} /></button>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
