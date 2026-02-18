'use client';

import { Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import RIOSHeader from '@/components/ui/RIOSHeader';

const MAPS = [
  {
    id: 'valley-iv',
    name: 'Valley IV',
    desc: 'The starting region with 6 zones: The Hub, Valley Pass, Power Plateau, Origin Lodespring, Originium Science Park, and Aburrey Quarry.',
    pois: '2,200+ points of interest',
    zones: '6 zones',
    thumb: 'https://endfieldtools.dev/assets/images/endfield/levelmap/levelmapgrids/map01lv001/map01_lv001_4_3.png',
  },
  {
    id: 'wuling',
    name: 'Wuling',
    desc: 'The second major region with Wuling City and Jingyu Valley.',
    pois: '1,600+ points of interest',
    zones: '2 zones',
    thumb: 'https://endfieldtools.dev/assets/images/endfield/levelmap/levelmapgrids/map02lv002/map02_lv002_5_5.png',
  },
];

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-5xl mx-auto">
        <RIOSHeader title="Tactical Map Interface" category="NAVIGATION" code="RIOS-MAP-001" icon={<MapIcon size={28} />} />
        <div className="mb-8" />

        <div className="grid md:grid-cols-2 gap-6">
          {MAPS.map(m => (
            <Link key={m.id} href={`/map/${m.id}`} className="group block">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-colors">
                <div className="h-48 overflow-hidden relative bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumb} alt={m.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-rajdhani)] uppercase tracking-wider">{m.name}</h2>
                    <div className="flex gap-4 text-xs text-[var(--color-accent)] font-mono uppercase mt-1">
                      <span>{m.zones}</span>
                      <span>{m.pois}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[var(--color-text-secondary)]">{m.desc}</p>
                  <div className="mt-3 text-xs text-[var(--color-accent)] font-mono uppercase tracking-wider group-hover:underline">
                    Open Map &rarr;
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
