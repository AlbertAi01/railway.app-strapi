'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronDown, ChevronRight, Filter, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Check, Search, Layers, X, Cloud, CloudOff, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
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
interface MapData {
  mapId: string; width: number; height: number;
  zones: Record<string, string>; zoneLabels: ZoneLabel[];
  pois: POI[];
}

// Exact tile definition with correct coordinates
interface TileDef { src: string; x: number; y: number; key: string; }

// ──── Sub-type configuration ────
interface SubType { label: string; icon: string; types: string[]; }
interface CategoryDef {
  label: string; color: string; icon: string; defaultOn: boolean;
  subTypes?: SubType[];
}

const CATEGORY_CONFIG: Record<string, CategoryDef> = {
  chest: {
    label: 'Treasure Chests', color: '#FF8C00', icon: 'item_materialchest_01', defaultOn: true,
    subTypes: [
      { label: 'Gorgeous Chest', icon: 'item_materialchest_03', types: ['int_trchest_common_gorgeous'] },
      { label: 'Locked Chest', icon: 'item_materialchest_02', types: ['int_trchest_lock'] },
      { label: 'High-Tier Chest', icon: 'item_materialchest_02', types: ['int_trchest_common_high'] },
      { label: 'Normal Chest', icon: 'item_materialchest_01', types: ['int_trchest_common_normal'] },
      { label: 'Basic Chest', icon: 'item_materialchest_01', types: ['int_trchest_common'] },
    ],
  },
  travel: { label: 'Campfires', color: '#FF6B35', icon: 'item_add_endurance', defaultOn: true },
  dungeon: { label: 'Dungeons', color: '#F39C12', icon: 'item_adventureexp', defaultOn: true },
  collectible: { label: 'Collectibles', color: '#FFD700', icon: 'item_diamond', defaultOn: false },
  mineral: {
    label: 'Mining Points', color: '#3498DB', icon: 'item_iron_ore', defaultOn: false,
    subTypes: [
      { label: 'Iron', icon: 'item_iron_ore', types: ['int_doodad_core_mine_iron', 'int_doodad_corp_1', 'int_doodad_corp_2'] },
      { label: 'Originium', icon: 'item_originium_ore', types: ['int_doodad_core_mine_originium'] },
      { label: 'Quartz', icon: 'item_quartz_sand', types: ['int_doodad_core_mine_quartz'] },
      { label: 'Auronyx', icon: 'item_plant_spcstone_1_1', types: ['int_doodad_spcstone_1_1'] },
      { label: 'Igneosite', icon: 'item_plant_spcstone_1_2', types: ['int_doodad_spcstone_1_2'] },
    ],
  },
  plant: {
    label: 'Plant Materials', color: '#27AE60', icon: 'item_plant_moss_1', defaultOn: false,
    subTypes: [
      { label: 'Aketine', icon: 'item_plant_moss_1', types: ['int_doodad_flower_1', 'int_doodad_flower_once_1', 'int_doodad_flower_spc_1', 'int_doodad_flower_spc_once_1', 'int_doodad_flower_story_1'] },
      { label: 'Buckflower', icon: 'item_plant_moss_2', types: ['int_doodad_flower_2', 'int_doodad_flower_once_2', 'int_doodad_flower_spc_2', 'int_doodad_flower_spc_once_2'] },
      { label: 'Windbell', icon: 'item_plant_moss_3', types: ['int_doodad_flower_3'] },
      { label: 'Blazebloom', icon: 'item_plant_bbflower_1', types: ['int_doodad_bbflower_1'] },
      { label: 'Mushroom', icon: 'item_plant_mushroom_1_1', types: ['int_doodad_mushroom_1_1', 'int_doodad_mushroom_spc_2_1'] },
      { label: 'Sporebloom', icon: 'item_plant_mushroom_1_2', types: ['int_doodad_mushroom_1_2'] },
      { label: 'Stinger', icon: 'item_plant_tundra_insect_1', types: ['int_doodad_insect_1'] },
      { label: 'Luminoth', icon: 'item_plant_tundra_insect_2', types: ['int_doodad_insect_2'] },
      { label: 'Cryplant A', icon: 'item_plant_crylplant_1_1', types: ['int_doodad_crylplant_1_1'] },
      { label: 'Cryplant B', icon: 'item_plant_crylplant_1_2', types: ['int_doodad_crylplant_1_2'] },
    ],
  },
  ether: { label: 'Ether Shards', color: '#00BFFF', icon: 'item_diamond', defaultOn: false },
  narrative: { label: 'Story Items', color: '#E74C3C', icon: 'item_diamond', defaultOn: false },
  terminal: { label: 'Terminals', color: '#9B59B6', icon: 'item_diamond', defaultOn: false },
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
  'int_collection_common': 'item_diamond',
  'int_collection_piece_in_door': 'item_diamond',
  'int_doodad_bbflower_1': 'item_plant_bbflower_1',
  'int_doodad_flower_1': 'item_plant_moss_1',
  'int_doodad_flower_2': 'item_plant_moss_2',
  'int_doodad_flower_3': 'item_plant_moss_3',
  'int_doodad_flower_once_1': 'item_plant_moss_1',
  'int_doodad_flower_once_2': 'item_plant_moss_2',
  'int_doodad_flower_spc_1': 'item_plant_moss_1',
  'int_doodad_flower_spc_2': 'item_plant_moss_2',
  'int_doodad_flower_spc_once_1': 'item_plant_moss_1',
  'int_doodad_flower_spc_once_2': 'item_plant_moss_2',
  'int_doodad_flower_story_1': 'item_plant_moss_1',
  'int_doodad_mushroom_1_1': 'item_plant_mushroom_1_1',
  'int_doodad_mushroom_1_2': 'item_plant_mushroom_1_2',
  'int_doodad_mushroom_spc_2_1': 'item_plant_mushroom_1_1',
  'int_doodad_insect_1': 'item_plant_tundra_insect_1',
  'int_doodad_insect_2': 'item_plant_tundra_insect_2',
  'int_doodad_crylplant_1_1': 'item_plant_crylplant_1_1',
  'int_doodad_crylplant_1_2': 'item_plant_crylplant_1_2',
  'int_doodad_spcstone_1_1': 'item_plant_spcstone_1_1',
  'int_doodad_spcstone_1_2': 'item_plant_spcstone_1_2',
  'int_doodad_core_mine_iron': 'item_iron_ore',
  'int_doodad_core_mine_originium': 'item_originium_ore',
  'int_doodad_core_mine_quartz': 'item_quartz_sand',
  'int_doodad_core_recycle': 'item_iron_ore',
  'int_doodad_corp_1': 'item_iron_ore',
  'int_doodad_corp_2': 'item_iron_ore',
};

function getEntityIcon(type: string): string {
  return ENTITY_ICON[type] || 'item_diamond';
}

// Generate all tiles with EXACT coordinates from endfieldtools.dev
function generateAllTiles(): TileDef[] {
  const tiles: TileDef[] = [];

  // Helper to generate tiles for a zone
  const addTiles = (id: string, folder: string, startX: number, startY: number, tileList: Array<[number, number]>) => {
    for (const [col, row] of tileList) {
      const x = startX + (col - 1) * 600;
      const y = startY - (row - 1) * 600; // Y DECREASES per row
      const fname = `${id}_${col}_${row}.png`;
      tiles.push({
        src: `${TILE_BASE}/${folder}/${fname}`,
        x,
        y,
        key: `${id}_${col}_${row}`
      });
    }
  };

  // map01lv007 (Power Plateau) - Cols 1-8, Rows 1-8 (64 tiles, full grid)
  const lv007Tiles: Array<[number, number]> = [];
  for (let col = 1; col <= 8; col++) {
    for (let row = 1; row <= 8; row++) {
      lv007Tiles.push([col, row]);
    }
  }
  addTiles('map01_lv007', 'map01lv007', 1800, 3000, lv007Tiles);

  // map01lv006 (Origin Lodespring) - Cols 4-8, Rows 1-8 (37 tiles, sparse)
  const lv006Tiles: Array<[number, number]> = [];
  for (let col = 4; col <= 7; col++) {
    for (let row = 1; row <= 8; row++) {
      lv006Tiles.push([col, row]);
    }
  }
  // Col 8 only has rows 4-8
  for (let row = 4; row <= 8; row++) {
    lv006Tiles.push([8, row]);
  }
  addTiles('map01_lv006', 'map01lv006', 4800, 3000, lv006Tiles);

  // map01lv005 (Originium Science Park) - Cols 1-7, Rows 1-6 (30 tiles, sparse)
  const lv005Tiles: Array<[number, number]> = [];
  for (let col = 1; col <= 6; col++) {
    for (let row = 1; row <= 4; row++) {
      lv005Tiles.push([col, row]);
    }
  }
  // Col 7 has rows 1-6
  for (let row = 1; row <= 6; row++) {
    lv005Tiles.push([7, row]);
  }
  addTiles('map01_lv005', 'map01lv005', 5400, 5400, lv005Tiles);

  // map01lv003 (Aburrey Quarry) - Cols 1-5, Rows 1-5 (17 tiles, very sparse)
  const lv003Tiles: Array<[number, number]> = [
    // Col 1 has rows 1-5
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
    // Cols 2-5 have rows 1-3 only
    [2, 1], [2, 2], [2, 3],
    [3, 1], [3, 2], [3, 3],
    [4, 1], [4, 2], [4, 3],
    [5, 1], [5, 2], [5, 3],
  ];
  addTiles('map01_lv003', 'map01lv003', 4800, 7200, lv003Tiles);

  // map01lv002 (Valley Pass) - Cols 1-5, Rows 1-5 (17 tiles, very sparse)
  const lv002Tiles: Array<[number, number]> = [
    // Cols 1-3 have rows 1-5
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 1], [2, 2], [2, 3], [2, 4], [2, 5],
    [3, 1], [3, 2], [3, 3], [3, 4], [3, 5],
    // Cols 4-5 have row 1 only
    [4, 1],
    [5, 1],
  ];
  addTiles('map01_lv002', 'map01lv002', 0, 3600, lv002Tiles);

  // map01lv001 (The Hub) - Cols 1-8, Rows 1-5 (33 tiles, sparse)
  const lv001Tiles: Array<[number, number]> = [];
  // Cols 1-4 have rows 1-4
  for (let col = 1; col <= 4; col++) {
    for (let row = 1; row <= 4; row++) {
      lv001Tiles.push([col, row]);
    }
  }
  // Cols 5-7 have rows 1-5
  for (let col = 5; col <= 7; col++) {
    for (let row = 1; row <= 5; row++) {
      lv001Tiles.push([col, row]);
    }
  }
  // Col 8 has rows 4-5 only
  lv001Tiles.push([8, 4], [8, 5]);
  addTiles('map01_lv001', 'map01lv001', 600, 6000, lv001Tiles);

  return tiles;
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
  const [disabledSubTypes, setDisabledSubTypes] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['chest']));
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
  const [showZoneLabels, setShowZoneLabels] = useState(true);
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

  // Touch state for pinch-to-zoom
  const lastTouchDist = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });

  // Tile loading state
  const [loadedTiles, setLoadedTiles] = useState<Set<string>>(new Set());
  const [tilesLoaded, setTilesLoaded] = useState(0);

  // Generate all tiles once
  const allTiles = useMemo(() => generateAllTiles(), []);
  const tilesTotal = allTiles.length;

  // Load map data
  useEffect(() => {
    fetch('/data/map01-pois.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: MapData) => {
        setMapData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load map data:', err);
        setLoading(false);
      });
  }, []);

  // Calculate initial viewport
  const viewportInitialized = useRef(false);
  useEffect(() => {
    if (!mapData || !containerRef.current || viewportInitialized.current) return;
    viewportInitialized.current = true;
    const vw = containerRef.current.clientWidth;
    const vh = containerRef.current.clientHeight;
    const initZoom = Math.min(vw / mapData.width, vh / mapData.height) * 0.9;
    setZoom(initZoom);
    setOffset({
      x: (vw - mapData.width * initZoom) / 2,
      y: (vh - mapData.height * initZoom) / 2,
    });
  }, [mapData]);

  // Load cloud data
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

  // Save completed
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

  const toggleExpanded = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const toggleSubType = useCallback((types: string[]) => {
    setDisabledSubTypes(prev => {
      const next = new Set(prev);
      const allDisabled = types.every(t => next.has(t));
      if (allDisabled) {
        types.forEach(t => next.delete(t));
      } else {
        types.forEach(t => next.add(t));
      }
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
      if (disabledSubTypes.has(p.type)) return false;
      if (hideCompleted && completed.has(p.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q);
      }
      return true;
    });
  }, [mapData, activeCategories, disabledSubTypes, hideCompleted, completed, searchQuery]);

  // Cluster POIs
  const clusters = useMemo(() => {
    const clusterRadius = 30 / zoom;
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

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastOffset.current = { ...offset };
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging.current) {
      setOffset({
        x: lastOffset.current.x + (e.touches[0].clientX - dragStart.current.x),
        y: lastOffset.current.y + (e.touches[0].clientY - dragStart.current.y),
      });
    } else if (e.touches.length === 2 && lastTouchDist.current > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / lastTouchDist.current;
      const newZoom = Math.max(0.02, Math.min(2, zoom * factor));
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = lastTouchCenter.current.x - rect.left;
        const cy = lastTouchCenter.current.y - rect.top;
        setOffset(prev => ({
          x: cx - (cx - prev.x) * (newZoom / zoom),
          y: cy - (cy - prev.y) * (newZoom / zoom),
        }));
      }
      setZoom(newZoom);
      lastTouchDist.current = dist;
    }
  }, [zoom]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastTouchDist.current = 0;
  }, []);

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

  // Track tile loading
  const handleTileLoad = useCallback((key: string) => {
    setLoadedTiles(prev => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      setTilesLoaded(next.size);
      return next;
    });
  }, []);

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

  const subTypeStats = useMemo(() => {
    if (!mapData) return {};
    const s: Record<string, { total: number; done: number }> = {};
    for (const p of mapData.pois) {
      if (!s[p.type]) s[p.type] = { total: 0, done: 0 };
      s[p.type].total++;
      if (completed.has(p.id)) s[p.type].done++;
    }
    return s;
  }, [mapData, completed]);

  const getSubTypeGroupStats = useCallback((types: string[]) => {
    let total = 0, done = 0;
    for (const t of types) {
      const s = subTypeStats[t];
      if (s) { total += s.total; done += s.done; }
    }
    return { total, done };
  }, [subTypeStats]);

  const resetProgress = useCallback(() => {
    if (confirm('Reset all completion progress for Valley IV? This cannot be undone.')) {
      setCompleted(new Set());
      localStorage.removeItem(STORAGE_KEY);
      if (token) {
        syncToCloud('mapValleyIV', [], token).catch(() => {});
      }
    }
  }, [token]);

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

  const totalDone = [...completed].length;
  const totalPois = mapData.pois.length;

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="h-10 flex items-center gap-3 px-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-50">
        <Link href="/map" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="diamond-sm bg-[var(--color-accent)]" />
          <span className="font-mono text-xs text-[var(--color-accent)] uppercase tracking-wider font-bold">Valley IV</span>
        </div>
        <span className="text-[var(--color-text-muted)] text-xs font-mono hidden sm:inline">|</span>
        <span className="text-[var(--color-text-secondary)] text-xs font-mono hidden sm:inline">{totalDone} / {totalPois} completed</span>
        <div className="ml-auto flex items-center gap-2">
          {token && syncStatus !== 'idle' && (
            <div className="flex items-center gap-1">
              {syncStatus === 'syncing' && <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />}
              {syncStatus === 'synced' && <Cloud size={16} className="text-green-400" />}
              {syncStatus === 'error' && <CloudOff size={16} className="text-red-400" />}
            </div>
          )}
          <span className="text-[var(--color-text-muted)] text-xs font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:text-[var(--color-accent)] text-[var(--color-text-secondary)] transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* ─── Sidebar: Filters ─── */}
        {sidebarOpen && (
          <div className="w-80 max-w-[85vw] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col z-40 shrink-0 shadow-[var(--shadow-card)]">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--color-accent)]" />
                <span className="text-base font-bold text-white">Filters</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetProgress} className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors" title="Reset progress">
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-[var(--color-text-muted)] hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="text-[11px] text-[var(--color-text-muted)] mb-1.5 font-mono uppercase">Search points of interest...</div>
              <div className="relative">
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text" placeholder="Search POIs..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-white px-8 py-1.5 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* All / Clear */}
            <div className="p-3 flex gap-2 border-b border-[var(--color-border)]">
              <button
                onClick={() => { setActiveCategories(new Set(Object.keys(CATEGORY_CONFIG))); setDisabledSubTypes(new Set()); }}
                className="flex-1 text-xs py-1.5 bg-[var(--color-accent)] text-black font-bold uppercase tracking-wider"
              >All</button>
              <button
                onClick={() => setActiveCategories(new Set())}
                className="flex-1 text-xs py-1.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] uppercase tracking-wider transition-colors"
              >Clear</button>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
                const s = stats[cat] || { total: 0, done: 0 };
                const isActive = activeCategories.has(cat);
                const isExpanded = expandedCategories.has(cat);
                const hasSubTypes = cfg.subTypes && cfg.subTypes.length > 0;

                return (
                  <div key={cat} className="border-b border-[var(--color-border)]/30">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? '' : 'opacity-40'
                        }`}
                      >
                        <div className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                          isActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
                        }`}>
                          {isActive && <Check size={10} className="text-black" />}
                        </div>
                      </button>

                      <button
                        onClick={() => hasSubTypes ? toggleExpanded(cat) : toggleCategory(cat)}
                        className={`flex-1 flex items-center gap-2 py-2.5 pr-3 text-left transition-colors ${
                          isActive ? '' : 'opacity-40'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${ICON_BASE}/${cfg.icon}.png`} alt="" className="w-5 h-5 shrink-0" />
                        <span className="flex-1 text-white text-sm font-semibold">{cfg.label}</span>
                        <span className="text-[11px] font-mono" style={{ color: cfg.color }}>
                          {s.done}/{s.total}
                        </span>
                        {hasSubTypes && (
                          isExpanded
                            ? <ChevronDown size={16} className="text-[var(--color-text-muted)] shrink-0" />
                            : <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0" />
                        )}
                      </button>
                    </div>

                    {hasSubTypes && isExpanded && isActive && (
                      <div className="pb-2 px-2">
                        <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ borderLeft: `2px solid ${cfg.color}` }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`${ICON_BASE}/${cfg.icon}.png`} alt="" className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase" style={{ color: cfg.color }}>Total: {s.done} / {s.total}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          {cfg.subTypes!.map((st) => {
                            const stStats = getSubTypeGroupStats(st.types);
                            const isSubEnabled = !st.types.every(t => disabledSubTypes.has(t));
                            return (
                              <button
                                key={st.label}
                                onClick={() => toggleSubType(st.types)}
                                className={`flex items-center gap-1.5 p-1.5 border text-left transition-all ${
                                  isSubEnabled
                                    ? 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)]'
                                    : 'border-transparent bg-transparent opacity-30'
                                }`}
                              >
                                <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                                  isSubEnabled ? 'border-green-500 bg-green-500/20' : 'border-[var(--color-border)]'
                                }`}>
                                  {isSubEnabled && <Check size={8} className="text-green-400" />}
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`${ICON_BASE}/${st.icon}.png`} alt="" className="w-4 h-4 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] text-white font-medium truncate">{st.label}</div>
                                  <div className="text-[11px] font-mono" style={{ color: cfg.color }}>{stStats.done}/{stStats.total}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom controls */}
            <div className="p-3 border-t border-[var(--color-border)] space-y-1">
              <button
                onClick={() => setHideCompleted(!hideCompleted)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                {hideCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{hideCompleted ? 'Show Completed' : 'Hide Completed'}</span>
              </button>
              <button
                onClick={() => setShowZoneLabels(!showZoneLabels)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <Layers size={16} />
                <span>{showZoneLabels ? 'Hide Zone Labels' : 'Show Zone Labels'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── Map SVG ─── */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-black cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* SVG tile layer */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            <g
              transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}
              style={{ willChange: 'transform' }}
            >
              {allTiles.map(tile => (
                <image
                  key={tile.key}
                  href={tile.src}
                  x={tile.x}
                  y={tile.y}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  onLoad={() => handleTileLoad(tile.key)}
                  onError={() => handleTileLoad(tile.key)}
                />
              ))}

              {/* Zone labels */}
              {showZoneLabels && mapData.zoneLabels && mapData.zoneLabels.map(z => (
                <text
                  key={z.id}
                  x={z.x}
                  y={z.y}
                  fontSize={14 / zoom}
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    textShadow: '0 0 8px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.05em',
                    fontFamily: 'system-ui',
                    paintOrder: 'stroke fill',
                    stroke: 'rgba(0,0,0,0.95)',
                    strokeWidth: 3 / zoom,
                  }}
                >
                  {z.name.toUpperCase()}
                </text>
              ))}
            </g>
          </svg>

          {/* Tile loading progress */}
          {tilesLoaded < tilesTotal && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[var(--color-surface)]/95 border border-[var(--color-border)] px-4 py-2 backdrop-blur-sm shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />
                <span className="text-sm font-mono text-[var(--color-accent)]">
                  LOADING TILES {tilesLoaded}/{tilesTotal}
                </span>
              </div>
              <div className="mt-1.5 h-1 bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300"
                  style={{ width: `${(tilesLoaded / tilesTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

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
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-black/50 transition-all hover:scale-125 hover:z-10 ${allDone ? 'opacity-40 grayscale' : ''}`}
                    style={{ backgroundColor: cat?.color || '#888' }}
                    title={isMulti ? `${cluster.pois.length} POIs` : p.name || p.type}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${ICON_BASE}/${iconName}.png`} alt="" className="w-full h-full object-contain p-0.5" draggable={false} />
                    {isMulti && (
                      <div className="absolute -top-1.5 -right-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 bg-black border-2 border-white text-[10px] font-bold text-white">
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

          {/* POI Count Badge */}
          <div className="absolute top-3 right-3 z-30 bg-[var(--color-surface)]/90 border border-[var(--color-border)] px-3 py-1.5 backdrop-blur-sm shadow-[var(--shadow-card)]">
            <span className="text-sm font-mono text-[var(--color-accent)]">{visiblePois.length}</span>
            <span className="text-sm font-mono text-[var(--color-text-muted)]"> POIs visible</span>
          </div>

          {/* Right Side Controls */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 shadow-[var(--shadow-card)]">
            <button
              onClick={() => setShowZoneLabels(!showZoneLabels)}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                showZoneLabels
                  ? 'bg-[var(--color-surface)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
              title="Toggle zone labels"
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                hideCompleted
                  ? 'bg-[var(--color-surface)] border-green-500 text-green-400'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
              title={hideCompleted ? 'Show completed POIs' : 'Hide completed POIs'}
            >
              <CheckCircle2 size={18} />
            </button>

            <div className="h-1" />

            <button
              onClick={() => zoomTo(zoom * 1.3)}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={() => zoomTo(zoom / 1.3)}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={fitMap}
              className="w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)] transition-colors"
              title="Fit map to view"
            >
              <Maximize2 size={18} />
            </button>

            <div className="w-9 h-6 bg-[var(--color-surface)]/80 border border-[var(--color-border)] flex items-center justify-center">
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-30 w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors shadow-[var(--shadow-card)]"
              title="Open filters"
            >
              <Filter size={18} />
            </button>
          )}
        </div>

        {/* POI Detail Panel */}
        {selectedPoi && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 max-w-sm w-full mx-4 clip-corner-tl shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ICON_BASE}/${getEntityIcon(selectedPoi.type)}.png`} alt="" className="w-10 h-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base">{selectedPoi.name || selectedPoi.sub || selectedPoi.type}</div>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase mt-0.5">
                  {selectedPoi.cat} {selectedPoi.sub ? `/ ${selectedPoi.sub}` : ''}
                </div>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)]">
                  {mapData.zones[selectedPoi.zone] || selectedPoi.zone}
                </div>
              </div>
              <button onClick={() => setSelectedPoi(null)} className="text-[var(--color-text-muted)] hover:text-white shrink-0 transition-colors">
                <X size={18} />
              </button>
            </div>
            <button
              onClick={() => toggleComplete(selectedPoi.id)}
              className={`mt-3 w-full py-2 text-sm font-bold uppercase tracking-wider border transition-all ${
                completed.has(selectedPoi.id)
                  ? 'bg-green-900/30 border-green-600 text-green-400 hover:bg-green-900/50'
                  : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
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
