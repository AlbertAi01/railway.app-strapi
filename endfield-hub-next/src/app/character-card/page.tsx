'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, EQUIPMENT_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, Role, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Star, Sparkles, Share2, ChevronDown, Sword, Zap, Crosshair, Flame, Save, FilePlus2, Copy, User, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { WEAPON_DATA } from '@/data/weapons';
import { WEAPON_ESSENCES } from '@/data/essences';
import { useAuthStore } from '@/store/authStore';
import { GEAR_SETS, STANDALONE_GEAR, TIER_COLORS, type GearPiece, type GearSet } from '@/data/gear';

// ──────────── Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; accent: string; glow: string }> = {
  Physical: { primary: '#CCCCCC', bg: '#0a0e14', accent: '#888899', glow: 'rgba(200,200,200,0.3)' },
  Heat: { primary: '#FF6B35', bg: '#0a0e14', accent: '#CC5522', glow: 'rgba(255,107,53,0.4)' },
  Cryo: { primary: '#00BFFF', bg: '#0a0e14', accent: '#0088CC', glow: 'rgba(0,191,255,0.4)' },
  Electric: { primary: '#C084FC', bg: '#0a0e14', accent: '#9060CC', glow: 'rgba(192,132,252,0.4)' },
  Nature: { primary: '#34D399', bg: '#0a0e14', accent: '#22AA77', glow: 'rgba(52,211,153,0.4)' },
};

// ──────────── Equipment Data (from gear.ts individual pieces) ────────────

// Categorize pieces by slot type based on icon path or name patterns
function getPieceSlotType(piece: GearPiece): 'Body' | 'Hand' | 'EDC' {
  const iconLower = (piece.icon || '').toLowerCase();
  const nameLower = piece.name.toLowerCase();
  if (iconLower.includes('_body_') || nameLower.includes('armor') || nameLower.includes('cuirass') || nameLower.includes('overalls') || nameLower.includes('jacket') || nameLower.includes('poncho') || nameLower.includes('plating') || nameLower.includes('exoskeleton') || nameLower.includes('vest') || nameLower.includes('suit') || nameLower.includes('cleansuit')) return 'Body';
  if (iconLower.includes('_hand_') || nameLower.includes('gloves') || nameLower.includes('gauntlets') || nameLower.includes('fists') || nameLower.includes('wrists') || nameLower.includes('hands ppe') || nameLower.includes('tac fists')) return 'Hand';
  return 'EDC'; // accessories, knives, scopes, comms, etc.
}

interface EquipmentSlotState {
  setName: string;      // parent set name (or '' for standalone)
  pieceName: string;    // individual piece name
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
  const artsIntensity = Math.round(10 + char.Intellect * 0.5);
  const physDmg = Math.round(10 + char.Strength * 0.4);
  return {
    HP: hp, ATK: atk, DEF: def,
    STR: char.Strength, AGI: char.Agility, INT: char.Intellect, WILL: char.Will,
    'CRIT Rate': Math.round(critRate * 10) / 10,
    'CRIT DMG': Math.round(critDmg * 10) / 10,
    'Arts Intensity': artsIntensity,
    'Physical DMG': physDmg,
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

// ──────────── Equipment Stats (derived from actual gear piece data) ────────────

// Get stats for a specific gear piece by name
function getGearPieceStats(pieceName: string): { stat: string; value: string }[] {
  for (const set of GEAR_SETS) {
    const piece = set.pieces.find(p => p.name === pieceName);
    if (piece) return piece.stats.map(s => ({ stat: s.name, value: s.value }));
  }
  const standalone = STANDALONE_GEAR.find(p => p.name === pieceName);
  if (standalone) return standalone.stats.map(s => ({ stat: s.name, value: s.value }));
  return [];
}

// Find gear piece object by name
function findGearPieceByName(pieceName: string): GearPiece | null {
  for (const set of GEAR_SETS) {
    const piece = set.pieces.find(p => p.name === pieceName);
    if (piece) return piece;
  }
  return STANDALONE_GEAR.find(p => p.name === pieceName) || null;
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

const MAX_ACCOUNT_SAVES = 3;

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
        <div className="rios-modal-body p-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
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
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-md" onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <h3 className="text-white font-bold text-base">Select {weaponType}</h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>
        <div className="rios-modal-body p-4 space-y-1">
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

// ──────────── Equipment Picker Modal (Individual Pieces) ────────────

function EquipmentPickerModal({
  open, onClose, onSelect, slot, currentPieceName,
}: {
  open: boolean; onClose: () => void; onSelect: (pieceName: string, setName: string) => void; slot: string; currentPieceName: string;
}) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});

  // Filter pieces by slot type (Body, Hand, EDC)
  const slotType = slot.startsWith('EDC') ? 'EDC' : slot as 'Body' | 'Hand' | 'EDC';

  const toggleSet = (name: string) => {
    setExpandedSets(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (!open) return null;

  // Get filtered sets with their pieces matching slot type
  const filteredSets = GEAR_SETS
    .map(set => {
      const matchingPieces = set.pieces.filter(piece => {
        const pieceSlot = getPieceSlotType(piece);
        if (pieceSlot !== slotType) return false;
        if (search && !piece.name.toLowerCase().includes(search.toLowerCase()) && !set.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (tierFilter && piece.tier !== tierFilter) return false;
        return true;
      });
      return { ...set, filteredPieces: matchingPieces };
    })
    .filter(set => set.filteredPieces.length > 0);

  // Also get standalone pieces matching slot type
  const filteredStandalone = STANDALONE_GEAR.filter(piece => {
    const pieceSlot = getPieceSlotType(piece);
    if (pieceSlot !== slotType) return false;
    if (search && !piece.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tierFilter && piece.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="rios-modal-backdrop" onClick={onClose}>
      <div className="rios-modal-panel rios-modal-md" onClick={e => e.stopPropagation()}>
        <div className="rios-modal-header">
          <div>
            <h3 className="text-white font-bold text-base">Select {slot} Equipment</h3>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Individual gear pieces with unique stats</p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white"><X size={20} /></button>
        </div>

        {/* Search + Tier filter */}
        <div className="p-3 border-b border-[var(--color-border)] space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gear pieces..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div className="flex gap-1.5">
            {['T4', 'T3', 'T2', 'T1'].map(t => (
              <button key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${tierFilter === t ? '' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                style={tierFilter === t ? { borderColor: TIER_COLORS[t], color: TIER_COLORS[t], backgroundColor: TIER_COLORS[t] + '15' } : undefined}
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="rios-modal-body p-3 space-y-1">
          {/* None option */}
          <button onClick={() => { onSelect('', ''); onClose(); }}
            className={`w-full flex items-center gap-3 p-2 border transition-colors ${!currentPieceName ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
          >
            <div className="w-10 h-10 bg-[var(--color-surface-2)] flex-shrink-0 flex items-center justify-center">
              <X size={16} className="text-[var(--color-text-muted)]" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">None</span>
          </button>

          {/* Sets with individual pieces */}
          {filteredSets.map(set => (
            <div key={set.name} className="border border-[var(--color-border)]">
              {/* Set header (clickable to expand/collapse) */}
              <button onClick={() => toggleSet(set.name)}
                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="w-10 h-10 bg-[var(--color-surface-2)] flex-shrink-0 relative">
                  {set.icon && <Image src={set.icon} alt={set.name} fill className="object-contain p-0.5" sizes="40px" unoptimized />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm text-white font-semibold">{set.name}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] truncate" style={{ color: TIER_COLORS[set.filteredPieces[0]?.tier || 'T4'] }}>
                    {set.filteredPieces[0]?.tier} &middot; {set.filteredPieces.length} {slotType.toLowerCase()} piece{set.filteredPieces.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform ${expandedSets[set.name] ? 'rotate-180' : ''}`} />
              </button>

              {/* Individual pieces */}
              {expandedSets[set.name] && (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                  {set.filteredPieces.map(piece => {
                    const isSelected = piece.name === currentPieceName;
                    return (
                      <button key={piece.id} onClick={() => { onSelect(piece.name, set.name); onClose(); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]/50 last:border-b-0 transition-colors ${isSelected ? 'bg-[var(--color-accent)]/10' : 'hover:bg-[var(--color-surface-2)]'}`}
                      >
                        <div className="w-8 h-8 bg-[var(--color-surface)] flex-shrink-0 relative border" style={{ borderColor: isSelected ? 'var(--color-accent)' : TIER_COLORS[piece.tier] + '40' }}>
                          {piece.icon && <Image src={piece.icon} alt={piece.name} fill className="object-contain p-0.5" sizes="32px" unoptimized />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{piece.name}</div>
                          <div className="text-[9px] text-[var(--color-text-muted)] flex flex-wrap gap-x-2">
                            {piece.stats.map((s, i) => (
                              <span key={i}>{s.name} <span className="text-[var(--color-accent)]">{s.value}</span></span>
                            ))}
                          </div>
                        </div>
                        <div className="text-[9px] text-[var(--color-text-muted)] flex-shrink-0">DEF {piece.def}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Standalone pieces */}
          {filteredStandalone.length > 0 && (
            <div className="border border-[var(--color-border)]">
              <button onClick={() => toggleSet('__standalone')}
                className="w-full flex items-center gap-3 p-2 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className="w-10 h-10 bg-[var(--color-surface-2)] flex-shrink-0 flex items-center justify-center text-[var(--color-text-muted)]">
                  <Star size={16} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm text-white font-semibold">Standalone Pieces</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{filteredStandalone.length} piece{filteredStandalone.length !== 1 ? 's' : ''} (no set bonus)</div>
                </div>
                <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform ${expandedSets['__standalone'] ? 'rotate-180' : ''}`} />
              </button>
              {expandedSets['__standalone'] && (
                <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]/30">
                  {filteredStandalone.map(piece => {
                    const isSelected = piece.name === currentPieceName;
                    return (
                      <button key={piece.id} onClick={() => { onSelect(piece.name, ''); onClose(); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 border-b border-[var(--color-border)]/50 last:border-b-0 transition-colors ${isSelected ? 'bg-[var(--color-accent)]/10' : 'hover:bg-[var(--color-surface-2)]'}`}
                      >
                        <div className="w-8 h-8 bg-[var(--color-surface)] flex-shrink-0 relative border" style={{ borderColor: TIER_COLORS[piece.tier] + '40' }}>
                          {piece.icon && <Image src={piece.icon} alt={piece.name} fill className="object-contain p-0.5" sizes="32px" unoptimized />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{piece.name}</div>
                          <div className="text-[9px] text-[var(--color-text-muted)] flex flex-wrap gap-x-2">
                            {piece.stats.map((s, i) => (
                              <span key={i}>{s.name} <span className="text-[var(--color-accent)]">{s.value}</span></span>
                            ))}
                          </div>
                        </div>
                        <div className="text-[9px] flex-shrink-0" style={{ color: TIER_COLORS[piece.tier] }}>{piece.tier}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {filteredSets.length === 0 && filteredStandalone.length === 0 && (
            <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">No {slotType.toLowerCase()} pieces found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────── Form Section ────────────

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/80">
      <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50">
        <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-3 space-y-2.5">{children}</div>
    </div>
  );
}

// ──────────── Main Page ────────────

const inputClass = "w-full px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors";

export default function CharacterCardPage() {
  // Character
  const [selectedCharName, setSelectedCharName] = useState('Endministrator');
  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const [level, setLevel] = useState(80);
  const [potential, setPotential] = useState(0);
  const [affinity, setAffinity] = useState(0);
  const [charBreakthrough, setCharBreakthrough] = useState(3);

  // Weapon
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
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

  // Skills
  const [skillLevels, setSkillLevels] = useState({ basic: 1, normal: 1, combo: 1, ultimate: 1 });

  // Talents
  const [talentStates, setTalentStates] = useState<TalentState[]>(['locked', 'locked']);

  // Equipment
  const defaultEquip: EquipmentSlotState = { setName: '', pieceName: '', artifice: 0, substat1: '', substat2: '', substat3: '' };
  const [equipBody, setEquipBody] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipHand, setEquipHand] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipEdc1, setEquipEdc1] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipEdc2, setEquipEdc2] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipPickerSlot, setEquipPickerSlot] = useState<string | null>(null);

  // Theme
  const [colorTheme, setColorTheme] = useState('auto');

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Account-linked saves
  const { user } = useAuthStore();
  const [activeSlot, setActiveSlot] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  // Preview scaling
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        setPreviewScale(Math.min(containerWidth / 1200, 1));
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

  const weaponData = weapon ? WEAPON_DATA.find(w => w.Name === weapon.Name) : null;
  const weaponEssence = weapon ? WEAPON_ESSENCES.find(e => e.name === weapon.Name) : null;
  const talents = CHARACTER_TALENTS[selectedCharName] || DEFAULT_TALENTS;

  const equippedSets = [equipBody, equipHand, equipEdc1, equipEdc2].filter(e => e.pieceName);

  // ──────────── Save/Load (Account-linked) ────────────

  const getSaveKey = useCallback(() => {
    if (user) return `zs-showcases-${user.id}`;
    return 'zs-showcases-local';
  }, [user]);

  const getAccountSaves = useCallback((): (ShowcaseState | null)[] => {
    try {
      const raw = localStorage.getItem(getSaveKey());
      if (!raw) return [null, null, null];
      const parsed = JSON.parse(raw);
      while (parsed.length < MAX_ACCOUNT_SAVES) parsed.push(null);
      return parsed.slice(0, MAX_ACCOUNT_SAVES);
    } catch { return [null, null, null]; }
  }, [getSaveKey]);

  const [accountSaves, setAccountSaves] = useState<(ShowcaseState | null)[]>([null, null, null]);

  useEffect(() => {
    setAccountSaves(getAccountSaves());
  }, [getAccountSaves]);

  const buildState = useCallback((): ShowcaseState => ({
    name: showcaseName || `${selectedCharName} Build`,
    charName: selectedCharName, level, potential, affinity, charBreakthrough,
    weaponName: selectedWeaponName, weaponLevel, weaponBreakthrough, weaponPotential, essenceLevels,
    username, userCode, server, skillLevels,
    equipBody, equipHand, equipEdc1, equipEdc2,
    talentStates, colorTheme,
  }), [showcaseName, selectedCharName, level, potential, affinity, charBreakthrough, selectedWeaponName, weaponLevel, weaponBreakthrough, weaponPotential, essenceLevels, username, userCode, server, skillLevels, equipBody, equipHand, equipEdc1, equipEdc2, talentStates, colorTheme]);

  const saveToSlot = useCallback((slot: number) => {
    const saves = getAccountSaves();
    saves[slot] = buildState();
    localStorage.setItem(getSaveKey(), JSON.stringify(saves));
    setAccountSaves([...saves]);
    setSaveMessage(`Saved to Slot ${slot + 1}`);
    setTimeout(() => setSaveMessage(''), 2000);
  }, [getAccountSaves, buildState, getSaveKey]);

  const loadFromSlot = useCallback((slot: number) => {
    const saves = getAccountSaves();
    const state = saves[slot];
    if (!state) return;
    setSelectedCharName(state.charName);
    setLevel(state.level);
    setPotential(state.potential);
    setAffinity(state.affinity ?? 0);
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
    setActiveSlot(slot);
  }, [getAccountSaves]);

  const deleteSlot = useCallback((slot: number) => {
    const saves = getAccountSaves();
    saves[slot] = null;
    localStorage.setItem(getSaveKey(), JSON.stringify(saves));
    setAccountSaves([...saves]);
  }, [getAccountSaves, getSaveKey]);

  const resetShowcase = useCallback(() => {
    setSelectedCharName('Endministrator');
    setLevel(80); setPotential(0); setAffinity(0); setCharBreakthrough(3);
    setSelectedWeaponName(''); setWeaponLevel(80); setWeaponBreakthrough(3);
    setWeaponPotential(0); setEssenceLevels([3, 2, 1]);
    setShowcaseName(''); setUsername(''); setUserCode(''); setServer('');
    setSkillLevels({ basic: 1, normal: 1, combo: 1, ultimate: 1 });
    setEquipBody({ ...defaultEquip }); setEquipHand({ ...defaultEquip });
    setEquipEdc1({ ...defaultEquip }); setEquipEdc2({ ...defaultEquip });
    setTalentStates(['locked', 'locked']); setColorTheme('auto');
  }, []);

  // ──────────── Export with Watermark ────────────

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

  const copyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 2, useCORS: true, allowTaint: true, logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setSaveMessage('Copied!');
            setTimeout(() => setSaveMessage(''), 2000);
          } catch { /* ignore */ }
        }
        setIsExporting(false);
      }, 'image/png');
    } catch { setIsExporting(false); }
  };

  const equipSlots = [
    { label: 'Body', state: equipBody, setter: setEquipBody },
    { label: 'Hand', state: equipHand, setter: setEquipHand },
    { label: 'EDC 1', state: equipEdc1, setter: setEquipEdc1 },
    { label: 'EDC 2', state: equipEdc2, setter: setEquipEdc2 },
  ];

  const currentEquipPickerState = equipSlots.find(s => s.label === equipPickerSlot);

  // ──────────── RENDER ────────────

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 lg:-mt-8" style={{ minHeight: 'calc(100vh - 28px)' }}>
      {/* Full-width two-column layout */}
      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 28px)' }}>

        {/* ═══════ LEFT COLUMN: Form Controls (scrollable) ═══════ */}
        <div className="w-full lg:w-[420px] xl:w-[460px] lg:flex-shrink-0 lg:overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]/30"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-border) transparent' }}>
          <div className="p-3 sm:p-4 space-y-3">

            {/* Page Title */}
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border)]">
              <div className="w-8 h-8 bg-[var(--color-accent)] flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                <Sparkles size={14} className="text-black" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Operator Showcase</h1>
                <p className="text-[10px] text-[var(--color-text-muted)] tracking-wider uppercase" style={{ fontFamily: 'Share Tech Mono, monospace' }}>RIOS-CARD-001 // Character Card Creator</p>
              </div>
            </div>

            {/* Save Slots (Account-linked) */}
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/80">
              <div className="px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                  {user ? `${user.username}'s Cards` : 'Local Saves'}
                </h3>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {user ? <span className="flex items-center gap-1"><User size={10} /> Synced</span> : 'Sign in to sync'}
                </span>
              </div>
              <div className="p-2 space-y-1.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map(slot => {
                    const save = accountSaves[slot];
                    const isActive = activeSlot === slot;
                    return (
                      <div key={slot} className={`relative border p-2 transition-all cursor-pointer group ${isActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
                        <div className="text-[10px] text-[var(--color-text-muted)] mb-0.5">Slot {slot + 1}</div>
                        {save ? (
                          <>
                            <div className="text-xs text-white font-semibold truncate">{save.charName}</div>
                            <div className="text-[10px] text-[var(--color-text-muted)]">Lv.{save.level}</div>
                            <div className="flex gap-1 mt-1">
                              <button onClick={(e) => { e.stopPropagation(); loadFromSlot(slot); }}
                                className="flex-1 text-[9px] py-0.5 border border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10">Load</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteSlot(slot); }}
                                className="px-1 py-0.5 border border-[var(--color-border)] text-red-400/60 hover:text-red-400 hover:border-red-400/30"><Trash2 size={9} /></button>
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] text-[var(--color-text-muted)]/50 italic">Empty</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => saveToSlot(activeSlot)}
                    className="flex-1 py-1.5 bg-[var(--color-accent)] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
                    <Save size={12} /> {saveMessage || `Save to Slot ${activeSlot + 1}`}
                  </button>
                  <button onClick={resetShowcase}
                    className="px-3 py-1.5 border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs hover:border-[var(--color-accent)] flex items-center gap-1">
                    <FilePlus2 size={12} /> New
                  </button>
                </div>
              </div>
            </div>

            {/* Showcase Name */}
            <FormSection title="Showcase Name">
              <input type="text" value={showcaseName} onChange={e => setShowcaseName(e.target.value)}
                placeholder="Enter showcase name" className={inputClass} />
            </FormSection>

            {/* User Info */}
            <FormSection title="User Information">
              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">User Code</label>
                <input type="text" value={userCode} onChange={e => setUserCode(e.target.value)}
                  placeholder="Enter your in-game user ID" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Server</label>
                <select value={server} onChange={e => setServer(e.target.value)} className={inputClass}>
                  <option value="">Select server region</option>
                  <option value="Americas/Europe">Americas/Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="China">China</option>
                </select>
              </div>
            </FormSection>

            {/* Character */}
            <FormSection title="Character">
              <button onClick={() => setCharPickerOpen(true)}
                className="w-full flex items-center gap-3 p-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                {character ? (
                  <>
                    <div className="w-12 h-12 bg-[var(--color-surface-2)] relative flex-shrink-0">
                      {iconUrl && <Image src={iconUrl} alt={character.Name} fill className="object-cover" sizes="48px" unoptimized />}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: character.Rarity }).map((_, i) => (
                          <Star key={i} size={10} className="fill-current" style={{ color: RARITY_COLORS[character.Rarity] }} />
                        ))}
                      </div>
                      <div className="text-sm text-white font-semibold">{character.Name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Click to change</div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-text-muted)] py-2">Click to select a character...</div>
                )}
                <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
              </button>

              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Character Level</label>
                <select value={level} onChange={e => setLevel(Number(e.target.value))} className={inputClass}>
                  {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                    <option key={lv} value={lv}>Lv. {lv}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Breakthrough - {CHAR_BREAKTHROUGH_LABELS[charBreakthrough]}</label>
                <div className="flex gap-0.5">
                  {CHAR_BREAKTHROUGH_LABELS.map((label, i) => (
                    <button key={i} onClick={() => setCharBreakthrough(i)}
                      className={`flex-1 py-1 text-[10px] font-bold border transition-all ${i <= charBreakthrough ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                    >{label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Potential (Dupes)</label>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4, 5, 6].map(p => (
                    <button key={p} onClick={() => setPotential(p)}
                      className={`flex-1 py-1 text-[10px] font-bold border transition-colors ${potential === p ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                    >{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Affinity Lv.{affinity}</label>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map(a => (
                    <button key={a} onClick={() => setAffinity(a)}
                      className={`flex-1 py-1 text-[10px] font-bold border transition-colors ${affinity === a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                    >{a}</button>
                  ))}
                </div>
              </div>
            </FormSection>

            {/* Weapon */}
            {character && (
              <FormSection title="Weapon">
                <button onClick={() => setWeaponPickerOpen(true)}
                  className="w-full flex items-center gap-3 p-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                >
                  {weapon ? (
                    <>
                      <div className="w-10 h-10 bg-[var(--color-surface-2)] relative flex-shrink-0">
                        {weaponIconUrl && <Image src={weaponIconUrl} alt={weapon.Name} fill className="object-contain p-0.5" sizes="40px" unoptimized />}
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-xs text-white">{weapon.Name}</div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: weapon.Rarity }).map((_, i) => (
                            <Star key={i} size={8} className="fill-current" style={{ color: RARITY_COLORS[weapon.Rarity] || '#888' }} />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-[var(--color-text-muted)] py-1">Click to select weapon...</div>
                  )}
                  <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
                </button>
                {weapon && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Weapon Lv</label>
                        <select value={weaponLevel} onChange={e => setWeaponLevel(Number(e.target.value))} className={inputClass}>
                          {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                            <option key={lv} value={lv}>Lv. {lv}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Potential</label>
                        <div className="flex gap-0.5">
                          {[0, 1, 2, 3, 4, 5].map(p => (
                            <button key={p} onClick={() => setWeaponPotential(p)}
                              className={`flex-1 py-1 text-[10px] font-bold border transition-colors ${weaponPotential === p ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                            >{p}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-0.5 text-[var(--color-text-muted)] uppercase">Breakthrough</label>
                      <div className="flex gap-0.5">
                        {WEAPON_BREAKTHROUGH_LABELS.map((_, i) => (
                          <button key={i} onClick={() => setWeaponBreakthrough(i)}
                            className={`flex-1 py-1 text-[10px] font-bold border transition-all ${i <= weaponBreakthrough ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                          >B{i}</button>
                        ))}
                      </div>
                    </div>
                    {weaponEssence && (
                      <div className="space-y-1.5 pt-1.5 border-t border-[var(--color-border)]">
                        <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase">Essence Bonuses</label>
                        {[
                          { label: weaponEssence.primaryAttr },
                          { label: weaponEssence.secondaryStat || 'Secondary' },
                          { label: weaponData?.SkillName?.split(':')[0] || weaponEssence.skillStat },
                        ].map((ess, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[200px]">{ess.label}</span>
                              <span className="text-[10px] text-[var(--color-accent)]">Lv. {essenceLevels[idx]}</span>
                            </div>
                            <div className="flex gap-px">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <button key={i} onClick={() => setEssenceLevels(prev => { const n = [...prev]; n[idx] = i + 1; return n; })}
                                  className={`flex-1 h-2.5 border transition-colors ${i < essenceLevels[idx] ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </FormSection>
            )}

            {/* Equipment */}
            {character && (
              <FormSection title="Equipment">
                {equipSlots.map(({ label, state, setter }) => {
                  const piece = state.pieceName ? findGearPieceByName(state.pieceName) : null;
                  const pieceStats = state.pieceName ? getGearPieceStats(state.pieceName) : [];
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase w-10">{label}</span>
                        <button onClick={() => setEquipPickerSlot(label)}
                          className="flex-1 flex items-center gap-2 py-1 px-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left"
                        >
                          {state.pieceName && piece ? (
                            <>
                              <div className="w-7 h-7 bg-[var(--color-surface-2)] relative flex-shrink-0" style={{ borderLeft: `2px solid ${TIER_COLORS[piece.tier]}` }}>
                                {piece.icon && (
                                  <Image src={piece.icon} alt={piece.name} fill className="object-contain p-0.5" sizes="28px" unoptimized />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-white truncate block">{piece.name}</span>
                                {state.setName && <span className="text-[8px] text-[var(--color-text-muted)]">{state.setName}</span>}
                              </div>
                            </>
                          ) : (
                            <span className="text-[10px] text-[var(--color-text-muted)]">None</span>
                          )}
                        </button>
                        {state.pieceName && (
                          <div className="flex gap-px">
                            {[0, 1, 2, 3].map(a => (
                              <button key={a} onClick={() => setter({ ...state, artifice: a })}
                                className={`w-6 h-6 text-[9px] font-bold border transition-colors ${state.artifice >= a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                              >+{a}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      {state.pieceName && pieceStats.length > 0 && (
                        <div className="ml-10 pl-2 border-l border-[var(--color-border)]">
                          <div className="flex items-center justify-between py-px">
                            <span className="text-[8px] text-[var(--color-text-muted)]">DEF</span>
                            <span className="text-[9px] text-white">{piece?.def || 0}</span>
                          </div>
                          {pieceStats.map((sub, si) => (
                            <div key={si} className="flex items-center justify-between py-px">
                              <span className="text-[9px] text-[var(--color-text-muted)]">{sub.stat}</span>
                              <span className="text-[9px] text-[var(--color-accent)]">{sub.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </FormSection>
            )}

            {/* Skill Levels */}
            {character && (
              <FormSection title="Skill Levels">
                {SKILL_TYPES.map(skill => {
                  const currentLv = skillLevels[skill.key as keyof typeof skillLevels];
                  const Icon = skill.icon;
                  return (
                    <div key={skill.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                          <Icon size={11} className="text-[var(--color-accent)]" /> {skill.label}
                        </span>
                        <span className="text-[10px] text-[var(--color-accent)] font-bold">Lv. {currentLv}</span>
                      </div>
                      <div className="flex gap-px">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(lv => (
                          <button key={lv} onClick={() => setSkillLevels(prev => ({ ...prev, [skill.key]: lv }))}
                            className={`flex-1 h-5 text-[8px] font-bold border transition-colors ${currentLv >= lv ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                          >{lv}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </FormSection>
            )}

            {/* Talent Levels */}
            {character && (
              <FormSection title="Talent Levels">
                {talents.map((talent, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1">{talent.name} <span className="text-[var(--color-text-muted)]/60">({talent.type})</span></label>
                    <div className="flex gap-0.5">
                      {([
                        { key: 'locked' as TalentState, label: 'Locked' },
                        { key: 'base' as TalentState, label: 'Base (α)' },
                        { key: 'upgrade' as TalentState, label: 'Upgrade (β)' },
                      ]).map(opt => (
                        <button key={opt.key} onClick={() => setTalentStates(prev => { const n = [...prev]; n[idx] = opt.key; return n; })}
                          className={`flex-1 py-1 text-[10px] font-bold border transition-colors ${talentStates[idx] === opt.key ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </FormSection>
            )}

            {/* Color Theme */}
            <FormSection title="Customization">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-muted)] uppercase">Color Theme</label>
                <div className="flex flex-wrap gap-1">
                  <button onClick={() => setColorTheme('auto')}
                    className={`px-2 py-1 text-[10px] font-bold border transition-colors ${colorTheme === 'auto' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                  >Auto</button>
                  {Object.entries(THEME_COLORS).map(([name, t]) => (
                    <button key={name} onClick={() => setColorTheme(name)}
                      className={`px-2 py-1 text-[10px] font-bold border transition-colors ${colorTheme === name ? '' : 'border-[var(--color-border)]'}`}
                      style={colorTheme === name ? { borderColor: t.primary, color: t.primary, backgroundColor: t.primary + '15' } : { color: t.primary + '99' }}
                    >{name}</button>
                  ))}
                </div>
              </div>
            </FormSection>

            {/* Export Actions */}
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-3 space-y-2">
              <div className="flex gap-1.5">
                <button onClick={() => downloadCard('png')} disabled={!character || isExporting}
                  className="flex-1 py-2 bg-[var(--color-accent)] text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                  <Download size={13} /> {isExporting ? 'Exporting...' : 'Export PNG'}
                </button>
                <button onClick={() => downloadCard('jpg')} disabled={!character || isExporting}
                  className="py-2 px-3 border border-[var(--color-border)] text-white font-bold text-xs hover:border-[var(--color-accent)] disabled:opacity-50 transition-colors">JPG</button>
                <button onClick={copyToClipboard} disabled={!character || isExporting}
                  className="py-2 px-3 border border-[var(--color-border)] text-white font-bold text-xs hover:border-[var(--color-accent)] disabled:opacity-50 transition-colors flex items-center gap-1">
                  <Copy size={12} /> Copy
                </button>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { const text = `Check out my ${character?.Name} build! Made with Zero Sanity`; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank'); }}
                  disabled={!character}
                  className="flex-1 py-1.5 border border-[var(--color-border)] text-[var(--color-text-muted)] text-[10px] hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center gap-1 transition-colors">
                  <Share2 size={10} /> Share on X
                </button>
                <button onClick={() => { window.open(`https://reddit.com/submit?title=${encodeURIComponent(`${character?.Name} Showcase - Zero Sanity`)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank'); }}
                  disabled={!character}
                  className="flex-1 py-1.5 border border-[var(--color-border)] text-[var(--color-text-muted)] text-[10px] hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center gap-1 transition-colors">
                  <Share2 size={10} /> Share on Reddit
                </button>
              </div>
            </div>

            <div className="h-8" /> {/* Bottom padding for scroll */}
          </div>
        </div>

        {/* ═══════ RIGHT COLUMN: Card Preview (sticky, centered) ═══════ */}
        <div className="w-full lg:flex-1 lg:min-w-0 bg-[#0A0908] flex items-start justify-center overflow-y-auto p-3 sm:p-4 lg:p-6">
          {character && stats ? (
            <div ref={previewContainerRef} className="w-full max-w-[1200px]">
              <div
                ref={cardRef}
                style={{
                  width: '1200px',
                  height: '675px',
                  transformOrigin: 'top left',
                  transform: `scale(${previewScale})`,
                  position: 'relative',
                  overflow: 'hidden',
                  background: theme.bg,
                }}
              >
                {/* ── Background: Character Art Zone (Left 0-650px) ── */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, width: '660px', height: '675px', overflow: 'hidden',
                }}>
                  {splashUrl && (
                    <img src={splashUrl} alt={character.Name} crossOrigin="anonymous"
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: `linear-gradient(to bottom, transparent 0%, ${theme.bg} 100%)` }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '180px', background: `linear-gradient(to right, transparent 0%, ${theme.bg} 100%)` }} />
                  <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 80px ${theme.glow}`, pointerEvents: 'none' }} />
                </div>

                {/* ── Top accent line ── */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: theme.primary, zIndex: 30 }} />

                {/* ── Right Side: Data Dossier Panel ── */}
                <div style={{
                  position: 'absolute', left: '640px', top: 0, width: '560px', height: '675px',
                  background: 'rgba(10, 14, 20, 0.93)',
                  borderLeft: `3px solid ${theme.primary}`,
                  padding: '20px 22px 20px 22px',
                  display: 'flex', flexDirection: 'column',
                  zIndex: 10,
                }}>
                  {/* Scanline overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', pointerEvents: 'none' }} />
                  {/* Grid pattern */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${theme.primary}10 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}10 1px, transparent 1px)`, backgroundSize: '20px 20px', opacity: 0.3, pointerEvents: 'none' }} />

                  <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* OPERATOR FILE label */}
                    <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', letterSpacing: '2px', color: theme.accent, marginBottom: '4px' }}>OPERATOR FILE // {showcaseName || 'UNTITLED SHOWCASE'}</div>

                    {/* Character name + Element/Role row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '6px' }}>
                      <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '34px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', lineHeight: '1', margin: 0 }}>{character.Name}</h1>
                      <div style={{ display: 'flex', gap: '6px', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: ELEMENT_COLORS[character.Element], padding: '2px 8px', background: ELEMENT_COLORS[character.Element] + '20', border: `1px solid ${ELEMENT_COLORS[character.Element]}50` }}>{character.Element}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {roleIconUrl && <img src={roleIconUrl} alt="" crossOrigin="anonymous" style={{ width: '12px', height: '12px' }} />}
                          {character.Role}
                        </span>
                      </div>
                    </div>

                    {/* Rarity + Level + Breakthrough + Potential + Affinity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {Array.from({ length: character.Rarity }).map((_, i) => (
                          <span key={i} style={{ color: RARITY_COLORS[character.Rarity], fontSize: '12px' }}>★</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 10px', background: 'rgba(0,0,0,0.5)', border: `2px solid ${theme.primary}` }}>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '10px', color: theme.accent }}>LV</span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: '1' }}>{level}</span>
                      </div>
                      {charBreakthrough > 0 && (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: charBreakthrough }).map((_, i) => (
                            <span key={i} style={{ color: theme.primary, fontSize: '12px' }}>✦</span>
                          ))}
                        </div>
                      )}
                      {potential > 0 && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: theme.accent, padding: '2px 6px', background: `${theme.primary}15`, border: `1px solid ${theme.primary}30` }}>P{potential}</span>}
                      {affinity > 0 && <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#FF8FAA', padding: '2px 6px', background: 'rgba(255,143,170,0.1)', border: '1px solid rgba(255,143,170,0.3)' }}>♥ {affinity}</span>}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: `linear-gradient(to right, ${theme.primary} 0%, transparent 100%)`, marginBottom: '10px' }} />

                    {/* Stats: Two-row layout */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {/* Left column: Core stats */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '8px', color: theme.accent, marginBottom: '4px', letterSpacing: '1.5px', fontWeight: 700 }}>COMBAT STATS</div>
                        {[
                          { label: 'HP', value: stats.HP.toLocaleString() },
                          { label: 'ATK', value: stats.ATK.toLocaleString() },
                          { label: 'DEF', value: stats.DEF.toLocaleString() },
                        ].map(s => (
                          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: `1px solid ${theme.primary}10` }}>
                            <span style={{ fontSize: '10px', color: theme.accent, fontWeight: 700 }}>{s.label}</span>
                            <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700 }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                      {/* Right column: Attributes */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '8px', color: theme.accent, marginBottom: '4px', letterSpacing: '1.5px', fontWeight: 700 }}>ATTRIBUTES</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                          {[
                            { label: 'STR', value: stats.STR },
                            { label: 'AGI', value: stats.AGI },
                            { label: 'INT', value: stats.INT },
                            { label: 'WILL', value: stats.WILL },
                          ].map(attr => (
                            <div key={attr.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', background: `${theme.primary}08`, border: `1px solid ${theme.primary}15` }}>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)' }}>{attr.label}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Secondary Stats Row */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                      {[
                        { label: 'CRIT Rate', value: `${stats['CRIT Rate']}%` },
                        { label: 'CRIT DMG', value: `${stats['CRIT DMG']}%` },
                        { label: 'Arts Int.', value: `${stats['Arts Intensity']}` },
                        { label: 'Phys DMG', value: `${stats['Physical DMG']}` },
                      ].map(s => (
                        <div key={s.label} style={{ flex: 1, padding: '4px 6px', background: `${theme.primary}08`, border: `1px solid ${theme.primary}12`, textAlign: 'center' }}>
                          <div style={{ fontSize: '7px', color: theme.primary, fontWeight: 700, letterSpacing: '0.5px' }}>{s.label}</div>
                          <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 700 }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Skills Row */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '8px', color: theme.accent, marginBottom: '5px', letterSpacing: '1.5px', fontWeight: 700 }}>COMBAT SKILLS</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {SKILL_TYPES.map(skill => {
                          const lv = skillLevels[skill.key as keyof typeof skillLevels];
                          return (
                            <div key={skill.key} style={{ flex: 1, padding: '5px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${theme.primary}20`, textAlign: 'center' }}>
                              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{skill.short}</div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '3px' }}>
                                {Array.from({ length: 12 }).map((_, idx) => (
                                  <div key={idx} style={{ width: '4px', height: '4px', borderRadius: '50%', background: idx < lv ? theme.primary : 'rgba(255,255,255,0.12)' }} />
                                ))}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: lv >= 10 ? theme.primary : '#ffffff' }}>Lv.{lv}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weapon */}
                    {weapon && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: 'rgba(0,0,0,0.5)', border: `1px solid ${theme.primary}25`, marginBottom: '8px' }}>
                        {weaponIconUrl && <img src={weaponIconUrl} alt={weapon.Name} crossOrigin="anonymous" style={{ width: '28px', height: '28px' }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '10px', color: '#ffffff', fontWeight: 700 }}>{weapon.Name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {Array.from({ length: weapon.Rarity }).map((_, i) => (
                              <span key={i} style={{ color: RARITY_COLORS[weapon.Rarity] || '#888', fontSize: '8px' }}>★</span>
                            ))}
                            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)' }}>Lv.{weaponLevel}</span>
                            {weaponBreakthrough > 0 && <span style={{ fontSize: '8px', color: theme.accent }}>B{weaponBreakthrough}</span>}
                            {weaponPotential > 0 && <span style={{ fontSize: '8px', color: theme.primary }}>P{weaponPotential}</span>}
                          </div>
                        </div>
                        {/* Essence levels */}
                        {weaponEssence && (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {essenceLevels.map((lv, idx) => (
                              <div key={idx} style={{ width: '22px', height: '22px', background: `${theme.primary}15`, border: `1px solid ${theme.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: theme.primary }}>{lv}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Equipment + Talents Row */}
                    <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0 }}>
                      {/* Equipment */}
                      {equippedSets.length > 0 && (
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8px', color: theme.accent, marginBottom: '4px', letterSpacing: '1.5px', fontWeight: 700 }}>EQUIPMENT</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                            {equipSlots.filter(s => s.state.pieceName).map(({ label, state }) => {
                              const piece = findGearPieceByName(state.pieceName);
                              const pieceStats = getGearPieceStats(state.pieceName);
                              return (
                                <div key={label} style={{ padding: '4px 5px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${theme.primary}15`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {piece?.icon && <img src={piece.icon} alt={piece.name} crossOrigin="anonymous" style={{ width: '16px', height: '16px' }} />}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '8px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state.pieceName}</div>
                                    <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)' }}>{label} {state.setName ? `(${state.setName})` : ''} +{state.artifice}</div>
                                    {pieceStats.length > 0 && (
                                      <div style={{ fontSize: '7px', color: theme.accent }}>
                                        {pieceStats.map(s => `${s.stat} ${s.value}`).join(' / ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Talents */}
                      {talentStates.some(t => t !== 'locked') && (
                        <div style={{ width: equippedSets.length > 0 ? '140px' : 'auto', flexShrink: 0 }}>
                          <div style={{ fontSize: '8px', color: theme.accent, marginBottom: '4px', letterSpacing: '1.5px', fontWeight: 700 }}>TALENTS</div>
                          {talents.map((talent, idx) => (
                            talentStates[idx] !== 'locked' && (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 5px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${theme.primary}15`, marginBottom: '2px' }}>
                                <span style={{ color: theme.primary, fontWeight: 700, fontSize: '10px' }}>{talentStates[idx] === 'base' ? 'α' : 'β'}</span>
                                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{talent.name}</span>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Bottom bar: username + watermark ── */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '36px',
                  background: 'rgba(10, 14, 20, 0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 20px', zIndex: 30, borderTop: `1px solid ${theme.primary}30`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {username && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{username}</span>}
                    {userCode && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>#{userCode}</span>}
                    {server && <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>{server}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Zero Sanity Logo */}
                    <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 2 L62 32 L32 62 L2 32 Z" fill={theme.primary}/>
                      <path d="M32 6 L58 32 L32 58 L6 32 Z" fill={theme.bg}/>
                      <path d="M22 22h18v4.5L26 40h14v4H21v-4.5L35 26H22z" fill={theme.primary}/>
                    </svg>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', fontFamily: 'Share Tech Mono, monospace' }}>zerosanity.app</span>
                  </div>
                </div>

                {/* ── Corner brackets ── */}
                {[
                  { top: '10px', left: '10px', borderTop: `2px solid ${theme.primary}50`, borderLeft: `2px solid ${theme.primary}50` },
                  { top: '10px', right: '10px', borderTop: `2px solid ${theme.primary}50`, borderRight: `2px solid ${theme.primary}50` },
                  { bottom: '46px', left: '10px', borderBottom: `2px solid ${theme.primary}50`, borderLeft: `2px solid ${theme.primary}50` },
                  { bottom: '46px', right: '10px', borderBottom: `2px solid ${theme.primary}50`, borderRight: `2px solid ${theme.primary}50` },
                ].map((s, i) => (
                  <div key={i} style={{ position: 'absolute', width: '18px', height: '18px', zIndex: 25, ...s }} />
                ))}
              </div>
            </div>
          ) : (
            <div ref={previewContainerRef} className="w-full max-w-[1200px] flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-[var(--color-border)] flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
                  <Sparkles className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">Select a character to create a showcase card</p>
                <p className="text-xs mt-2 text-[var(--color-text-muted)]/60">Configure stats, equipment, skills, and export as image</p>
              </div>
            </div>
          )}
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
          currentPieceName={currentEquipPickerState.state.pieceName}
          onSelect={(pieceName, setName) => { currentEquipPickerState.setter({ ...currentEquipPickerState.state, pieceName, setName }); }} />
      )}
    </div>
  );
}
