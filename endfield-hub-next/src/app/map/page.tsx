'use client';

import { Map as MapIcon, Compass } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-[#080c12] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Interactive Map Interface" category="NAVIGATION" code="RIOS-MAP-001" icon={<MapIcon size={28} />} />
        <div className="mb-8"></div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-12">
          <div className="text-center max-w-2xl mx-auto">
            <Compass className="w-24 h-24 text-[var(--color-accent)] mx-auto mb-6 animate-pulse" />

            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>

            <p className="text-lg mb-6">
              An interactive map is under development. This feature will include:
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
              <div className="bg-[#080c12] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="font-bold text-[var(--color-accent)] mb-2">Resource Locations</h3>
                <p className="text-sm">Mark and track farming locations for materials, ores, and collectibles.</p>
              </div>

              <div className="bg-[#080c12] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="font-bold text-[var(--color-accent)] mb-2">Quest Markers</h3>
                <p className="text-sm">View main story, side quest, and world quest locations.</p>
              </div>

              <div className="bg-[#080c12] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="font-bold text-[var(--color-accent)] mb-2">Enemy Spawns</h3>
                <p className="text-sm">Locate elite enemies and boss spawn points with timers.</p>
              </div>

              <div className="bg-[#080c12] border border-[var(--color-border)] clip-corner-tl p-4">
                <h3 className="font-bold text-[var(--color-accent)] mb-2">Custom Markers</h3>
                <p className="text-sm">Add your own notes and markers to personalize your map.</p>
              </div>
            </div>

            <div className="bg-[#080c12] border border-[var(--color-accent)] clip-corner-tl p-6">
              <h3 className="font-bold text-white mb-2">Technical Note</h3>
              <p className="text-sm">
                Interactive maps in Next.js require dynamic imports for libraries like Leaflet
                due to SSR compatibility. The map will be implemented using Next.js dynamic imports
                with <code className="text-[var(--color-accent)]">{'{ ssr: false }'}</code> to ensure proper functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder for future map regions */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {['Central District', 'Industrial Zone', 'Wilderness'].map((region, idx) => (
            <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 opacity-50">
              <h3 className="font-bold text-white mb-2">{region}</h3>
              <p className="text-sm">Map data pending...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
