import { useState, useCallback } from 'react';
import { MapPin, Filter, X, ChevronRight } from 'lucide-react';

interface Marker {
  id: number;
  Name: string;
  MarkerType: string;
  PosX: number;
  PosY: number;
  Description: string;
  Tips?: string;
}

const MARKER_TYPES = ['Chest', 'Puzzle', 'Boss', 'NPC', 'Teleport', 'Resource Node', 'Secret', 'Quest', 'Collectible'];

const MARKER_COLORS: Record<string, string> = {
  Chest: '#FFD700',
  Puzzle: '#9B59B6',
  Boss: '#FF6B35',
  NPC: '#27AE60',
  Teleport: '#00BFFF',
  'Resource Node': '#CCCCCC',
  Secret: '#FF69B4',
  Quest: '#FFE500',
  Collectible: '#E74C3C',
};

const VALLEY_IV_MARKERS: Marker[] = [
  { id: 1, Name: 'Supply Cache Alpha', MarkerType: 'Chest', PosX: 25, PosY: 30, Description: 'Standard supply cache containing materials and currency.' },
  { id: 2, Name: 'Frozen Puzzle Gate', MarkerType: 'Puzzle', PosX: 45, PosY: 20, Description: 'Cryo element puzzle. Requires freezing water sources in correct order.', Tips: 'Start from the bottom pool and work upward.' },
  { id: 3, Name: 'Ruin Guardian', MarkerType: 'Boss', PosX: 70, PosY: 50, Description: 'Elite boss. Level 40+. Drops advanced weapon materials.', Tips: 'Weak to Electric element. Dodge the ground slam.' },
  { id: 4, Name: 'Merchant Voss', MarkerType: 'NPC', PosX: 30, PosY: 60, Description: 'Traveling merchant selling rare materials at discount.' },
  { id: 5, Name: 'Valley Waypoint', MarkerType: 'Teleport', PosX: 50, PosY: 45, Description: 'Fast travel teleportation waypoint.' },
  { id: 6, Name: 'Iron Ore Deposit', MarkerType: 'Resource Node', PosX: 15, PosY: 70, Description: 'Rich iron ore vein. Respawns every 48 hours.' },
  { id: 7, Name: 'Hidden Cave', MarkerType: 'Secret', PosX: 80, PosY: 25, Description: 'Secret cave behind the waterfall. Contains a luxurious chest.', Tips: 'Break the cracked wall with a charged attack.' },
  { id: 8, Name: 'Lost Researcher', MarkerType: 'Quest', PosX: 60, PosY: 75, Description: 'Side quest: Help the lost researcher find their equipment.' },
  { id: 9, Name: 'Ancient Tablet #1', MarkerType: 'Collectible', PosX: 35, PosY: 40, Description: 'Part of the "Lost History" achievement series. 1 of 12.' },
  { id: 10, Name: 'Copper Ore Vein', MarkerType: 'Resource Node', PosX: 55, PosY: 65, Description: 'Medium copper ore deposit. Respawns every 24 hours.' },
  { id: 11, Name: 'Elite Sentinel', MarkerType: 'Boss', PosX: 40, PosY: 85, Description: 'Mini-boss. Level 35+. Drops equipment set materials.' },
  { id: 12, Name: 'Supply Cache Beta', MarkerType: 'Chest', PosX: 85, PosY: 60, Description: 'Exquisite chest with guaranteed 4-star equipment.' },
  { id: 13, Name: 'Gearwork Puzzle', MarkerType: 'Puzzle', PosX: 20, PosY: 50, Description: 'Mechanical puzzle requiring precise timing.', Tips: 'Activate gears in clockwise order.' },
  { id: 14, Name: 'Summit Waypoint', MarkerType: 'Teleport', PosX: 75, PosY: 15, Description: 'High-altitude waypoint with panoramic view.' },
  { id: 15, Name: 'Ancient Tablet #2', MarkerType: 'Collectible', PosX: 65, PosY: 35, Description: 'Part of the "Lost History" achievement series. 2 of 12.' },
];

const WULING_MARKERS: Marker[] = [
  { id: 16, Name: 'Jade Mining Site', MarkerType: 'Resource Node', PosX: 30, PosY: 25, Description: 'Jade ore deposit unique to Wuling region.' },
  { id: 17, Name: 'Dragon Gate Boss', MarkerType: 'Boss', PosX: 55, PosY: 40, Description: 'Weekly boss. Level 50+. Drops 6-star materials.', Tips: 'Bring a healer. Three phases.' },
  { id: 18, Name: 'Tea House', MarkerType: 'NPC', PosX: 45, PosY: 60, Description: 'Rest stop. NPCs here give daily quests.' },
  { id: 19, Name: 'Wuling Waypoint', MarkerType: 'Teleport', PosX: 50, PosY: 50, Description: 'Central teleport point for Wuling.' },
  { id: 20, Name: 'Hidden Shrine', MarkerType: 'Secret', PosX: 70, PosY: 30, Description: 'Ancient shrine with a time-trial challenge.', Tips: 'Complete in under 60s for max rewards.' },
];

export default function InteractiveMap() {
  const [region, setRegion] = useState<'Valley IV' | 'Wuling'>('Valley IV');
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(MARKER_TYPES));
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const markers = region === 'Valley IV' ? VALLEY_IV_MARKERS : WULING_MARKERS;
  const filtered = markers.filter(m => activeTypes.has(m.MarkerType));

  const toggleType = useCallback((type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">INTERACTIVE MAP</h1>
      <p className="text-gray-500 text-sm mb-6">Explore game regions with detailed markers</p>

      <div className="flex gap-3 mb-4">
        {(['Valley IV', 'Wuling'] as const).map(r => (
          <button
            key={r}
            onClick={() => { setRegion(r); setSelectedMarker(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              region === r ? 'bg-[#FFE500] text-black' : 'bg-[#111] text-gray-400 border border-[#333] hover:border-[#555]'
            }`}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[#111] text-gray-400 border border-[#333] hover:border-[#555] ml-auto"
        >
          <Filter size={14} /> Filters ({activeTypes.size}/{MARKER_TYPES.length})
        </button>
      </div>

      {showFilters && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {MARKER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeTypes.has(type)
                    ? 'border-current bg-current/10'
                    : 'border-[#333] text-gray-600'
                }`}
                style={activeTypes.has(type) ? { color: MARKER_COLORS[type], borderColor: MARKER_COLORS[type] } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MARKER_COLORS[type] }} />
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map area */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/10' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a1a] to-[#0a1a2a]">
            {/* Grid lines */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`h${i}`} className="absolute left-0 right-0 border-t border-white/5" style={{ top: `${(i + 1) * 10}%` }} />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={`v${i}`} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: `${(i + 1) * 10}%` }} />
            ))}

            {/* Markers */}
            {filtered.map(marker => (
              <button
                key={marker.id}
                onClick={() => setSelectedMarker(marker)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-10 ${
                  selectedMarker?.id === marker.id ? 'scale-150 z-20' : ''
                }`}
                style={{ left: `${marker.PosX}%`, top: `${marker.PosY}%` }}
                title={marker.Name}
              >
                <MapPin size={selectedMarker?.id === marker.id ? 24 : 18} fill={MARKER_COLORS[marker.MarkerType]} color="#000" strokeWidth={1} />
              </button>
            ))}

            {/* Region label */}
            <div className="absolute bottom-4 left-4 text-white/20 text-4xl font-bold">{region}</div>
          </div>
        </div>

        {/* Marker list / detail */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
          {selectedMarker ? (
            <div className="p-4">
              <button onClick={() => setSelectedMarker(null)} className="flex items-center gap-1 text-gray-500 text-xs mb-3 hover:text-white">
                <X size={12} /> Close
              </button>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} fill={MARKER_COLORS[selectedMarker.MarkerType]} color="#000" strokeWidth={1} />
                <span className="text-xs font-medium" style={{ color: MARKER_COLORS[selectedMarker.MarkerType] }}>{selectedMarker.MarkerType}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{selectedMarker.Name}</h3>
              <p className="text-gray-400 text-sm">{selectedMarker.Description}</p>
              {selectedMarker.Tips && (
                <div className="mt-3 p-3 bg-[#FFE500]/5 border border-[#FFE500]/20 rounded-lg">
                  <p className="text-[#FFE500] text-xs font-semibold mb-1">TIP</p>
                  <p className="text-gray-300 text-xs">{selectedMarker.Tips}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-y-auto">
              <div className="p-3 border-b border-[#222] text-gray-500 text-xs font-semibold">
                {filtered.length} markers
              </div>
              {filtered.map(marker => (
                <button
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left border-b border-[#1a1a1a]"
                >
                  <MapPin size={14} fill={MARKER_COLORS[marker.MarkerType]} color="#000" strokeWidth={1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{marker.Name}</p>
                    <p className="text-gray-600 text-[10px]">{marker.MarkerType}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
