'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { CHARACTERS, WEAPONS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH, PROFESSION_ICONS, WEAPON_ICONS, STAT_ICONS } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import type { Element, Role, WeaponType, Character, Weapon } from '@/types/game';
import { Download, Search, X, Star, Sparkles, Share2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import RIOSHeader from '@/components/ui/RIOSHeader';

// ──────────── Element Theme Colors ────────────

const THEME_COLORS: Record<string, { primary: string; bg: string; gradient: string }> = {
  Physical: { primary: '#CCCCCC', bg: '#1a1a1f', gradient: 'linear-gradient(135deg, #1a1a1f 0%, #2a2a30 50%, #1a1a1f 100%)' },
  Heat: { primary: '#FF6B35', bg: '#1f1510', gradient: 'linear-gradient(135deg, #1f1510 0%, #2d1a0e 50%, #1f1510 100%)' },
  Cryo: { primary: '#00BFFF', bg: '#0d1a22', gradient: 'linear-gradient(135deg, #0d1a22 0%, #0e2233 50%, #0d1a22 100%)' },
  Electric: { primary: '#C084FC', bg: '#1a0f22', gradient: 'linear-gradient(135deg, #1a0f22 0%, #241533 50%, #1a0f22 100%)' },
  Nature: { primary: '#34D399', bg: '#0d1f15', gradient: 'linear-gradient(135deg, #0d1f15 0%, #0e2d1a 50%, #0d1f15 100%)' },
  Gold: { primary: '#FFD700', bg: '#1a1708', gradient: 'linear-gradient(135deg, #1a1708 0%, #2d2510 50%, #1a1708 100%)' },
  Silver: { primary: '#C0C0C0', bg: '#151517', gradient: 'linear-gradient(135deg, #151517 0%, #1f1f22 50%, #151517 100%)' },
  Cyan: { primary: '#00B0FF', bg: '#0a1520', gradient: 'linear-gradient(135deg, #0a1520 0%, #0d2035 50%, #0a1520 100%)' },
};

// ──────────── Stat bar color computation ────────────

function statPercent(value: number, max: number = 180): number {
  return Math.min(100, (value / max) * 100);
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

  const rarities = [6, 5, 4];
  const elements: Element[] = ['Physical', 'Heat', 'Cryo', 'Electric', 'Nature'];
  const roles: Role[] = ['Guard', 'Assault', 'Defender', 'Vanguard', 'Supporter', 'Caster'];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Select Operator</h3>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] hover:text-white"><X size={18} /></button>
        </div>

        {/* Search + Filters */}
        <div className="p-4 space-y-3 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="w-full pl-9 pr-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          {/* Rarity */}
          <div className="flex flex-wrap gap-1.5">
            {rarities.map(r => (
              <button key={r} onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${rarityFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                style={rarityFilter === r ? { borderColor: RARITY_COLORS[r], color: RARITY_COLORS[r], backgroundColor: RARITY_COLORS[r] + '15' } : undefined}
              >
                {'★'.repeat(r)} {r}★
              </button>
            ))}
          </div>
          {/* Elements */}
          <div className="flex flex-wrap gap-1.5">
            {elements.map(el => (
              <button key={el} onClick={() => setElementFilter(elementFilter === el ? null : el)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${elementFilter === el ? '' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
                style={elementFilter === el ? { borderColor: ELEMENT_COLORS[el], color: ELEMENT_COLORS[el], backgroundColor: ELEMENT_COLORS[el] + '15' } : undefined}
              >
                {el}
              </button>
            ))}
          </div>
          {/* Roles */}
          <div className="flex flex-wrap gap-1.5">
            {roles.map(r => (
              <button key={r} onClick={() => setRoleFilter(roleFilter === r ? null : r)}
                className={`px-2.5 py-1 text-xs font-bold border transition-colors ${roleFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {filtered.map(c => {
              const icon = CHARACTER_ICONS[c.Name];
              const isSelected = c.Name === currentName;
              return (
                <button key={c.Name} onClick={() => { onSelect(c); onClose(); }}
                  className={`relative group flex flex-col items-center border p-1.5 transition-all ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
                >
                  <div className="relative w-full aspect-square bg-[#0A0A0A] overflow-hidden">
                    {icon && <Image src={icon} alt={c.Name} fill className="object-cover" sizes="80px" unoptimized />}
                    {/* Rarity stars bottom */}
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
          <p className="text-xs text-[var(--color-text-tertiary)] mt-3 text-center">{filtered.length} Characters</p>
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
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-1">
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
                    <div className="text-xs flex items-center gap-1">
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
    </div>
  );
}

// ──────────── Section Toggle ────────────

function SectionToggle({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 text-xs group">
      {visible ? <Eye size={14} className="text-[var(--color-accent)]" /> : <EyeOff size={14} className="text-[var(--color-text-tertiary)]" />}
      <span className={visible ? 'text-white' : 'text-[var(--color-text-tertiary)] line-through'}>{label}</span>
    </button>
  );
}

// ──────────── Main Page ────────────

export default function CharacterCardPage() {
  // Character state
  const [selectedCharName, setSelectedCharName] = useState('');
  const [charPickerOpen, setCharPickerOpen] = useState(false);

  // Weapon state
  const [selectedWeaponName, setSelectedWeaponName] = useState('');
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false);

  // Customization
  const [showcaseName, setShowcaseName] = useState('');
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState(80);
  const [colorTheme, setColorTheme] = useState('auto'); // 'auto' = match element

  // Card section visibility
  const [showStats, setShowStats] = useState(true);
  const [showWeapon, setShowWeapon] = useState(true);
  const [showElement, setShowElement] = useState(true);
  const [showLevel, setShowLevel] = useState(true);
  const [showRole, setShowRole] = useState(true);
  const [showUsername, setShowUsername] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find(c => c.Name === selectedCharName) || null;
  const weapon = WEAPONS.find(w => w.Name === selectedWeaponName) || null;

  // Auto-select weapon type when character changes
  const effectiveTheme = colorTheme === 'auto' && character ? character.Element : colorTheme;
  const theme = THEME_COLORS[effectiveTheme] || THEME_COLORS.Cyan;

  const splashUrl = character ? CHARACTER_SPLASH[character.Name] : null;
  const iconUrl = character ? CHARACTER_ICONS[character.Name] : null;
  const roleIconUrl = character ? PROFESSION_ICONS[character.Role] : null;
  const weaponIconUrl = weapon ? WEAPON_ICONS[weapon.Name] : null;

  // Export
  const exportCard = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => { resolve(blob); setIsExporting(false); }, 'image/png');
      });
    } catch { setIsExporting(false); return null; }
  }, []);

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
    const blob = await exportCard();
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert('Card copied to clipboard!');
    } catch {
      alert('Clipboard copy not supported. Use the download button instead.');
    }
    setShowShareMenu(false);
  };

  const shareToTwitter = () => {
    const text = showcaseName
      ? `${showcaseName} - ${character?.Name} Showcase | Made with Zero Sanity`
      : `Check out my ${character?.Name} character card! Made with Zero Sanity`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToReddit = () => {
    const title = `${character?.Name} Character Showcase - Zero Sanity Toolkit`;
    window.open(`https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent('https://zerosanity.app/character-card')}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <div className="text-[var(--color-text-secondary)]">
      <RIOSHeader
        title="Operator Showcase Creator"
        category="MEDIA"
        code="RIOS-CARD-001"
        icon={<Sparkles size={28} />}
        subtitle="Create and share custom character showcase cards"
      />

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* ═══════ LEFT PANEL: Controls ═══════ */}
        <div className="space-y-4">

          {/* Showcase Name */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
            <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Showcase Name</label>
            <input
              type="text" value={showcaseName} onChange={e => setShowcaseName(e.target.value)}
              placeholder="Enter showcase name"
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {/* User Info */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white">User Information</h3>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* Character */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-3">
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
                    <div className="flex items-center gap-1">
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

            {/* Level */}
            <div>
              <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Character Level</label>
              <select value={level} onChange={e => setLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
              >
                {[80, 79, 78, 77, 76, 75, 70, 60, 50, 40, 30, 20, 10, 1].map(lv => (
                  <option key={lv} value={lv}>Lv. {lv}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weapon */}
          {character && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-3">
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
                      <div className="text-[10px] text-[var(--color-text-tertiary)]">Click to change</div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-text-tertiary)] py-1">Click to select a weapon...</div>
                )}
                <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
              </button>
            </div>
          )}

          {/* Color Theme */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white">Color Theme</h3>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setColorTheme('auto')}
                className={`px-2.5 py-1.5 text-xs font-bold border transition-colors ${colorTheme === 'auto' ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-text-secondary)]'}`}
              >
                Auto
              </button>
              {Object.entries(THEME_COLORS).map(([name, t]) => (
                <button key={name} onClick={() => setColorTheme(name)}
                  className={`px-2.5 py-1.5 text-xs font-bold border transition-colors ${colorTheme === name ? '' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
                  style={colorTheme === name ? { borderColor: t.primary, color: t.primary, backgroundColor: t.primary + '15' } : { color: t.primary + '99' }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-2">
            <h3 className="text-xs font-bold text-white mb-2">Display Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <SectionToggle label="Stats" visible={showStats} onToggle={() => setShowStats(!showStats)} />
              <SectionToggle label="Weapon" visible={showWeapon} onToggle={() => setShowWeapon(!showWeapon)} />
              <SectionToggle label="Element" visible={showElement} onToggle={() => setShowElement(!showElement)} />
              <SectionToggle label="Level" visible={showLevel} onToggle={() => setShowLevel(!showLevel)} />
              <SectionToggle label="Role" visible={showRole} onToggle={() => setShowRole(!showRole)} />
              <SectionToggle label="Username" visible={showUsername} onToggle={() => setShowUsername(!showUsername)} />
              <SectionToggle label="Watermark" visible={showWatermark} onToggle={() => setShowWatermark(!showWatermark)} />
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 space-y-2">
            <div className="flex gap-2">
              <button onClick={() => downloadCard('png')} disabled={!character || isExporting}
                className="flex-1 py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PNG'}
              </button>
              <button onClick={() => downloadCard('jpg')} disabled={!character || isExporting}
                className="py-2.5 px-4 border border-[var(--color-border)] text-white font-bold clip-corner-tl hover:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                JPG
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} disabled={!character || isExporting}
                className="flex-1 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs hover:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Copy to Clipboard
              </button>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} disabled={!character}
                  className="py-2 px-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs hover:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Share2 size={14} /> Share
                </button>
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

        {/* ═══════ RIGHT PANEL: Card Preview ═══════ */}
        <div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 sticky top-20">
            <h2 className="text-xs font-bold text-white mb-3">Card Preview</h2>

            {character ? (
              <div
                ref={cardRef}
                className="relative overflow-hidden"
                style={{
                  background: theme.gradient,
                  aspectRatio: '16 / 9',
                }}
              >
                {/* ── Background splash art ── */}
                <div className="absolute inset-0">
                  {splashUrl ? (
                    <Image src={splashUrl} alt={character.Name} fill className="object-cover object-top opacity-60" sizes="800px" unoptimized />
                  ) : iconUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image src={iconUrl} alt={character.Name} width={300} height={300} className="opacity-30" unoptimized />
                    </div>
                  ) : null}
                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${theme.bg}ee 0%, ${theme.bg}88 35%, transparent 60%)` }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${theme.bg}dd 0%, transparent 40%)` }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme.bg}99 0%, transparent 20%)` }} />
                </div>

                {/* ── Top-left: Name + Rarity ── */}
                <div className="absolute top-[6%] left-[4%] z-10">
                  {/* Showcase name */}
                  {showcaseName && (
                    <div className="text-[10px] uppercase tracking-[0.2em] mb-1 opacity-70" style={{ color: theme.primary }}>{showcaseName}</div>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">{character.Name}</h2>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {Array.from({ length: character.Rarity }).map((_, i) => (
                      <Star key={i} size={14} className="fill-current" style={{ color: theme.primary }} />
                    ))}
                  </div>
                </div>

                {/* ── Top-right: Level badge ── */}
                {showLevel && (
                  <div className="absolute top-[6%] right-[4%] z-10 text-right">
                    <div className="text-[10px] uppercase tracking-wider opacity-50 text-white">LEVEL</div>
                    <div className="text-3xl font-black text-white leading-none">{level}</div>
                  </div>
                )}

                {/* ── Left: Stats panel ── */}
                {showStats && (
                  <div className="absolute left-[4%] top-[38%] z-10 space-y-2 w-[28%]">
                    {[
                      { key: 'Strength', label: 'STR', value: character.Strength, icon: STAT_ICONS.Strength },
                      { key: 'Agility', label: 'AGI', value: character.Agility, icon: STAT_ICONS.Agility },
                      { key: 'Intellect', label: 'INT', value: character.Intellect, icon: STAT_ICONS.Intellect },
                      { key: 'Will', label: 'WILL', value: character.Will, icon: STAT_ICONS.Will },
                    ].map(stat => (
                      <div key={stat.key} className="flex items-center gap-2">
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image src={stat.icon} alt={stat.label} fill className="object-contain" sizes="20px" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-white/60 uppercase tracking-wider">{stat.label}</span>
                            <span className="text-xs font-bold text-white">{stat.value}</span>
                          </div>
                          <div className="h-1 bg-white/10 mt-0.5">
                            <div className="h-full transition-all" style={{ width: `${statPercent(stat.value)}%`, backgroundColor: theme.primary }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Bottom-left: Element + Role badges ── */}
                <div className="absolute bottom-[8%] left-[4%] z-10 flex items-center gap-2">
                  {showElement && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ backgroundColor: ELEMENT_COLORS[character.Element] + '25', border: `1px solid ${ELEMENT_COLORS[character.Element]}50` }}>
                      <span className="text-xs font-bold" style={{ color: ELEMENT_COLORS[character.Element] }}>{character.Element}</span>
                    </div>
                  )}
                  {showRole && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/20">
                      {roleIconUrl && (
                        <div className="relative w-4 h-4">
                          <Image src={roleIconUrl} alt={character.Role} fill className="object-contain" sizes="16px" unoptimized />
                        </div>
                      )}
                      <span className="text-xs font-bold text-white">{character.Role}</span>
                    </div>
                  )}
                  <div className="px-2.5 py-1 bg-white/10 border border-white/20">
                    <span className="text-xs text-white/80">{character.WeaponType}</span>
                  </div>
                </div>

                {/* ── Bottom-right: Weapon display ── */}
                {showWeapon && weapon && (
                  <div className="absolute bottom-[8%] right-[4%] z-10 flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[9px] text-white/50 uppercase tracking-wider">Weapon</div>
                      <div className="text-xs font-bold text-white">{weapon.Name}</div>
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        {Array.from({ length: weapon.Rarity }).map((_, i) => (
                          <Star key={i} size={7} className="fill-current" style={{ color: RARITY_COLORS[weapon.Rarity] || '#888' }} />
                        ))}
                      </div>
                    </div>
                    {weaponIconUrl && (
                      <div className="relative w-12 h-12 bg-black/30 border border-white/10">
                        <Image src={weaponIconUrl} alt={weapon.Name} fill className="object-contain p-1" sizes="48px" unoptimized />
                      </div>
                    )}
                  </div>
                )}

                {/* ── Top accent line ── */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: theme.primary }} />

                {/* ── Username / watermark bar ── */}
                <div className="absolute bottom-0 left-0 right-0 h-[24px] flex items-center justify-between px-[4%] z-10" style={{ backgroundColor: theme.bg + 'cc' }}>
                  {showUsername && username && (
                    <span className="text-[10px] text-white/70 font-medium">{username}</span>
                  )}
                  {!showUsername || !username ? <span /> : null}
                  {showWatermark && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                        <span className="text-[7px] font-black text-black">ZS</span>
                      </div>
                      <span className="text-[9px] text-white/40 tracking-wide">zerosanity.app</span>
                    </div>
                  )}
                </div>

                {/* ── Decorative corner lines ── */}
                <div className="absolute top-3 right-3 w-8 h-8 z-10 pointer-events-none">
                  <div className="absolute top-0 right-0 w-full h-[1px]" style={{ backgroundColor: theme.primary + '40' }} />
                  <div className="absolute top-0 right-0 h-full w-[1px]" style={{ backgroundColor: theme.primary + '40' }} />
                </div>
                <div className="absolute top-3 left-[34%] w-[1px] h-[55%] z-10 pointer-events-none" style={{ backgroundColor: theme.primary + '15' }} />
              </div>
            ) : (
              <div className="text-center py-24 text-[var(--color-text-tertiary)]" style={{ aspectRatio: '16 / 9' }}>
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a character to create a showcase card</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CharacterPickerModal open={charPickerOpen} onClose={() => setCharPickerOpen(false)} onSelect={c => { setSelectedCharName(c.Name); setSelectedWeaponName(''); }} currentName={selectedCharName} />
      {character && (
        <WeaponPickerModal open={weaponPickerOpen} onClose={() => setWeaponPickerOpen(false)} onSelect={w => setSelectedWeaponName(w.Name)} weaponType={character.WeaponType} currentName={selectedWeaponName} />
      )}

      {/* Click outside share menu */}
      {showShareMenu && <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />}
    </div>
  );
}
