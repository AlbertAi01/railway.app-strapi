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

function getClearanceLevel(rarity: number): string {
  return rarity >= 6 ? 'S' : rarity >= 5 ? 'A' : rarity >= 4 ? 'B' : 'C';
}

function getDossierTimestamp(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ──────────── CARD CANVAS (the exported image) ────────────
// Endfield Industries ID Card / Military Dossier layout
// 1200x675 — 3-column grid: portrait left | data center | loadout right
// Classification header, barcode footer, angular clip-paths, max information density

function CardCanvas({ state, theme, char, weapon, colorScheme }: {
  state: ShowcaseState; theme: typeof THEME_COLORS.Physical;
  char: Character; weapon: Weapon | undefined;
  colorScheme: ColorScheme;
}) {
  const stats = computeStats(char, state.level, state.potential);
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
  const equippedPieces = equipSlots.map(({ slot, label }) => {
    if (!slot.pieceName) return null;
    const piece = findGearPieceByName(slot.pieceName);
    return piece ? { piece, setName: slot.setName, artifice: slot.artifice, label } : null;
  });
  const setCount: Record<string, number> = {};
  equippedPieces.forEach(ep => { if (ep && ep.setName) setCount[ep.setName] = (setCount[ep.setName] || 0) + 1; });
  const activeSets = Object.entries(setCount).filter(([, count]) => count >= 3);

  const FONT_HEADER = "'Rajdhani', 'Exo 2', sans-serif";
  const FONT_MONO = "'Share Tech Mono', 'Courier New', monospace";
  const operatorID = generateOperatorID(char.Name, char.Rarity);
  const clearance = getClearanceLevel(char.Rarity);
  const timestamp = getDossierTimestamp();
  const schemeConfig = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.auto;
  const bgGrad = colorScheme === 'auto' ? COLOR_SCHEMES.standard.bgGrad : schemeConfig.bgGrad;
  const brightnessFilter = state.brightness !== 1.0 ? `brightness(${state.brightness})` : undefined;
  const accentColor = schemeConfig.tint || theme.primary;

  // Divider component for reuse
  const HDivider = ({ mb = 6 }: { mb?: number }) => (
    <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${accentColor}30, transparent)`, marginBottom: mb }} />
  );

  return (
    <div style={{
      width: 1200, height: 675, position: 'relative', overflow: 'hidden',
      background: bgGrad, fontFamily: FONT_MONO, filter: brightnessFilter,
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.02, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px)',
      }} />
      {/* Color tint */}
      {schemeConfig.tint && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 30% 50%, ${schemeConfig.tint}06 0%, transparent 60%)`,
        }} />
      )}
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: schemeConfig.overlayOpacity * 0.6, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${accentColor}20 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* ═══════════════════════════════════════════════════
          HEADER BAR — Classification / Document ID / Timestamp
          ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 32, zIndex: 20,
        background: `linear-gradient(90deg, ${accentColor}18 0%, rgba(8,11,16,0.95) 40%, rgba(8,11,16,0.95) 100%)`,
        borderBottom: `1px solid ${accentColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Diamond icon */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 0 L12 6 L6 12 L0 6 Z" fill={accentColor} fillOpacity="0.8" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#F5A623', letterSpacing: 2, textTransform: 'uppercase',
            background: 'rgba(245,166,35,0.1)', padding: '1px 8px', border: '1px solid rgba(245,166,35,0.3)',
          }}>CLEARANCE {clearance}</span>
          <span style={{ fontSize: 9, color: '#666', letterSpacing: 1 }}>ENDFIELD INDUSTRIES</span>
          <span style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>OPERATOR DOSSIER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 9, color: '#555', letterSpacing: 1 }}>{operatorID}</span>
          <span style={{ fontSize: 9, color: '#444', letterSpacing: 0.5 }}>{timestamp}</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          LEFT COLUMN — Portrait + Identity (width: 310px)
          ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', left: 0, top: 32, width: 310, height: 'calc(100% - 64px)', zIndex: 10,
        background: 'rgba(8,11,16,0.4)',
        borderRight: `1px solid ${accentColor}15`,
      }}>
        {/* Character art — full bleed in left column */}
        {(splashUrl || gachaUrl) && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={splashUrl || gachaUrl || ''} alt={char.Name} style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.3) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.3) 100%)',
              filter: 'brightness(0.8) contrast(1.08)',
            }} />
          </div>
        )}

        {/* Element glow - bottom */}
        <div style={{
          position: 'absolute', left: '50%', bottom: -40, transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%', zIndex: 2,
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, opacity: 0.5,
        }} />

        {/* Overlay identity info at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, padding: '10px 14px',
          background: 'linear-gradient(to top, rgba(8,11,16,0.95) 50%, rgba(8,11,16,0.6) 80%, transparent 100%)',
        }}>
          {/* Character name */}
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: FONT_HEADER, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1, marginBottom: 4 }}>
            {char.Name}
          </div>
          {state.name && (
            <div style={{ fontSize: 10, color: '#777', fontStyle: 'italic', marginBottom: 4 }}>&quot;{state.name}&quot;</div>
          )}

          {/* Rarity + Element + Role row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: char.Rarity }, (_, i) => (
                <span key={i} style={{ color: RARITY_COLORS[char.Rarity], fontSize: 12 }}>★</span>
              ))}
            </div>
            <div style={{ width: 1, height: 12, background: '#444' }} />
            {roleIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={roleIcon} alt={char.Role} style={{ width: 14, height: 14, opacity: 0.8 }} />
            )}
            <span style={{ fontSize: 9, color: theme.primary, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
              {char.Element} / {char.Role}
            </span>
          </div>

          {/* ID plate */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(10,14,20,0.8)', border: `1px solid ${accentColor}20`, padding: '3px 8px',
          }}>
            <span style={{ fontSize: 8, color: '#666', letterSpacing: 1 }}>OPERATOR ID</span>
            <span style={{ fontSize: 9, color: accentColor, fontWeight: 700, letterSpacing: 1.5 }}>{operatorID}</span>
          </div>

          {/* Breakthrough bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <span style={{ fontSize: 8, color: '#666', letterSpacing: 1, fontWeight: 600 }}>BTK</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: 16, height: 3, backgroundColor: i < state.charBreakthrough ? theme.primary : '#333' }} />
              ))}
            </div>
            <span style={{ fontSize: 8, color: theme.primary, fontWeight: 800 }}>{CHAR_BREAKTHROUGH_LABELS[state.charBreakthrough]}</span>
          </div>
        </div>

        {/* Top-left badge: Level */}
        <div style={{
          position: 'absolute', top: 8, left: 10, zIndex: 6,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 44, height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.primary}DD, ${theme.accent}DD)`,
            border: `2px solid ${theme.primary}`,
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#0a0e14', lineHeight: 1, fontFamily: FONT_HEADER }}>{state.level}</span>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#0a0e14', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.5 }}>LV</span>
          </div>
          {/* POT / AFF badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ padding: '1px 6px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${theme.primary}30`, fontSize: 8, color: '#aaa', letterSpacing: 1, fontWeight: 600 }}>
              POT <span style={{ color: theme.primary, fontWeight: 800 }}>{state.potential}</span>
            </div>
            <div style={{ padding: '1px 6px', background: 'rgba(10,14,20,0.85)', border: `1px solid ${theme.primary}30`, fontSize: 8, color: '#aaa', letterSpacing: 1, fontWeight: 600 }}>
              AFF <span style={{ color: theme.primary, fontWeight: 800 }}>{state.affinity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          CENTER COLUMN — Combat Stats + Skills (width: ~470px)
          ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', left: 310, top: 32, width: 470, height: 'calc(100% - 64px)', zIndex: 10,
        display: 'flex', flexDirection: 'column', padding: '10px 16px',
        background: 'rgba(8,11,16,0.92)',
        borderRight: `1px solid ${accentColor}10`,
      }}>
        {/* Section: Combat Stats */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 3, height: 10, background: accentColor }} />
            <span style={{ fontSize: 9, color: accentColor, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_HEADER }}>COMBAT ASSESSMENT</span>
          </div>
          {/* HP/ATK/DEF bars */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            {[
              { label: 'HP', value: stats.HP, max: 20000, color: '#EF4444' },
              { label: 'ATK', value: stats.ATK, max: 4000, color: '#F59E0B' },
              { label: 'DEF', value: stats.DEF, max: 3000, color: '#3B82F6' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: '#666', letterSpacing: 1, fontWeight: 700 }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: '#fff', fontWeight: 800, fontFamily: FONT_MONO }}>{s.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 3, background: '#1a1f28', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (s.value / s.max) * 100)}%`, background: `linear-gradient(to right, ${s.color}70, ${s.color})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <HDivider mb={6} />

        {/* Base attributes + Crit */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          {/* STR/AGI/INT/WILL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, flex: 1 }}>
            {[
              { label: 'STR', value: stats.STR, color: '#FF6B35' },
              { label: 'AGI', value: stats.AGI, color: '#00BFFF' },
              { label: 'INT', value: stats.INT, color: '#C084FC' },
              { label: 'WILL', value: stats.WILL, color: '#34D399' },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '4px 0',
                background: 'rgba(16,20,28,0.6)', borderLeft: `2px solid ${s.color}40`,
              }}>
                <div style={{ fontSize: 7, color: s.color, fontWeight: 800, letterSpacing: 1, marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontSize: 15, color: '#eee', fontWeight: 700, fontFamily: FONT_MONO, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* Crit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100 }}>
            <div style={{ padding: '3px 8px', background: 'rgba(16,20,28,0.6)', borderLeft: `2px solid ${accentColor}40` }}>
              <div style={{ fontSize: 7, color: '#666', letterSpacing: 0.5, fontWeight: 700 }}>CRIT RATE</div>
              <div style={{ fontSize: 13, color: accentColor, fontWeight: 800, fontFamily: FONT_MONO, lineHeight: 1.1 }}>{stats['CRIT Rate']}%</div>
            </div>
            <div style={{ padding: '3px 8px', background: 'rgba(16,20,28,0.6)', borderLeft: `2px solid ${accentColor}40` }}>
              <div style={{ fontSize: 7, color: '#666', letterSpacing: 0.5, fontWeight: 700 }}>CRIT DMG</div>
              <div style={{ fontSize: 13, color: accentColor, fontWeight: 800, fontFamily: FONT_MONO, lineHeight: 1.1 }}>{stats['CRIT DMG']}%</div>
            </div>
          </div>
        </div>

        <HDivider mb={6} />

        {/* Skills */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 3, height: 10, background: accentColor }} />
            <span style={{ fontSize: 9, color: accentColor, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_HEADER }}>SKILL PROFICIENCY</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
            {SKILL_TYPES.map(sk => {
              const lvl = state.skillLevels[sk.key as keyof typeof state.skillLevels];
              const isMax = lvl >= 10;
              return (
                <div key={sk.key} style={{
                  textAlign: 'center', padding: '5px 0',
                  background: isMax ? `${accentColor}10` : 'rgba(16,20,28,0.7)',
                  border: `1px solid ${isMax ? accentColor + '40' : '#1a1f28'}`,
                  borderLeft: `2px solid ${isMax ? accentColor : '#333'}`,
                }}>
                  <div style={{ fontSize: 7, color: isMax ? accentColor : '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 1 }}>{sk.short}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: isMax ? accentColor : '#ddd', fontFamily: FONT_HEADER, lineHeight: 1 }}>{lvl}</div>
                </div>
              );
            })}
          </div>
        </div>

        <HDivider mb={6} />

        {/* Talents */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 8, color: '#555', letterSpacing: 1, fontWeight: 600 }}>TALENTS</span>
          </div>
          {state.talentStates.map((t, i) => (
            <div key={i} style={{
              padding: '2px 8px',
              background: t === 'upgrade' ? `${accentColor}10` : 'rgba(16,20,28,0.7)',
              border: `1px solid ${t === 'upgrade' ? accentColor + '50' : t === 'base' ? accentColor + '20' : '#222'}`,
              fontSize: 9, letterSpacing: 0.5, fontWeight: 700,
              color: t === 'locked' ? '#444' : t === 'base' ? '#888' : accentColor,
            }}>
              T{i+1} {t === 'locked' ? 'LOCKED' : t === 'base' ? 'BASE' : 'MAX'}
            </div>
          ))}
        </div>

        <HDivider mb={6} />

        {/* Weapon */}
        {weapon && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div style={{ width: 3, height: 10, background: '#F5A623' }} />
              <span style={{ fontSize: 9, color: '#F5A623', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_HEADER }}>ASSIGNED WEAPON</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
              background: 'rgba(16,20,28,0.8)', border: `1px solid ${accentColor}15`,
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
            }}>
              {weaponIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={weaponIcon} alt={weapon.Name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, fontFamily: FONT_HEADER, letterSpacing: 0.5 }}>{weapon.Name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 1 }}>
                  <span style={{ fontSize: 9, color: RARITY_COLORS[weapon.Rarity] }}>{'★'.repeat(weapon.Rarity)}</span>
                  <span style={{ fontSize: 9, color: '#777' }}>Lv.{state.weaponLevel}</span>
                  <span style={{ fontSize: 9, color: '#777' }}>{WEAPON_BREAKTHROUGH_LABELS[state.weaponBreakthrough]}</span>
                  <span style={{ fontSize: 9, color: '#777' }}>P{state.weaponPotential}</span>
                  {weaponAtk && <span style={{ fontSize: 9, color: accentColor, fontWeight: 700 }}>ATK {weaponAtk}</span>}
                </div>
                {weaponData?.SkillName && (
                  <div style={{ fontSize: 8, color: '#555', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {weaponData.SkillName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Essence levels if any */}
        {state.essenceLevels.some(l => l > 1) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 8, color: '#555', letterSpacing: 1, fontWeight: 600 }}>ESSENCE</span>
            {state.essenceLevels.map((l, i) => (
              <span key={i} style={{ fontSize: 9, color: l > 1 ? accentColor : '#555', fontWeight: 700 }}>
                E{i+1}:{l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT COLUMN — Equipment + Clearance Badge (width: 420px)
          ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', right: 0, top: 32, width: 420, height: 'calc(100% - 64px)', zIndex: 10,
        display: 'flex', flexDirection: 'column', padding: '10px 16px',
        background: 'rgba(8,11,16,0.95)',
      }}>
        {/* Equipment loadout */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 3, height: 10, background: accentColor }} />
            <span style={{ fontSize: 9, color: accentColor, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_HEADER }}>EQUIPMENT LOADOUT</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {equippedPieces.map((ep, i) => {
              const slotLabel = equipSlots[i].label;
              if (!ep) {
                return (
                  <div key={i} style={{
                    padding: '4px 8px', background: 'rgba(16,20,28,0.5)', border: '1px solid #1a1f28',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 8, color: '#444', fontWeight: 700, letterSpacing: 1, width: 36 }}>{slotLabel}</span>
                    <span style={{ fontSize: 8, color: '#333' }}>— EMPTY —</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  padding: '4px 8px', background: 'rgba(16,20,28,0.7)',
                  border: `1px solid ${TIER_COLORS[ep.piece.tier]}20`,
                  borderLeft: `2px solid ${TIER_COLORS[ep.piece.tier]}60`,
                  display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden',
                }}>
                  <span style={{ fontSize: 7, color: '#555', fontWeight: 700, letterSpacing: 1, width: 32, flexShrink: 0 }}>{slotLabel}</span>
                  {ep.piece.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ep.piece.icon} alt={ep.piece.name} style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} />
                  ) : (
                    <span style={{ fontSize: 8, color: TIER_COLORS[ep.piece.tier], fontWeight: 900, flexShrink: 0, width: 24, textAlign: 'center' }}>{ep.piece.tier}</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: 10, color: '#ddd', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ep.piece.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 8, color: TIER_COLORS[ep.piece.tier], fontWeight: 700 }}>{ep.piece.tier}</span>
                      <span style={{ fontSize: 8, color: '#666' }}>DEF {ep.piece.def}</span>
                      {ep.piece.stats.slice(0, 2).map((st, si) => (
                        <span key={si} style={{ fontSize: 7, color: '#777' }}>{st.name} {st.value}</span>
                      ))}
                    </div>
                  </div>
                  {ep.artifice > 0 && (
                    <span style={{ fontSize: 9, color: accentColor, fontWeight: 800, flexShrink: 0 }}>+{ep.artifice}</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Active set bonuses */}
          {activeSets.length > 0 && (
            <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {activeSets.map(([name, count]) => {
                const set = findGearSetByName(name);
                return (
                  <div key={name} style={{ flex: 1, minWidth: 150 }}>
                    <div style={{
                      padding: '3px 8px', background: `${accentColor}08`, border: `1px solid ${accentColor}25`,
                      borderLeft: `2px solid ${accentColor}`,
                    }}>
                      <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, letterSpacing: 0.5 }}>{name} ({count}pc)</div>
                      {set && (
                        <div style={{ fontSize: 7, color: '#666', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {set.setBonus}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <HDivider mb={8} />

        {/* Clearance Badge + Classification Stamp Area */}
        <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
          {/* Clearance octagon */}
          <div style={{
            width: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 110, height: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${accentColor}60`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`,
              position: 'relative',
            }}>
              <span style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontFamily: FONT_HEADER }}>CLEARANCE</span>
              <span style={{ fontSize: 44, fontWeight: 900, color: accentColor, fontFamily: FONT_HEADER, lineHeight: 1, textShadow: `0 0 10px ${accentColor}40` }}>{clearance}</span>
              <span style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>LEVEL {char.Rarity - 3}</span>
            </div>
            {/* Mini barcode below badge */}
            <div style={{ marginTop: 8, display: 'flex', gap: 1, opacity: 0.3 }}>
              {operatorID.split('').map((ch, i) => (
                <div key={i} style={{ width: ch.charCodeAt(0) % 2 === 0 ? 3 : 1.5, height: 16, background: '#fff' }} />
              ))}
            </div>
            <span style={{ fontSize: 7, color: '#444', letterSpacing: 1, marginTop: 2 }}>{operatorID}</span>
          </div>

          {/* Right info fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Operator quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[
                { label: 'ELEMENT', value: char.Element.toUpperCase(), color: theme.primary },
                { label: 'ROLE', value: char.Role.toUpperCase(), color: '#ccc' },
                { label: 'WEAPON TYPE', value: char.WeaponType.toUpperCase(), color: '#ccc' },
                { label: 'RARITY', value: '★'.repeat(char.Rarity), color: RARITY_COLORS[char.Rarity] },
              ].map((f, i) => (
                <div key={i} style={{ padding: '3px 6px', background: 'rgba(16,20,28,0.6)', borderLeft: `2px solid ${f.color}30` }}>
                  <div style={{ fontSize: 7, color: '#555', letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: f.color, fontWeight: 700, fontFamily: FONT_MONO }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Character icon if available */}
            {charIcon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(16,20,28,0.5)', border: `1px solid ${accentColor}10` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={charIcon} alt={char.Name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: 8, color: '#555', letterSpacing: 1, fontWeight: 600 }}>VERIFIED IDENTITY</div>
                  <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>{char.Name}</div>
                </div>
              </div>
            )}

            {/* Approval stamp */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px',
              border: `1px dashed ${accentColor}30`, marginTop: 'auto',
            }}>
              <div style={{ transform: 'rotate(-6deg)', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: `${accentColor}50`, letterSpacing: 3, textTransform: 'uppercase', fontFamily: FONT_HEADER }}>APPROVED</div>
                <div style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>{timestamp}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FOOTER BAR — User Info + Barcode + Watermark
          ═══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, zIndex: 20,
        background: 'rgba(8,11,16,0.98)',
        borderTop: `1px solid ${accentColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        {/* Left: color bar + char name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 16, background: theme.primary }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: FONT_MONO, letterSpacing: 1, textTransform: 'uppercase' }}>
            {char.Name}
          </span>
          {state.username && (
            <>
              <div style={{ width: 1, height: 12, background: '#333' }} />
              <span style={{ fontSize: 9, color: '#555', fontWeight: 600 }}>{state.username}</span>
              {state.userCode && <span style={{ fontSize: 8, color: '#444' }}>#{state.userCode}</span>}
              {state.server && <span style={{ fontSize: 8, color: '#444' }}>[{state.server}]</span>}
            </>
          )}
        </div>

        {/* Center: barcode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.25 }}>
          {`${operatorID}${char.Name}`.split('').slice(0, 30).map((ch, i) => (
            <div key={i} style={{ width: ch.charCodeAt(0) % 3 === 0 ? 2.5 : ch.charCodeAt(0) % 2 === 0 ? 1.5 : 1, height: 14, background: '#fff' }} />
          ))}
        </div>

        {/* Right: ZeroSanity watermark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 2 L62 32 L32 62 L2 32 Z" fill={accentColor} fillOpacity="0.6" />
            <path d="M32 7 L57 32 L32 57 L7 32 Z" fill="#0a0e14" />
            <path d="M22 22h18v4.5L26 40h14v4H21v-4.5L35 26H22z" fill={accentColor} fillOpacity="0.7" />
          </svg>
          <span style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: FONT_MONO }}>ZeroSanity.app</span>
        </div>
      </div>

      {/* Corner classification marks */}
      <div style={{ position: 'absolute', top: 36, right: 12, zIndex: 15, fontSize: 7, color: `${accentColor}30`, letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>
        RIOS-CARD-001
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
