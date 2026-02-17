import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Swords, Shield, Heart, Star } from 'lucide-react';
import { CHARACTERS } from '../lib/data';
import { ELEMENT_COLORS, RARITY_COLORS } from '../types/game';
import { CHARACTER_BANNERS, CHARACTER_ICONS } from '@/lib/assets';

export default function CharacterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const char = CHARACTERS.find(c => c.Slug === slug);

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Character not found</p>
        <Link to="/characters" className="text-[#FFE500] text-sm mt-2 inline-block">Back to Characters</Link>
      </div>
    );
  }

  const statBar = (label: string, value: number, max: number, color: string) => (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-xs w-16">{label}</span>
      <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-white text-xs w-12 text-right">{value}</span>
    </div>
  );

  return (
    <div>
      <Link to="/characters" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 no-underline">
        <ArrowLeft size={16} /> Back to Characters
      </Link>

      {/* Banner Image */}
      {CHARACTER_BANNERS[char.Name] && (
        <div className="mb-6 rounded-xl overflow-hidden border border-[#222]">
          <img
            src={CHARACTER_BANNERS[char.Name]}
            alt={`${char.Name} banner`}
            loading="lazy"
            className="w-full h-48 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Character portrait area */}
        <div className="lg:col-span-1">
          <div
            className="aspect-[3/4] rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${ELEMENT_COLORS[char.Element]}30, #111)` }}
          >
            {CHARACTER_ICONS[char.Name] ? (
              <img
                src={CHARACTER_ICONS[char.Name]}
                alt={char.Name}
                loading="lazy"
                className="w-48 h-48 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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
              <div className="flex items-center gap-2">
                {CHARACTER_ICONS[char.Name] && (
                  <img
                    src={CHARACTER_ICONS[char.Name]}
                    alt={char.Name}
                    loading="lazy"
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <h1 className="text-2xl font-bold text-white">{char.Name}</h1>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: ELEMENT_COLORS[char.Element], borderColor: ELEMENT_COLORS[char.Element] }}>
                  {char.Element}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-600 text-gray-300">{char.Role}</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-600 text-gray-300">{char.WeaponType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Stats and details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-2">Overview</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{char.Description}</p>
          </div>

          {/* Base Stats */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Base Stats (Lv. 1)</h2>
            <div className="space-y-3">
              {statBar('HP', char.BaseHP, 1500, '#27AE60')}
              {statBar('ATK', char.BaseATK, 400, '#FF6B35')}
              {statBar('DEF', char.BaseDEF, 250, '#00BFFF')}
            </div>
          </div>

          {/* Max Stats */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h2 className="text-lg font-bold text-white mb-4">Max Stats (Lv. 90)</h2>
            <div className="space-y-3">
              {statBar('HP', char.MaxHP, 11000, '#27AE60')}
              {statBar('ATK', char.MaxATK, 2600, '#FF6B35')}
              {statBar('DEF', char.MaxDEF, 1500, '#00BFFF')}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
              <Heart size={20} className="mx-auto mb-2 text-green-400" />
              <p className="text-white font-bold">{char.MaxHP}</p>
              <p className="text-gray-500 text-xs">Max HP</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
              <Swords size={20} className="mx-auto mb-2 text-orange-400" />
              <p className="text-white font-bold">{char.MaxATK}</p>
              <p className="text-gray-500 text-xs">Max ATK</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
              <Shield size={20} className="mx-auto mb-2 text-blue-400" />
              <p className="text-white font-bold">{char.MaxDEF}</p>
              <p className="text-gray-500 text-xs">Max DEF</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
