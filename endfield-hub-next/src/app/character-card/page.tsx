'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, STAT_ICONS, EQUIPMENT_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, Role, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Star, Sparkles, Share2, ChevronDown, Sword, Shield, Zap, Heart, Crosshair, Flame } from 'lucide-react';
import html2canvas from 'html2canvas';
import RIOSHeader from '@/components/ui/RIOSHeader';

// ──────────── Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; gradient: string; accent: string }> = {
  Physical: { primary: '#CCCCCC', bg: '#0f1014', gradient: 'linear-gradient(135deg, #0f1014 0%, #1a1a22 50%, #0f1014 100%)', accent: '#888899' },
  Heat: { primary: '#FF6B35', bg: '#120d08', gradient: 'linear-gradient(135deg, #120d08 0%, #1f150a 50%, #120d08 100%)', accent: '#CC5522' },
  Cryo: { primary: '#00BFFF', bg: '#080e14', gradient: 'linear-gradient(135deg, #080e14 0%, #0c1828 50%, #080e14 100%)', accent: '#0088CC' },
  Electric: { primary: '#C084FC', bg: '#100a18', gradient: 'linear-gradient(135deg, #100a18 0%, #1a1028 50%, #100a18 100%)', accent: '#9060CC' },
  Nature: { primary: '#34D399', bg: '#081410', gradient: 'linear-gradient(135deg, #081410 0%, #0c1f18 50%, #081410 100%)', accent: '#22AA77' },
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
  // Base combat stats derived from attribute points
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
          <h3 className="text-white font-bold text-sm">Select Operator</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search operators..."
              className="w-full pl-9 pr-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([6, 5, 4] as number[]).map(r => (
              <button key={r} onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${rarityFilter === r ? '' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                style={rarityFilter === r ? { borderColor: RARITY_COLORS[r], color: RARITY_COLORS[r], backgroundColor: RARITY_COLORS[r] + '15' } : undefined}
              >{'★'.repeat(r)}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'] as Element[]).map(el => (
              <button key={el} onClick={() => setElementFilter(elementFilter === el ? null : el)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${elementFilter === el ? '' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                style={elementFilter === el ? { borderColor: ELEMENT_COLORS[el], color: ELEMENT_COLORS[el], backgroundColor: ELEMENT_COLORS[el] + '15' } : undefined}
              >{el}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Guard', 'Assault', 'Defender', 'Vanguard', 'Supporter', 'Caster'] as Role[]).map(r => (
              <button key={r} onClick={() => setRoleFilter(roleFilter === r ? null : r)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${roleFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
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
                  <span className="text-[10px] text-white mt-1 text-center leading-tight truncate w-full">{c.Name}</span>
                  <span className="text-[9px] mt-0.5" style={{ color: ELEMENT_COLORS[c.Element] }}>{c.Element}</span>
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
          <h3 className="text-white font-bold text-sm">Select {weaponType}</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          {compatible.map(w => {
            const icon = WEAPON_ICONS[w.Name];
            const isSelected = w.Name === currentName;
            return (
              <button key={w.Name} onClick={() => { onSelect(w); onClose(); }}
                className={`w-full flex items-center gap-3 p-2 border transition-colors ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
              >
                <div className="w-10 h-10 bg-[#0A0A0A] flex-shrink-0 relative">
                  {icon && <Image src={icon} alt={w.Name} fill className="object-contain p-0.5" sizes="40px" unoptimized />}
                </div>
                <div className="text-left">
                  <div className="text-sm text-white">{w.Name}</div>
                  <div className="text-xs flex items-center gap-0.5">
                    {Array.from({ length: w.Rarity }).map((_, i) => (
                      <Star key={i} size={8} className="fill-current" style={{ color: RARITY_COLORS[w.Rarity] || '#888' }} />
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
          <h3 className="text-white font-bold text-sm">Select {slot} Equipment</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          <button onClick={() => { onSelect(''); onClose(); }}
            className={`w-full flex items-center gap-3 p-2 border transition-colors ${!currentSet ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
          >
            <div className="w-10 h-10 bg-[#0A0A0A] flex-shrink-0 flex items-center justify-center">
              <X size={16} className="text-[var(--color-text-tertiary)]" />
            </div>
            <span className="text-sm text-[var(--color-text-tertiary)]">None</span>
          </button>
          {EQUIPMENT_SETS.map(eq => {
            const icon = EQUIPMENT_ICONS[eq.name];
            const isSelected = eq.name === currentSet;
            return (
              <button key={eq.name} onClick={() => { onSelect(eq.name); onClose(); }}
                className={`w-full flex items-center gap-3 p-2 border transition-colors ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
              >
                <div className="w-10 h-10 bg-[#0A0A0A] flex-shrink-0 relative">
                  {icon && <Image src={icon} alt={eq.name} fill className="object-contain p-0.5" sizes="40px" unoptimized />}
                </div>
                <div className="text-left">
                  <div className="text-sm text-white">{eq.name}</div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">{eq.tier}</div>
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

const inputClass = "w-full px-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]";
const sectionClass = "bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-3";

export default function CharacterCardPage() {
  // Character
  const [selectedCharName, setSelectedCharName] = useState('');
  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const [level, setLevel] = useState(80);
  const [potential, setPotential] = useState(0);
  const [affinity, setAffinity] = useState(0);

  // Weapon
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);
  const [weaponLevel, setWeaponLevel] = useState(80);

  // User Info
  const [showcaseName, setShowcaseName] = useState('');
  const [username, setUsername] = useState('');
  const [userCode, setUserCode] = useState('');
  const [server, setServer] = useState('');

  // Skills
  const [skillLevels, setSkillLevels] = useState({ basic: 1, normal: 1, combo: 1, ultimate: 1 });

  // Equipment
  const defaultEquip: EquipmentSlotState = { setName: '', artifice: 0, substat1: '', substat2: '', substat3: '' };
  const [equipBody, setEquipBody] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipHand, setEquipHand] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipEdc1, setEquipEdc1] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipEdc2, setEquipEdc2] = useState<EquipmentSlotState>({ ...defaultEquip });
  const [equipPickerSlot, setEquipPickerSlot] = useState<string | null>(null);

  // Theme
  const [colorTheme, setColorTheme] = useState('auto');

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find(c => c.Name === selectedCharName) || null;
  const weapon = WEAPONS.find(w => w.Name === selectedWeaponName) || null;
  const effectiveTheme = colorTheme === 'auto' && character ? character.Element : colorTheme;
  const theme = THEME_COLORS[effectiveTheme] || THEME_COLORS.Physical;

  const splashUrl = character ? CHARACTER_SPLASH[character.Name] : null;
  const iconUrl = character ? CHARACTER_ICONS[character.Name] : null;
  const roleIconUrl = character ? PROFESSION_ICONS[character.Role] : null;
  const weaponIconUrl = weapon ? WEAPON_ICONS[weapon.Name] : null;

  const stats = character ? computeStats(character, level, potential) : null;

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

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* ═══════ LEFT: Controls ═══════ */}
        <div className="space-y-3 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2">

          {/* Showcase Name */}
          <div className={sectionClass}>
            <label className="block text-xs font-bold text-[var(--color-text-secondary)]">Showcase Name</label>
            <input type="text" value={showcaseName} onChange={e => setShowcaseName(e.target.value)}
              placeholder="Enter showcase name" className={inputClass} />
          </div>

          {/* User Info */}
          <div className={sectionClass}>
            <h3 className="text-xs font-bold text-white">User Information</h3>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">User Code</label>
              <input type="text" value={userCode} onChange={e => setUserCode(e.target.value)}
                placeholder="Enter your in-game user ID" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Server</label>
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
            <h3 className="text-xs font-bold text-white">Character</h3>
            <button onClick={() => setCharPickerOpen(true)}
              className="w-full flex items-center gap-3 p-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
            >
              {character ? (
                <>
                  <div className="w-12 h-12 bg-[#0A0A0A] relative flex-shrink-0">
                    {iconUrl && <Image src={iconUrl} alt={character.Name} fill className="object-cover" sizes="48px" unoptimized />}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: character.Rarity }).map((_, i) => (
                        <Star key={i} size={10} className="fill-current" style={{ color: RARITY_COLORS[character.Rarity] }} />
                      ))}
                    </div>
                    <div className="text-sm text-white font-semibold">{character.Name}</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)]">Click to change</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--color-text-tertiary)] py-2">Click to select a character...</div>
              )}
              <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
            </button>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Character Level</label>
                <select value={level} onChange={e => setLevel(Number(e.target.value))} className={inputClass}>
                  {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                    <option key={lv} value={lv}>Lv. {lv}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Potential (Dupes)</label>
                <select value={potential} onChange={e => setPotential(Number(e.target.value))} className={inputClass}>
                  {[0, 1, 2, 3, 4, 5, 6].map(p => (
                    <option key={p} value={p}>P{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Affinity Lv.{affinity}</label>
              <input type="range" min={0} max={10} value={affinity} onChange={e => setAffinity(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]" />
            </div>
          </div>

          {/* Weapon */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-xs font-bold text-white">Weapon</h3>
              <button onClick={() => setWeaponPickerOpen(true)}
                className="w-full flex items-center gap-3 p-2 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
              >
                {weapon ? (
                  <>
                    <div className="w-10 h-10 bg-[#0A0A0A] relative flex-shrink-0">
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
                  <div className="text-sm text-[var(--color-text-tertiary)] py-1">Click to select weapon...</div>
                )}
                <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
              </button>
              {weapon && (
                <div>
                  <label className="block text-[10px] font-bold mb-1 text-[var(--color-text-tertiary)]">Weapon Level</label>
                  <select value={weaponLevel} onChange={e => setWeaponLevel(Number(e.target.value))} className={inputClass}>
                    {Array.from({ length: 80 }, (_, i) => 80 - i).map(lv => (
                      <option key={lv} value={lv}>Lv. {lv}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Equipment */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-xs font-bold text-white">Equipment</h3>
              {equipSlots.map(({ label, state, setter }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">{label}</span>
                  </div>
                  <button onClick={() => setEquipPickerSlot(label)}
                    className="w-full flex items-center gap-2 p-1.5 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-left"
                  >
                    {state.setName ? (
                      <>
                        <div className="w-8 h-8 bg-[#0A0A0A] relative flex-shrink-0">
                          {EQUIPMENT_ICONS[state.setName] && (
                            <Image src={EQUIPMENT_ICONS[state.setName]} alt={state.setName} fill className="object-contain p-0.5" sizes="32px" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{state.setName} {SLOT_SUFFIXES[label] || ''}</div>
                          <div className="text-[9px] text-[var(--color-text-tertiary)]">Click to change</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--color-text-tertiary)] py-1">Select {label.toLowerCase()} equipment...</span>
                    )}
                  </button>
                  {state.setName && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-[var(--color-text-tertiary)] w-12">Artifice</span>
                      {[0, 1, 2, 3].map(a => (
                        <button key={a} onClick={() => setter({ ...state, artifice: a })}
                          className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${state.artifice === a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}
                        >+{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skill Levels */}
          {character && (
            <div className={sectionClass}>
              <h3 className="text-xs font-bold text-white">Skill Levels</h3>
              {SKILL_TYPES.map(skill => (
                <div key={skill.key}>
                  <label className="flex items-center justify-between text-[10px] font-bold text-[var(--color-text-tertiary)] mb-1">
                    <span>{skill.label}</span>
                    <span className="text-[var(--color-accent)]">Lv. {skillLevels[skill.key as keyof typeof skillLevels]}</span>
                  </label>
                  <input type="range" min={1} max={12}
                    value={skillLevels[skill.key as keyof typeof skillLevels]}
                    onChange={e => setSkillLevels(prev => ({ ...prev, [skill.key]: Number(e.target.value) }))}
                    className="w-full accent-[var(--color-accent)]" />
                </div>
              ))}
            </div>
          )}

          {/* Color Theme */}
          <div className={sectionClass}>
            <h3 className="text-xs font-bold text-white">Color Theme</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setColorTheme('auto')}
                className={`px-2.5 py-1.5 text-xs font-bold border transition-colors ${colorTheme === 'auto' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}
              >Auto</button>
              {Object.entries(THEME_COLORS).map(([name, t]) => (
                <button key={name} onClick={() => setColorTheme(name)}
                  className={`px-2.5 py-1.5 text-xs font-bold border transition-colors ${colorTheme === name ? '' : 'border-[var(--color-border)]'}`}
                  style={colorTheme === name ? { borderColor: t.primary, color: t.primary, backgroundColor: t.primary + '15' } : { color: t.primary + '99' }}
                >{name}</button>
              ))}
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
                className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center justify-center gap-2"
              >Copy to Clipboard</button>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} disabled={!character}
                  className="py-2 px-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs hover:border-[var(--color-accent)] disabled:opacity-50 flex items-center gap-2"
                ><Share2 size={14} /> Share</button>
                {showShareMenu && character && (
                  <div className="absolute right-0 bottom-full mb-2 w-44 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl shadow-xl z-50">
                    <button onClick={shareToTwitter} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">Post on X</button>
                    <button onClick={shareToReddit} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">Post on Reddit</button>
                    <button onClick={copyToClipboard} className="w-full px-4 py-2.5 text-left text-xs hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">Copy for Discord</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ RIGHT: Card Preview ═══════ */}
        <div className="lg:sticky lg:top-20">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <h2 className="text-xs font-bold text-white mb-3">Card Preview</h2>

            {character && stats ? (
              <div
                ref={cardRef}
                className="relative overflow-hidden mx-auto"
                style={{
                  background: theme.gradient,
                  aspectRatio: '3 / 4',
                  maxWidth: '560px',
                }}
              >
                {/* ── Background splash ── */}
                <div className="absolute inset-0">
                  {splashUrl ? (
                    <Image src={splashUrl} alt={character.Name} fill className="object-cover object-top opacity-50" sizes="600px" unoptimized />
                  ) : iconUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src={iconUrl} alt={character.Name} width={300} height={300} className="opacity-25" unoptimized />
                    </div>
                  ) : null}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme.bg}40 0%, ${theme.bg}90 55%, ${theme.bg}ff 80%)` }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${theme.bg}cc 0%, transparent 40%)` }} />
                </div>

                {/* ── Top accent line ── */}
                <div className="absolute top-0 left-0 right-0 h-[3px] z-20" style={{ backgroundColor: theme.primary }} />

                {/* ── Top-left: Name + Stars ── */}
                <div className="absolute top-[3%] left-[4%] z-10">
                  {showcaseName && (
                    <div className="text-[9px] uppercase tracking-[0.25em] mb-0.5 opacity-60" style={{ color: theme.primary }}>{showcaseName}</div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{character.Name}</h2>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: character.Rarity }).map((_, i) => (
                      <Star key={i} size={12} className="fill-current" style={{ color: theme.primary }} />
                    ))}
                  </div>
                  {/* Element + Role badges */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-1 px-2 py-0.5" style={{ backgroundColor: ELEMENT_COLORS[character.Element] + '30', border: `1px solid ${ELEMENT_COLORS[character.Element]}60` }}>
                      <span className="text-[9px] font-bold" style={{ color: ELEMENT_COLORS[character.Element] }}>{character.Element}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white/10 border border-white/20">
                      {roleIconUrl && <div className="relative w-3 h-3"><Image src={roleIconUrl} alt={character.Role} fill className="object-contain" sizes="12px" unoptimized /></div>}
                      <span className="text-[9px] font-bold text-white">{character.Role}</span>
                    </div>
                  </div>
                </div>

                {/* ── Top-right: Level badge ── */}
                <div className="absolute top-[3%] right-[4%] z-10 text-right">
                  <div className="relative inline-block">
                    <div className="text-3xl sm:text-4xl font-black text-white leading-none">{level}</div>
                    <div className="text-[8px] uppercase tracking-wider text-white/50 mt-0.5">LEVEL</div>
                  </div>
                </div>

                {/* ── Middle: Skill icons row ── */}
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
                  {SKILL_TYPES.map(skill => {
                    const Icon = skill.icon;
                    const lv = skillLevels[skill.key as keyof typeof skillLevels];
                    return (
                      <div key={skill.key} className="flex flex-col items-center">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2"
                          style={{ borderColor: theme.primary + '80', backgroundColor: theme.bg + 'cc' }}>
                          <Icon size={16} className="text-white/80" />
                        </div>
                        {/* Skill node dots */}
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 12 }).map((_, idx) => (
                            <div key={idx} className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: idx < lv ? theme.primary : 'rgba(255,255,255,0.15)' }} />
                          ))}
                        </div>
                        <div className="text-[8px] text-white/60 mt-0.5">Lv.{lv}</div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Right: Stats panel ── */}
                <div className="absolute right-[3%] top-[3%] z-10 mt-16">
                  <div className="p-2 min-w-[130px]" style={{ backgroundColor: theme.bg + 'dd', border: `1px solid ${theme.primary}20` }}>
                    {/* Combat stats */}
                    {[
                      { label: 'HP', value: stats.HP.toLocaleString(), icon: Heart },
                      { label: 'ATK', value: stats.ATK.toLocaleString(), icon: Sword },
                      { label: 'DEF', value: stats.DEF.toLocaleString(), icon: Shield },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1">
                          <s.icon size={10} style={{ color: theme.primary }} />
                          <span className="text-[9px] text-white/50">{s.label}</span>
                        </div>
                        <span className="text-[10px] text-white font-bold">{s.value}</span>
                      </div>
                    ))}
                    <div className="h-[1px] my-1" style={{ backgroundColor: theme.primary + '20' }} />
                    {/* Attribute stats */}
                    {[
                      { label: 'STR', value: stats.STR, icon: STAT_ICONS.Strength },
                      { label: 'AGI', value: stats.AGI, icon: STAT_ICONS.Agility },
                      { label: 'INT', value: stats.INT, icon: STAT_ICONS.Intellect },
                      { label: 'WILL', value: stats.WILL, icon: STAT_ICONS.Will },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center gap-1">
                          <div className="relative w-3 h-3">
                            <Image src={s.icon} alt={s.label} fill className="object-contain" sizes="12px" unoptimized />
                          </div>
                          <span className="text-[9px] text-white/50">{s.label}</span>
                        </div>
                        <span className="text-[10px] text-white font-bold">{s.value}</span>
                      </div>
                    ))}
                    <div className="h-[1px] my-1" style={{ backgroundColor: theme.primary + '20' }} />
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-[9px] font-bold" style={{ color: theme.primary }}>CRIT Rate</span>
                      <span className="text-[10px] text-white font-bold">{stats['CRIT Rate']}%</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-[9px] font-bold" style={{ color: theme.primary }}>CRIT DMG</span>
                      <span className="text-[10px] text-white font-bold">{stats['CRIT DMG']}%</span>
                    </div>
                  </div>
                </div>

                {/* ── Bottom: Equipment + Weapon strip ── */}
                <div className="absolute bottom-[6%] left-[3%] right-[3%] z-10">
                  {/* Equipment row */}
                  {equippedSets.length > 0 && (
                    <div className="flex gap-1.5 mb-2">
                      {equippedSets.map((eq, idx) => {
                        const eqIcon = EQUIPMENT_ICONS[eq.setName];
                        const slotLabel = equipSlots[
                          [equipBody, equipHand, equipEdc1, equipEdc2].indexOf(eq)
                        ]?.label || '';
                        return (
                          <div key={idx} className="flex items-center gap-1.5 px-1.5 py-1" style={{ backgroundColor: theme.bg + 'cc', border: `1px solid ${theme.primary}20` }}>
                            <div className="w-7 h-7 relative flex-shrink-0">
                              {eqIcon && <Image src={eqIcon} alt={eq.setName} fill className="object-contain" sizes="28px" unoptimized />}
                            </div>
                            <div>
                              <div className="text-[8px] text-white font-bold leading-tight">{eq.setName}</div>
                              <div className="text-[7px] text-white/40">{SLOT_SUFFIXES[slotLabel] || slotLabel} +{eq.artifice}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Weapon display */}
                  {weapon && (
                    <div className="flex items-center gap-2 p-1.5" style={{ backgroundColor: theme.bg + 'cc', border: `1px solid ${theme.primary}20` }}>
                      {weaponIconUrl && (
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image src={weaponIconUrl} alt={weapon.Name} fill className="object-contain p-0.5" sizes="40px" unoptimized />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-white font-bold">{weapon.Name}</div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: weapon.Rarity }).map((_, i) => (
                            <Star key={i} size={7} className="fill-current" style={{ color: RARITY_COLORS[weapon.Rarity] || '#888' }} />
                          ))}
                          <span className="text-[8px] text-white/40 ml-1">Lv.{weaponLevel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] text-white/40">{character.WeaponType}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Bottom bar: username + watermark ── */}
                <div className="absolute bottom-0 left-0 right-0 h-[22px] flex items-center justify-between px-[3%] z-20" style={{ backgroundColor: theme.bg + 'ee' }}>
                  <div className="flex items-center gap-2">
                    {username && <span className="text-[9px] text-white/60 font-medium">{username}</span>}
                    {userCode && <span className="text-[8px] text-white/30">#{userCode}</span>}
                    {server && <span className="text-[8px] text-white/20">{server}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                      <span className="text-[6px] font-black text-black">ZS</span>
                    </div>
                    <span className="text-[8px] text-white/30 tracking-wide">zerosanity.app</span>
                  </div>
                </div>

                {/* ── Decorative elements ── */}
                <div className="absolute top-2 right-2 w-6 h-6 z-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-full h-[1px]" style={{ backgroundColor: theme.primary + '30' }} />
                  <div className="absolute top-0 right-0 h-full w-[1px]" style={{ backgroundColor: theme.primary + '30' }} />
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-[var(--color-text-tertiary)]" style={{ aspectRatio: '3 / 4', maxWidth: '560px', margin: '0 auto' }}>
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a character to create a showcase card</p>
                <p className="text-xs mt-2 text-[var(--color-text-tertiary)]/60">Configure stats, equipment, skills, and export as image</p>
              </div>
            )}
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
    </div>
  );
}
