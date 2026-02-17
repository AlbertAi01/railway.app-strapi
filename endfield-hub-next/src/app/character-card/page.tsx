'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CHARACTERS } from '@/lib/data';
import { CHARACTER_ICONS, CHARACTER_SPLASH } from '@/lib/assets';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import { Download, Star, Sparkles, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import RIOSHeader from '@/components/ui/RIOSHeader';

export default function CharacterCardPage() {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [customText, setCustomText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [accentColor, setAccentColor] = useState('#FFE500');
  const [isExporting, setIsExporting] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find(c => c.Name === selectedCharacter);
  const splashUrl = character ? CHARACTER_SPLASH[character.Name] : null;
  const iconUrl = character ? CHARACTER_ICONS[character.Name] : null;
  const elementColor = character ? ELEMENT_COLORS[character.Element] : '#FFE500';

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
        canvas.toBlob((blob) => {
          resolve(blob);
          setIsExporting(false);
        }, 'image/png');
      });
    } catch {
      setIsExporting(false);
      return null;
    }
  }, []);

  const downloadCard = async () => {
    const blob = await exportCard();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-${character?.Name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareToTwitter = async () => {
    const text = customText
      ? `Check out my ${character?.Name} card: "${customText}" - Made with Zero Sanity`
      : `Check out my ${character?.Name} character card! Made with Zero Sanity`;
    const url = 'https://zerosanity.app/character-card';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const shareToReddit = async () => {
    const title = `${character?.Name} Character Card - Zero Sanity Toolkit`;
    const url = 'https://zerosanity.app/character-card';
    window.open(
      `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const shareToDiscord = async () => {
    const blob = await exportCard();
    if (!blob) return;
    // Copy image to clipboard for easy Discord paste
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      alert('Card image copied to clipboard! Paste it directly in Discord (Ctrl+V).');
    } catch {
      // Fallback: download instead
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zerosanity-${character?.Name.toLowerCase().replace(/\s+/g, '-')}-card.png`;
      a.click();
      URL.revokeObjectURL(url);
      alert('Image downloaded - upload it to Discord manually.');
    }
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const blob = await exportCard();
    if (!blob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      alert('Card copied to clipboard!');
    } catch {
      alert('Clipboard copy not supported in this browser. Use the download button instead.');
    }
    setShowShareMenu(false);
  };

  const nativeShare = async () => {
    const blob = await exportCard();
    if (!blob || !navigator.share) return;
    const file = new File([blob], `${character?.Name}-card.png`, { type: 'image/png' });
    try {
      await navigator.share({
        title: `${character?.Name} - Zero Sanity`,
        text: customText || `Check out my ${character?.Name} character card!`,
        files: [file],
      });
    } catch {
      // User cancelled or not supported
    }
    setShowShareMenu(false);
  };

  return (
    <div className="text-[var(--color-text-secondary)]">
      <RIOSHeader
        title="Operator Card Generator"
        category="MEDIA"
        code="RIOS-CARD-001"
        icon={<Sparkles size={28} />}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h2 className="text-sm font-bold text-white mb-3">Card Settings</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Character</label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                >
                  <option value="">Choose a character...</option>
                  {CHARACTERS.map(char => (
                    <option key={char.Name} value={char.Name}>
                      {char.Name} ({char.Rarity}★ {char.Role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Custom Text</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="&quot;My main DPS&quot; or &quot;C6 finally!&quot;..."
                  maxLength={80}
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 cursor-pointer border border-[var(--color-border)]"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-accent)] text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Accent</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 cursor-pointer border border-[var(--color-border)]"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-2 py-2 bg-[#0A0A0A] border border-[var(--color-border)] text-xs focus:outline-none focus:border-[var(--color-accent)] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Quick color presets */}
              {character && (
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--color-text-secondary)]">Quick Themes</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setBackgroundColor('#1a1a2e'); setAccentColor(elementColor); }}
                      className="flex-1 py-2 text-xs clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                      style={{ color: elementColor }}
                    >
                      Element
                    </button>
                    <button
                      onClick={() => { setBackgroundColor('#0d0d0d'); setAccentColor(RARITY_COLORS[character.Rarity]); }}
                      className="flex-1 py-2 text-xs clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                      style={{ color: RARITY_COLORS[character.Rarity] }}
                    >
                      Rarity
                    </button>
                    <button
                      onClick={() => { setBackgroundColor('#0a1628'); setAccentColor('#00BFFF'); }}
                      className="flex-1 py-2 text-xs clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-[#00BFFF]"
                    >
                      Frost
                    </button>
                    <button
                      onClick={() => { setBackgroundColor('#1a0a0a'); setAccentColor('#FF6B35'); }}
                      className="flex-1 py-2 text-xs clip-corner-tl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-[#FF6B35]"
                    >
                      Ember
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={downloadCard}
                  disabled={!character || isExporting}
                  className="flex-1 py-2.5 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : 'Download PNG'}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    disabled={!character || isExporting}
                    className="py-2.5 px-4 bg-[var(--color-border)] text-white font-bold clip-corner-tl hover:bg-[var(--color-border)]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  {showShareMenu && character && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl shadow-xl z-50 overflow-hidden">
                      <button onClick={shareToTwitter} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Post on X
                      </button>
                      <button onClick={shareToReddit} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                        Post on Reddit
                      </button>
                      <button onClick={shareToDiscord} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        Copy for Discord
                      </button>
                      <button onClick={copyToClipboard} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/></svg>
                        Copy to Clipboard
                      </button>
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button onClick={nativeShare} className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-3 text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
                          <Share2 className="w-4 h-4" />
                          More Options...
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Character info sidebar */}
          {character && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Character Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Role</span>
                  <span className="text-white font-semibold">{character.Role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Element</span>
                  <span className="font-semibold" style={{ color: elementColor }}>{character.Element}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Weapon</span>
                  <span className="text-white font-semibold">{character.WeaponType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Rarity</span>
                  <span className="font-semibold" style={{ color: RARITY_COLORS[character.Rarity] }}>{'★'.repeat(character.Rarity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Strength</span>
                  <span className="text-white font-semibold">{character.Strength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Agility</span>
                  <span className="text-white font-semibold">{character.Agility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Intellect</span>
                  <span className="text-white font-semibold">{character.Intellect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Will</span>
                  <span className="text-white font-semibold">{character.Will}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Preview */}
        <div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h2 className="text-sm font-bold text-white mb-4">Card Preview</h2>

            {character ? (
              <div
                ref={cardRef}
                className="clip-corner-tl overflow-hidden shadow-2xl"
                style={{ backgroundColor }}
              >
                {/* Card header band */}
                <div className="h-1.5" style={{ backgroundColor: accentColor }} />

                <div className="p-6">
                  {/* Name + Stars + Role badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        {character.Name}
                      </h2>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: character.Rarity }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" style={{ color: accentColor }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className="px-3 py-1 font-bold text-xs text-black"
                        style={{ backgroundColor: accentColor }}
                      >
                        {character.Role}
                      </div>
                      <div
                        className="px-3 py-1 text-xs font-semibold"
                        style={{ color: elementColor, backgroundColor: `${elementColor}20` }}
                      >
                        {character.Element}
                      </div>
                    </div>
                  </div>

                  {/* Character portrait */}
                  <div
                    className="w-full aspect-[4/3] clip-corner-tl mb-4 overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${backgroundColor} 0%, ${accentColor}15 50%, ${elementColor}20 100%)`
                    }}
                  >
                    {splashUrl ? (
                      <Image
                        src={splashUrl}
                        alt={character.Name}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                      />
                    ) : iconUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                          src={iconUrl}
                          alt={character.Name}
                          width={192}
                          height={192}
                          className="w-48 h-48 object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl font-bold text-white/10">{character.Name[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-3 clip-corner-tl text-center" style={{ backgroundColor: `${accentColor}12` }}>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider">STR</div>
                      <div className="text-lg font-bold text-white">{character.Strength}</div>
                    </div>
                    <div className="p-3 clip-corner-tl text-center" style={{ backgroundColor: `${accentColor}12` }}>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider">AGI</div>
                      <div className="text-lg font-bold text-white">{character.Agility}</div>
                    </div>
                    <div className="p-3 clip-corner-tl text-center" style={{ backgroundColor: `${accentColor}12` }}>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider">INT</div>
                      <div className="text-lg font-bold text-white">{character.Intellect}</div>
                    </div>
                    <div className="p-3 clip-corner-tl text-center" style={{ backgroundColor: `${accentColor}12` }}>
                      <div className="text-[10px] text-white/50 uppercase tracking-wider">WILL</div>
                      <div className="text-lg font-bold text-white">{character.Will}</div>
                    </div>
                  </div>

                  {/* Weapon type */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-white/40">Weapon:</span>
                    <span className="text-xs font-semibold text-white/70">{character.WeaponType}</span>
                  </div>

                  {/* Custom text */}
                  {customText && (
                    <div
                      className="p-3 clip-corner-tl mb-4"
                      style={{
                        backgroundColor: `${accentColor}10`,
                        borderLeft: `3px solid ${accentColor}`
                      }}
                    >
                      <p className="text-white/90 text-sm italic">&ldquo;{customText}&rdquo;</p>
                    </div>
                  )}

                  {/* Watermark footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                        <span className="text-[8px] font-black text-black">ZS</span>
                      </div>
                      <span className="text-white/40 text-[11px] font-medium tracking-wide">zerosanity.app</span>
                    </div>
                    <span className="text-white/30 text-[10px]">Arknights: Endfield Toolkit</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-[var(--color-text-tertiary)]">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a character to create a card</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
      )}
    </div>
  );
}
