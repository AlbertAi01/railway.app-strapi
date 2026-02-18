'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, Filter, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Check, Search, Flame, Pickaxe, Leaf, Gem, MapPin, BookOpen, Swords, X, Cloud, CloudOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud } from '@/lib/userSync';

const TOOLS_CDN = 'https://endfieldtools.dev/assets/images/endfield';
const TILE_BASE = `${TOOLS_CDN}/levelmap/levelmapgrids`;
const ICON_BASE = `${TOOLS_CDN}/itemicon`;
const TILE_SIZE = 600;

interface POI {
  id: string; type: string; cat: string; sub: string;
  px: number; py: number; zone: string; layer: number; name: string;
}
interface ZoneLabel { id: string; name: string; x: number; y: number; }
interface TileZone { id: string; folder: string; cols: number; rows: number; startX: number; startY: number; }
interface MapData {
  mapId: string; width: number; height: number;
  zones: Record<string, string>; zoneLabels: ZoneLabel[];
  tileZones: TileZone[]; pois: POI[];
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string; defaultOn: boolean }> = {
  chest:       { label: 'Treasure Chests', color: '#FF8C00', icon: 'item_materialchest_01', defaultOn: true },
  travel:      { label: 'Campfires',       color: '#FF6B35', icon: 'item_add_endurance',    defaultOn: true },
  dungeon:     { label: 'Dungeons',        color: '#F39C12', icon: 'item_adventureexp',     defaultOn: true },
  collectible: { label: 'Collectibles',    color: '#FFD700', icon: 'item_diamond',          defaultOn: false },
  mineral:     { label: 'Mining Points',   color: '#3498DB', icon: 'item_iron_ore',         defaultOn: false },
  plant:       { label: 'Plant Materials', color: '#27AE60', icon: 'item_plant_moss_1',     defaultOn: false },
  ether:       { label: 'Ether Shards',    color: '#00BFFF', icon: 'item_diamond',          defaultOn: false },
  narrative:   { label: 'Story Items',     color: '#E74C3C', icon: 'item_diamond',          defaultOn: false },
  terminal:    { label: 'Terminals',       color: '#9B59B6', icon: 'item_diamond',          defaultOn: false },
};

const ENTITY_ICON: Record<string, string> = {
  'int_campfire_v2': 'item_add_endurance',
  'int_trchest_common': 'item_materialchest_01',
  'int_trchest_common_gorgeous': 'item_materialchest_03',
  'int_trchest_common_high': 'item_materialchest_02',
  'int_trchest_common_normal': 'item_materialchest_01',
  'int_trchest_lock': 'item_materialchest_02',
  'int_collection_coin': 'item_diamond',
  'int_collection_coin_puzzle': 'item_diamond',
  'int_doodad_bbflower_1': 'item_plant_bbflower_1',
  'int_doodad_flower_1': 'item_plant_moss_1',
  'int_doodad_flower_2': 'item_plant_moss_2',
  'int_doodad_flower_3': 'item_plant_moss_3',
  'int_doodad_mushroom_1_1': 'item_plant_mushroom_1_1',
  'int_doodad_mushroom_1_2': 'item_plant_mushroom_1_2',
  'int_doodad_insect_1': 'item_plant_tundra_insect_1',
  'int_doodad_insect_2': 'item_plant_tundra_insect_2',
  'int_doodad_crylplant_1_1': 'item_plant_crylplant_1_1',
  'int_doodad_crylplant_1_2': 'item_plant_crylplant_1_2',
  'int_doodad_spcstone_1_1': 'item_plant_spcstone_1_1',
  'int_doodad_spcstone_1_2': 'item_plant_spcstone_1_2',
  'int_doodad_core_mine_iron': 'item_iron_ore',
  'int_doodad_core_mine_originium': 'item_originium_ore',
  'int_doodad_core_mine_quartz': 'item_quartz_sand',
};

function getEntityIcon(type: string): string {
  return ENTITY_ICON[type] || 'item_diamond';
}

const STORAGE_KEY = 'zerosanity-map-valley-iv';

export default function ValleyIVMapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    for (const [cat, cfg] of Object.entries(CATEGORY_CONFIG)) {
      if (cfg.defaultOn) defaults.add(cat);
    }
    return defaults;
  });
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token } = useAuthStore();
  const cloudLoaded = useRef(false);

  // Pan/zoom state
  const [zoom, setZoom] = useState(0.08);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });

  // Load map data
  useEffect(() => {
    fetch('/data/map01-pois.json')
      .then(r => r.json())
      .then((data: MapData) => {
        setMapData(data);
        if (containerRef.current) {
          const vw = containerRef.current.clientWidth;
          const vh = containerRef.current.clientHeight;
          const initZoom = Math.min(vw / data.width, vh / data.height) * 0.9;
          setZoom(initZoom);
          setOffset({
            x: (vw - data.width * initZoom) / 2,
            y: (vh - data.height * initZoom) / 2,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load cloud data on mount
  useEffect(() => {
    if (cloudLoaded.current || !token) return;
    cloudLoaded.current = true;
    (async () => {
      const cloud = await loadFromCloud('mapValleyIV', token);
      if (cloud && Array.isArray(cloud)) {
        setCompleted(new Set(cloud));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud));
        setSyncStatus('synced');
      }
    })();
  }, [token]);

  // Save completed to localStorage + debounced cloud sync
  const saveCompleted = useCallback((next: Set<string>) => {
    const arr = [...next];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    if (token) {
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      setSyncStatus('syncing');
      syncTimeout.current = setTimeout(async () => {
        try {
          await syncToCloud('mapValleyIV', arr, token);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      }, 2000);
    }
  }, [token]);

  const toggleCategory = useCallback((cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleComplete = useCallback((poiId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(poiId)) next.delete(poiId);
      else next.add(poiId);
      saveCompleted(next);
      return next;
    });
  }, [saveCompleted]);

  // Visible POIs
  const visiblePois = useMemo(() => {
    if (!mapData) return [];
    return mapData.pois.filter(p => {
      if (!activeCategories.has(p.cat)) return false;
      if (hideCompleted && completed.has(p.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
      }
      return true;
    });
  }, [mapData, activeCategories, hideCompleted, completed, searchQuery]);

  // Cluster POIs that are close together at current zoom
  const clusters = useMemo(() => {
    const clusterRadius = 30 / zoom; // pixels in map space
    const result: { x: number; y: number; pois: POI[]; key: string }[] = [];
    const used = new Set<number>();

    for (let i = 0; i < visiblePois.length; i++) {
      if (used.has(i)) continue;
      const p = visiblePois[i];
      const cluster: POI[] = [p];
      used.add(i);

      for (let j = i + 1; j < visiblePois.length; j++) {
        if (used.has(j)) continue;
        const q = visiblePois[j];
        const dx = p.px - q.px;
        const dy = p.py - q.py;
        if (dx * dx + dy * dy < clusterRadius * clusterRadius) {
          cluster.push(q);
          used.add(j);
        }
      }

      const cx = cluster.reduce((s, c) => s + c.px, 0) / cluster.length;
      const cy = cluster.reduce((s, c) => s + c.py, 0) / cluster.length;
      result.push({ x: cx, y: cy, pois: cluster, key: cluster[0].id });
    }
    return result;
  }, [visiblePois, zoom]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = { ...offset };
    e.preventDefault();
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: lastOffset.current.x + (e.clientX - dragStart.current.x),
      y: lastOffset.current.y + (e.clientY - dragStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Math.max(0.02, Math.min(2, zoom * factor));
    setOffset(prev => ({
      x: mx - (mx - prev.x) * (newZoom / zoom),
      y: my - (my - prev.y) * (newZoom / zoom),
    }));
    setZoom(newZoom);
  }, [zoom]);

  const zoomTo = useCallback((level: number) => {
    if (!containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const cx = (vw / 2 - offset.x) / zoom;
    const cy = (vh / 2 - offset.y) / zoom;
    setOffset({
      x: vw / 2 - cx * level,
      y: vh / 2 - cy * level,
    });
    setZoom(level);
  }, [zoom, offset]);

  const fitMap = useCallback(() => {
    if (!mapData || !containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const fitZoom = Math.min(vw / mapData.width, vh / mapData.height) * 0.9;
    setZoom(fitZoom);
    setOffset({
      x: (vw - mapData.width * fitZoom) / 2,
      y: (vh - mapData.height * fitZoom) / 2,
    });
  }, [mapData]);

  const panToPoi = useCallback((poi: POI) => {
    if (!containerRef.current) return;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const targetZoom = Math.max(zoom, 0.15);
    setZoom(targetZoom);
    setOffset({
      x: vw / 2 - poi.px * targetZoom,
      y: vh / 2 - poi.py * targetZoom,
    });
    setSelectedPoi(poi);
  }, [zoom]);

  // Generate all tile definitions
  const allTiles = useMemo(() => {
    if (!mapData) return [];
    const result: { src: string; x: number; y: number; key: string }[] = [];
    for (const tz of mapData.tileZones) {
      for (let col = 1; col <= tz.cols; col++) {
        for (let row = 1; row <= tz.rows; row++) {
          const x = tz.startX + (col - 1) * TILE_SIZE;
          const y = tz.startY + (row - 1) * TILE_SIZE;
          const fname = `${tz.id}_${col}_${row}.png`;
          result.push({ src: `${TILE_BASE}/${tz.folder}/${fname}`, x, y, key: `${tz.id}_${col}_${row}` });
        }
      }
    }
    return result;
  }, [mapData]);

  // Viewport-culled tiles: only render tiles visible in the current view (with margin)
  const visibleTiles = useMemo(() => {
    if (!containerRef.current || allTiles.length === 0) return allTiles;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    // Visible area in map coordinates
    const margin = TILE_SIZE; // 1-tile buffer
    const left = (-offset.x / zoom) - margin;
    const top = (-offset.y / zoom) - margin;
    const right = left + (vw / zoom) + margin * 2;
    const bottom = top + (vh / zoom) + margin * 2;
    return allTiles.filter(t =>
      t.x + TILE_SIZE > left && t.x < right && t.y + TILE_SIZE > top && t.y < bottom
    );
  }, [allTiles, offset, zoom]);

  // Category icon component
  const CatIcon = ({ cat }: { cat: string }) => {
    switch (cat) {
      case 'chest': return <Gem size={14} />;
      case 'travel': return <Flame size={14} />;
      case 'mineral': return <Pickaxe size={14} />;
      case 'plant': return <Leaf size={14} />;
      case 'narrative': return <BookOpen size={14} />;
      case 'dungeon': return <Swords size={14} />;
      default: return <MapPin size={14} />;
    }
  };

  // Completion stats
  const stats = useMemo(() => {
    if (!mapData) return {};
    const s: Record<string, { total: number; done: number }> = {};
    for (const p of mapData.pois) {
      if (!s[p.cat]) s[p.cat] = { total: 0, done: 0 };
      s[p.cat].total++;
      if (completed.has(p.id)) s[p.cat].done++;
    }
    return s;
  }, [mapData, completed]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="diamond-spinner mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)] font-mono text-sm uppercase tracking-wider">Loading Valley IV Map Data...</p>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-red-400">Failed to load map data.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center gap-3 px-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-50">
        <Link href="/map" className="text-[var(--color-text-secondary)] hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="diamond-sm bg-[var(--color-accent)]" />
          <span className="font-mono text-xs text-[var(--color-accent)] uppercase tracking-wider">Valley IV</span>
        </div>
        <span className="text-[var(--color-text-tertiary)] text-xs font-mono">|</span>
        <span className="text-[var(--color-text-secondary)] text-xs font-mono">{visiblePois.length} POIs visible</span>
        <div className="ml-auto flex items-center gap-2">
          {token && syncStatus !== 'idle' && (
            <div className="flex items-center gap-1">
              {syncStatus === 'syncing' && <Loader2 size={12} className="text-[var(--color-accent)] animate-spin" />}
              {syncStatus === 'synced' && <Cloud size={12} className="text-green-400" />}
              {syncStatus === 'error' && <CloudOff size={12} className="text-red-400" />}
            </div>
          )}
          <span className="text-[var(--color-text-tertiary)] text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:text-[var(--color-accent)] text-[var(--color-text-secondary)]">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 max-w-[80vw] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-40 overflow-y-auto shrink-0">
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                <input
                  type="text" placeholder="Search POIs..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[var(--color-border)] text-sm text-white px-8 py-1.5 focus:outline-none focus:border-[var(--color-accent)]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 flex gap-2">
              <button onClick={() => setActiveCategories(new Set(Object.keys(CATEGORY_CONFIG)))} className="flex-1 text-xs py-1 bg-[var(--color-accent)] text-black font-bold uppercase">All</button>
              <button onClick={() => setActiveCategories(new Set())} className="flex-1 text-xs py-1 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] uppercase">Clear</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
                const s = stats[cat] || { total: 0, done: 0 };
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm transition-colors ${
                      activeCategories.has(cat) ? 'bg-[#1a1a1a] border-l-2' : 'opacity-50 border-l-2 border-transparent'
                    }`}
                    style={{ borderColor: activeCategories.has(cat) ? cfg.color : 'transparent' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${ICON_BASE}/${cfg.icon}.png`} alt={cfg.label} className="w-5 h-5" />
                    <span className="flex-1 text-white text-xs">{cfg.label}</span>
                    <span className="text-[10px] font-mono" style={{ color: cfg.color }}>{s.done}/{s.total}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--color-text-secondary)] hover:text-white"
              >
                {hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{hideCompleted ? 'Show Completed' : 'Hide Completed'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-black cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ touchAction: 'none' }}
        >
          {/* Map layer: tiles + zone labels + POI markers (all HTML) */}
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0,
              width: mapData.width, height: mapData.height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            {/* Tiles (viewport-culled HTML img) */}
            {visibleTiles.map(t => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={t.key}
                src={t.src}
                alt=""
                width={TILE_SIZE}
                height={TILE_SIZE}
                loading="eager"
                decoding="async"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: t.x, top: t.y,
                  width: TILE_SIZE, height: TILE_SIZE,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  imageRendering: 'auto',
                }}
              />
            ))}

            {/* Zone Labels (HTML) */}
            {mapData.zoneLabels.map(z => (
              <div
                key={z.id}
                style={{
                  position: 'absolute',
                  left: z.x, top: z.y,
                  transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  fontFamily: 'system-ui',
                  color: 'white',
                  textTransform: 'uppercase',
                  textShadow: '0 0 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
                  letterSpacing: '0.05em',
                }}>{z.name}</span>
              </div>
            ))}
          </div>

          {/* POI Markers Overlay */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0, top: 0,
              width: mapData.width, height: mapData.height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {clusters.map(cluster => {
              const p = cluster.pois[0];
              const cat = CATEGORY_CONFIG[p.cat];
              const isMulti = cluster.pois.length > 1;
              const allDone = cluster.pois.every(poi => completed.has(poi.id));
              const iconName = getEntityIcon(p.type);

              return (
                <div
                  key={cluster.key}
                  className="absolute pointer-events-auto"
                  style={{
                    left: cluster.x,
                    top: cluster.y,
                    transform: `translate(-50%, -50%) scale(${1 / zoom})`,
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); isMulti ? panToPoi(p) : setSelectedPoi(p); }}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-black/50 transition-transform hover:scale-125 ${allDone ? 'opacity-40' : ''}`}
                    style={{ backgroundColor: cat?.color || '#888' }}
                    title={isMulti ? `${cluster.pois.length} POIs` : p.name || p.type}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${ICON_BASE}/${iconName}.png`} alt="" className="w-full h-full object-contain p-0.5" />
                    {isMulti && (
                      <div className="absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 bg-black border-2 border-white text-[10px] font-bold text-white">
                        {cluster.pois.length}
                      </div>
                    )}
                    {allDone && !isMulti && (
                      <div className="absolute inset-0 rounded-full bg-green-500/50 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
            <button onClick={() => zoomTo(zoom * 1.3)} className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)]">
              <ZoomIn size={16} />
            </button>
            <button onClick={() => zoomTo(zoom / 1.3)} className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)]">
              <ZoomOut size={16} />
            </button>
            <button onClick={fitMap} className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)]">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* POI Detail Panel */}
        {selectedPoi && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 max-w-sm w-full mx-4 clip-corner-tl">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ICON_BASE}/${getEntityIcon(selectedPoi.type)}.png`} alt="" className="w-10 h-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">{selectedPoi.name || selectedPoi.sub || selectedPoi.type}</div>
                <div className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase">{selectedPoi.cat} {selectedPoi.sub ? `/ ${selectedPoi.sub}` : ''}</div>
                <div className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{mapData.zones[selectedPoi.zone] || selectedPoi.zone}</div>
              </div>
              <button onClick={() => setSelectedPoi(null)} className="text-[var(--color-text-tertiary)] hover:text-white shrink-0">
                <X size={16} />
              </button>
            </div>
            <button
              onClick={() => toggleComplete(selectedPoi.id)}
              className={`mt-3 w-full py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                completed.has(selectedPoi.id)
                  ? 'bg-green-900/30 border-green-600 text-green-400'
                  : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
            >
              {completed.has(selectedPoi.id) ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
