'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS, CHARACTER_GACHA } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Sword, Zap, Crosshair, Flame, FilePlus2, Copy, Link2, Check, Shield, Heart, Swords, Target, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { WEAPON_DATA, getAtkAtLevel, type WeaponData } from '@/data/weapons';
import { WEAPON_ESSENCES } from '@/data/essences';
import { GEAR_SETS, STANDALONE_GEAR, TIER_COLORS, type GearPiece, type GearSet } from '@/data/gear';

// ──────────── Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; accent: string; glow: string; secondary: string }> = {
  Physical: { primary: '#C0C8D0', bg: '#0a0e14', accent: '#7888A0', glow: 'rgba(192,200,208,0.3)', secondary: '#4A5568' },
  Heat:     { primary: '#FF6B35', bg: '#0a0e14', accent: '#CC5522', glow: 'rgba(255,107,53,0.4)', secondary: '#8B3A1A' },
  Cryo:     { primary: '#00BFFF', bg: '#0a0e14', accent: '#0088CC', glow: 'rgba(0,191,255,0.4)', secondary: '#004466' },
  Electric: { primary: '#C084FC', bg: '#0a0e14', accent: '#9060CC', glow: 'rgba(192,132,252,0.4)', secondary: '#5B3A8C' },
  Nature:   { primary: '#34D399', bg: '#0a0e14', accent: '#22AA77', glow: 'rgba(52,211,153,0.4)', secondary: '#1A6B4A' },
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
const WEAPON_BREAKTHROUGH_LABELS = ['B0', 'B1', 'B2', 'B3'];

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
                <div className="w-8 h-8 flex items-center justify-center font-bold text-xs" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{piece.name}</div>
                  {setName && <div className="text-[10px] text-[var(--color-text-muted)] truncate">{setName}</div>}
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

// ──────────── CARD CANVAS (the exported image) ────────────
// Full data-dense landscape card: 1200x675
// Layout: character art left 55%, data overlay right 45%
// Shows: stats, skills, weapon (with ATK + skill name), equipment (names + artifice), talents, potential, affinity, breakthrough, set bonuses

function CardCanvas({ state, theme, char, weapon }: {
  state: ShowcaseState; theme: typeof THEME_COLORS.Physical;
  char: Character; weapon: Weapon | undefined;
}) {
  const stats = computeStats(char, state.level, state.potential);
  const splashUrl = CHARACTER_SPLASH[char.Name];
  const gachaUrl = CHARACTER_GACHA[char.Name];
  const weaponIcon = weapon ? WEAPON_ICONS[weapon.Name] : null;
  const roleIcon = PROFESSION_ICONS[char.Role];
  const weaponData: WeaponData | undefined = weapon ? WEAPON_DATA.find(w => w.Name === weapon.Name) : undefined;
  const weaponAtk = weaponData ? getAtkAtLevel(weaponData.BaseAtk, weaponData.MaxAtk, state.weaponLevel) : null;

  // Collect equipment details
  const equipSlots = [
    { slot: state.equipBody, label: 'Body' },
    { slot: state.equipHand, label: 'Hand' },
    { slot: state.equipEdc1, label: 'EDC 1' },
    { slot: state.equipEdc2, label: 'EDC 2' },
  ];
  const equippedPieces = equipSlots.map(({ slot, label }) => {
    if (!slot.pieceName) return null;
    const piece = findGearPieceByName(slot.pieceName);
    return piece ? { piece, setName: slot.setName, artifice: slot.artifice, label } : null;
  });

  // Get active set bonuses
  const setCount: Record<string, number> = {};
  equippedPieces.forEach(ep => {
    if (ep && ep.setName) setCount[ep.setName] = (setCount[ep.setName] || 0) + 1;
  });
  const activeSets = Object.entries(setCount).filter(([, count]) => count >= 3);

  const FONT_HEADER = "'Rajdhani', 'Exo 2', sans-serif";
  const FONT_MONO = "'Share Tech Mono', 'Courier New', monospace";

  return (
    <div style={{
      width: 1200, height: 675, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, #080b10 0%, #0d1118 40%, #111620 100%)`,
      fontFamily: FONT_MONO,
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.025, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
      }} />

      {/* Grid pattern - subtle */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.025, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${theme.primary}30 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}30 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Diagonal accent line - top right */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 500, height: 3, zIndex: 5,
        background: `linear-gradient(to left, ${theme.primary}, transparent)`,
        transform: 'rotate(-2deg)', transformOrigin: 'right top',
      }} />

      {/* Character splash art - full bleed left */}
      {(splashUrl || gachaUrl) && (
        <div style={{ position: 'absolute', left: -20, top: -20, width: '62%', height: 'calc(100% + 40px)', zIndex: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={splashUrl || gachaUrl || ''}
            alt={char.Name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)',
              filter: 'brightness(0.85) contrast(1.05)',
            }}
          />
        </div>
      )}

      {/* Element glow - bottom left */}
      <div style={{
        position: 'absolute', left: -80, bottom: -80, width: 350, height: 350, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        zIndex: 3, opacity: 0.5,
      }} />

      {/* ── TOP LEFT: Character Identity ── */}
      <div style={{ position: 'absolute', left: 20, top: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Level Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 56, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.primary}DD, ${theme.accent}DD)`,
            border: `2px solid ${theme.primary}`,
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0a0e14', lineHeight: 1, fontFamily: FONT_HEADER }}>{state.level}</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#0a0e14', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.5 }}>LV</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              {roleIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={roleIcon} alt={char.Role} style={{ width: 16, height: 16, opacity: 0.8 }} />
              )}
              <span style={{ fontSize: 10, color: theme.primary, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_MONO }}>
                {char.Element} {char.Role}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: char.Rarity }, (_, i) => (
                <span key={i} style={{ color: RARITY_COLORS[char.Rarity], fontSize: 13 }}>★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Potential + Affinity + Breakthrough row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{
            padding: '2px 8px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${theme.primary}30`,
            fontSize: 9, color: '#aaa', letterSpacing: 1, fontWeight: 600,
          }}>
            POT <span style={{ color: theme.primary, fontWeight: 800 }}>{state.potential}</span>
          </div>
          <div style={{
            padding: '2px 8px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${theme.primary}30`,
            fontSize: 9, color: '#aaa', letterSpacing: 1, fontWeight: 600,
          }}>
            AFF <span style={{ color: theme.primary, fontWeight: 800 }}>{state.affinity}</span>
          </div>
          <div style={{
            padding: '2px 8px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${theme.primary}30`,
            fontSize: 9, letterSpacing: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ color: '#aaa' }}>BTK</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: 10, height: 3, backgroundColor: i < state.charBreakthrough ? theme.primary : '#333' }} />
              ))}
            </div>
            <span style={{ color: theme.primary, fontWeight: 800, fontSize: 9 }}>{CHAR_BREAKTHROUGH_LABELS[state.charBreakthrough]}</span>
          </div>
        </div>

        {/* Talent row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          {state.talentStates.map((t, i) => (
            <div key={i} style={{
              padding: '2px 8px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${t === 'upgrade' ? theme.primary + '60' : t === 'base' ? theme.primary + '30' : '#333'}`,
              fontSize: 9, letterSpacing: 0.5, fontWeight: 600,
              color: t === 'locked' ? '#555' : t === 'base' ? '#999' : theme.primary,
            }}>
              T{i+1} {t === 'locked' ? 'LOCKED' : t === 'base' ? 'BASE' : 'MAX'}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Stats + Details ── */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: 440, height: '100%', zIndex: 10,
        background: 'linear-gradient(to left, rgba(8,11,16,0.97) 60%, rgba(8,11,16,0.85) 80%, rgba(8,11,16,0) 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        paddingRight: 24, paddingLeft: 60, paddingTop: 20,
      }}>
        {/* Primary Stats - HP / ATK / DEF with bars */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, fontWeight: 600 }}>COMBAT STATS</div>
          {[
            { label: 'HP', value: stats.HP, max: 20000, icon: Heart, color: '#EF4444' },
            { label: 'ATK', value: stats.ATK, max: 4000, icon: Swords, color: '#F59E0B' },
            { label: 'DEF', value: stats.DEF, max: 3000, icon: Shield, color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 }}>
                <span style={{ fontSize: 10, color: '#777', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 15, color: '#fff', fontWeight: 800, fontFamily: FONT_MONO }}>{s.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 3, background: '#1a1f28', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (s.value / s.max) * 100)}%`, background: `linear-gradient(to right, ${s.color}80, ${s.color})`, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${theme.primary}25, transparent)`, marginBottom: 10 }} />

        {/* Base attributes grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
          {[
            { label: 'STR', value: stats.STR, color: '#FF6B35' },
            { label: 'AGI', value: stats.AGI, color: '#00BFFF' },
            { label: 'INT', value: stats.INT, color: '#C084FC' },
            { label: 'WILL', value: stats.WILL, color: '#34D399' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: s.color, fontWeight: 800, letterSpacing: 1, marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: '#eee', fontWeight: 700, fontFamily: FONT_MONO }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Crit inline */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, color: '#666', letterSpacing: 0.5, fontWeight: 600 }}>CRIT RATE</span>
            <span style={{ fontSize: 12, color: theme.primary, fontWeight: 800, fontFamily: FONT_MONO }}>{stats['CRIT Rate']}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, color: '#666', letterSpacing: 0.5, fontWeight: 600 }}>CRIT DMG</span>
            <span style={{ fontSize: 12, color: theme.primary, fontWeight: 800, fontFamily: FONT_MONO }}>{stats['CRIT DMG']}%</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${theme.primary}25, transparent)`, marginBottom: 10 }} />

        {/* Skill Levels */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5, fontWeight: 600 }}>SKILLS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
            {SKILL_TYPES.map(sk => {
              const lvl = state.skillLevels[sk.key as keyof typeof state.skillLevels];
              const isMaxTier = lvl >= 10;
              return (
                <div key={sk.key} style={{
                  textAlign: 'center', padding: '5px 0',
                  background: isMaxTier ? `${theme.primary}10` : 'rgba(20,24,32,0.8)',
                  border: `1px solid ${isMaxTier ? theme.primary + '40' : '#222'}`,
                }}>
                  <div style={{ fontSize: 7, color: isMaxTier ? theme.primary : '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 1, fontWeight: 700 }}>{sk.short}</div>
                  <div style={{
                    fontSize: 18, fontWeight: 900, color: isMaxTier ? theme.primary : '#ddd',
                    fontFamily: FONT_HEADER, lineHeight: 1,
                  }}>{lvl}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${theme.primary}25, transparent)`, marginBottom: 10 }} />

        {/* Weapon Section */}
        {weapon && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5, fontWeight: 600 }}>WEAPON</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
              background: 'rgba(16,20,28,0.9)', border: `1px solid ${theme.primary}20`,
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
            }}>
              {weaponIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={weaponIcon} alt={weapon.Name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, fontFamily: FONT_HEADER, letterSpacing: 0.5 }}>{weapon.Name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 1 }}>
                  <span style={{ fontSize: 9, color: RARITY_COLORS[weapon.Rarity] }}>{'★'.repeat(weapon.Rarity)}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>Lv.{state.weaponLevel}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>{WEAPON_BREAKTHROUGH_LABELS[state.weaponBreakthrough]}</span>
                  <span style={{ fontSize: 9, color: '#888' }}>P{state.weaponPotential}</span>
                  {weaponAtk && <span style={{ fontSize: 9, color: theme.primary, fontWeight: 700 }}>ATK {weaponAtk}</span>}
                </div>
                {weaponData?.SkillName && (
                  <div style={{ fontSize: 8, color: '#666', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {weaponData.SkillName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Section */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5, fontWeight: 600 }}>EQUIPMENT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {equippedPieces.map((ep, i) => {
              const slotLabel = equipSlots[i].label;
              if (!ep) {
                return (
                  <div key={i} style={{
                    padding: '3px 6px', background: 'rgba(16,20,28,0.6)', border: '1px solid #1a1f28',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 8, color: '#444', fontWeight: 600 }}>{slotLabel}</span>
                    <span style={{ fontSize: 8, color: '#333' }}>Empty</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  padding: '3px 6px', background: 'rgba(16,20,28,0.8)', border: `1px solid ${TIER_COLORS[ep.piece.tier]}20`,
                  display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden',
                }}>
                  <span style={{ fontSize: 8, color: TIER_COLORS[ep.piece.tier], fontWeight: 900, flexShrink: 0 }}>{ep.piece.tier}</span>
                  <span style={{ fontSize: 8, color: '#ccc', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {ep.piece.name}
                  </span>
                  {ep.artifice > 0 && (
                    <span style={{ fontSize: 8, color: theme.primary, fontWeight: 800, flexShrink: 0 }}>+{ep.artifice}</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Active set bonus */}
          {activeSets.length > 0 && (
            <div style={{ marginTop: 3, display: 'flex', gap: 6 }}>
              {activeSets.map(([name, count]) => (
                <div key={name} style={{
                  padding: '1px 6px', background: `${theme.primary}10`, border: `1px solid ${theme.primary}30`,
                  fontSize: 8, color: theme.primary, fontWeight: 700, letterSpacing: 0.5,
                }}>
                  {name} ({count}pc)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM BAR: Character Name + User + Watermark ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 44, zIndex: 15,
        background: 'linear-gradient(to top, rgba(8,11,16,0.98), rgba(8,11,16,0.85))',
        borderTop: `1px solid ${theme.primary}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Element color bar */}
          <div style={{ width: 3, height: 24, background: theme.primary, borderRadius: 1 }} />
          {/* Character name */}
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: FONT_HEADER, letterSpacing: 2, textTransform: 'uppercase' }}>
            {char.Name}
          </span>
          {state.name && (
            <span style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>{state.name}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {state.username && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#555', fontWeight: 600 }}>{state.username}</span>
              {state.userCode && <span style={{ fontSize: 9, color: '#444' }}>#{state.userCode}</span>}
              {state.server && <span style={{ fontSize: 9, color: '#444' }}>{state.server}</span>}
            </div>
          )}
          {/* ZeroSanity watermark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 2 L62 32 L32 62 L2 32 Z" fill={theme.primary} fillOpacity="0.8" />
              <path d="M32 7 L57 32 L32 57 L7 32 Z" fill="#0a0e14" />
              <path d="M22 22h18v4.5L26 40h14v4H21v-4.5L35 26H22z" fill={theme.primary} fillOpacity="0.9" />
            </svg>
            <span style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: FONT_MONO }}>ZeroSanity.app</span>
          </div>
        </div>
      </div>

      {/* Accent line bottom */}
      <div style={{
        position: 'absolute', bottom: 44, left: 0, width: 300, height: 2, zIndex: 15,
        background: `linear-gradient(to right, ${theme.primary}, transparent)`,
      }} />
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
  const [activeTab, setActiveTab] = useState<'operator' | 'weapon' | 'equipment' | 'skills'>('operator');
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
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: null, width: 1200, height: 675,
      });
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
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, width: 1200, height: 675,
      });
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
                <CardCanvas state={state} theme={theme} char={char} weapon={weapon} />
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
                <select value={state.level} onChange={e => updateState({ level: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm">
                  {[80, 70, 60, 50, 40, 30, 20, 10, 1].map(l => <option key={l} value={l}>Lv. {l}</option>)}
                </select>
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
                <select value={state.weaponLevel} onChange={e => updateState({ weaponLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm">
                  {[80, 70, 60, 50, 40, 30, 20, 10, 1].map(l => <option key={l} value={l}>Lv. {l}</option>)}
                </select>
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
                        <span className="text-xs font-bold" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</span>
                        <span className="text-sm text-white truncate flex-1">{piece.name}</span>
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
