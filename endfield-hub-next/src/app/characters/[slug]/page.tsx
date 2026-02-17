'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Swords, Shield, Heart, Star } from 'lucide-react';
import { CHARACTERS } from '@/lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '@/types/game';
import { CHARACTER_BANNERS, CHARACTER_ICONS } from '@/lib/assets';

export default function CharacterDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const char = CHARACTERS.find(c => c.Slug === slug);

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Character not found</p>
        <Link href="/characters" className="text-[#FFE500] text-sm mt-2 inline-block">Back to Characters</Link>
      </div>
    );
  }

  const statBar = (label: string, value: number, max: number, color: string) => (
    <div className="flex items-center gap-3">
      <span className="text-[var(--color-text-secondary)] text-xs w-16">{label}</span>
      <div className="flex-1 h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-xs w-12 text-right">{value}</span>
    </div>
  );

  return (
    <div>
      <Link href="/characters" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 no-underline">
        <ArrowLeft size={16} /> Back to Characters
      </Link>

      {CHARACTER_BANNERS[char.Name] && (
        <div className="mb-6 clip-corner-tl overflow-hidden border border-[var(--color-border)]">
          <Image
            src={CHARACTER_BANNERS[char.Name]}
            alt={`${char.Name} banner`}
            width={900}
            height={192}
            className="w-full h-48 object-cover"
            priority
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div
            className="aspect-[3/4] clip-corner-tl flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${ELEMENT_COLORS[char.Element]}30, var(--color-surface))` }}
          >
            {CHARACTER_ICONS[char.Name] ? (
              <Image
                src={CHARACTER_ICONS[char.Name]}
                alt={char.Name}
                width={192}
                height={192}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <span className="text-8xl font-bold text-white/10">{char.Name[0]}</span>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: char.Rarity }, (_, i) => (
                  <Star key={i} size={14} fill={RARITY_COLORS[char.Rarity]} color={RARITY_COLORS[char.Rarity]} />
                ))}
              </div>
              <h1 className="text-2xl font-bold text-white">{char.Name}</h1>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 border" style={{ color: ELEMENT_COLORS[char.Element], borderColor: ELEMENT_COLORS[char.Element] }}>
                  {char.Element}
                </span>
                <span className="text-xs px-2 py-0.5 border border-gray-600 text-gray-300">{char.Role}</span>
                <span className="text-xs px-2 py-0.5 border border-gray-600 text-gray-300">{char.WeaponType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h2 className="text-lg font-bold text-white mb-2">Overview</h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{char.Description}</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Base Stats (Lv. 1)</h2>
            <div className="space-y-3">
              {statBar('HP', char.BaseHP, 1500, '#27AE60')}
              {statBar('ATK', char.BaseATK, 400, '#FF6B35')}
              {statBar('DEF', char.BaseDEF, 250, '#00BFFF')}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Max Stats (Lv. 90)</h2>
            <div className="space-y-3">
              {statBar('HP', char.MaxHP, 11000, '#27AE60')}
              {statBar('ATK', char.MaxATK, 2600, '#FF6B35')}
              {statBar('DEF', char.MaxDEF, 1500, '#00BFFF')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
              <Heart size={20} className="mx-auto mb-2 text-green-400" />
              <p className="text-white font-bold">{char.MaxHP}</p>
              <p className="text-[var(--color-text-tertiary)] text-xs">Max HP</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
              <Swords size={20} className="mx-auto mb-2 text-orange-400" />
              <p className="text-white font-bold">{char.MaxATK}</p>
              <p className="text-[var(--color-text-tertiary)] text-xs">Max ATK</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4 text-center">
              <Shield size={20} className="mx-auto mb-2 text-blue-400" />
              <p className="text-white font-bold">{char.MaxDEF}</p>
              <p className="text-[var(--color-text-tertiary)] text-xs">Max DEF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
