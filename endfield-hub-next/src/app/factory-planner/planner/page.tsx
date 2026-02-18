'use client';

import React, { useRef, useEffect, useState, useReducer, useCallback } from 'react';
import {
  FileText,
  Database,
  Building2,
  Edit3,
  Maximize2,
  Undo2,
  Redo2,
  Infinity,
  Bus,
  Grid3x3,
  List,
  X,
  Search,
  Star,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Settings2,
  Trash2,
  RotateCw,
  Copy,
  MousePointer2,
} from 'lucide-react';

// ──── Building Data Types ────

interface Building {
  id: string;
  name: string;
  category: 'Production' | 'Processing' | 'Storage' | 'Utility' | 'Logistics' | 'Plots';
  size: { width: number; height: number };
  inputs: number;
  outputs: number;
  power: number;
  description: string;
  isFavorite?: boolean;
}

interface PlacedBuilding {
  buildingId: string;
  x: number;
  y: number;
  rotation: number;
}

interface GridState {
  buildings: PlacedBuilding[];
  history: PlacedBuilding[][];
  historyIndex: number;
}

// ──── Outpost Configurations ────
// AIC factory field sizes based on outpost upgrade levels
// PAC base is 9x9 centered in the field
// Dimensions are approximate based on game progression data
interface OutpostConfig {
  id: string;
  name: string;
  label: string;
  gridWidth: number;
  gridHeight: number;
  description: string;
  cost?: string;
  pacType: 'pac' | 'sub-pac';
  depotBusSides: number;
}

const OUTPOST_CONFIGS: OutpostConfig[] = [
  {
    id: 'pac-base',
    name: 'PAC - Base',
    label: 'Base',
    gridWidth: 32,
    gridHeight: 32,
    description: 'Default Core AIC Area',
    pacType: 'pac',
    depotBusSides: 2,
  },
  {
    id: 'pac-expansion-1',
    name: 'PAC - Expansion I',
    label: 'Exp. I',
    gridWidth: 44,
    gridHeight: 44,
    description: 'Expanded Core AIC Area',
    cost: '20,000 Valley Stock Bills',
    pacType: 'pac',
    depotBusSides: 2,
  },
  {
    id: 'pac-expansion-2',
    name: 'PAC - Expansion II',
    label: 'Exp. II',
    gridWidth: 56,
    gridHeight: 56,
    description: 'Maximum Core AIC Area',
    cost: '160,000 Valley Stock Bills',
    pacType: 'pac',
    depotBusSides: 2,
  },
  {
    id: 'sub-pac-base',
    name: 'Sub-PAC - Base',
    label: 'Sub Base',
    gridWidth: 28,
    gridHeight: 28,
    description: 'Default Outpost Area',
    pacType: 'sub-pac',
    depotBusSides: 1,
  },
  {
    id: 'sub-pac-expansion-1',
    name: 'Sub-PAC - Expansion I',
    label: 'Sub Exp. I',
    gridWidth: 38,
    gridHeight: 38,
    description: 'Expanded Outpost Area',
    cost: '20,000 Valley Stock Bills',
    pacType: 'sub-pac',
    depotBusSides: 1,
  },
  {
    id: 'sub-pac-expansion-2',
    name: 'Sub-PAC - Expansion II',
    label: 'Sub Exp. II',
    gridWidth: 48,
    gridHeight: 48,
    description: 'Maximum Outpost Area',
    cost: '160,000 Valley Stock Bills',
    pacType: 'sub-pac',
    depotBusSides: 1,
  },
];

// ──── Building Database ────

const BUILDINGS: Building[] = [
  // PRODUCTION
  { id: 'external-water-port', name: 'External Water Port', category: 'Production', size: { width: 2, height: 1 }, inputs: 0, outputs: 1, power: 0, description: 'Provides water resources' },

  // PROCESSING
  { id: 'refining-unit', name: 'Refining Unit', category: 'Processing', size: { width: 3, height: 3 }, inputs: 4, outputs: 4, power: 5, description: 'Smelts ores into refined materials', isFavorite: true },
  { id: 'shredding-unit', name: 'Shredding Unit', category: 'Processing', size: { width: 3, height: 3 }, inputs: 3, outputs: 3, power: 5, description: 'Breaks materials into powder' },
  { id: 'moulding-unit', name: 'Moulding Unit', category: 'Processing', size: { width: 3, height: 3 }, inputs: 3, outputs: 3, power: 10, description: 'Shapes materials' },
  { id: 'filling-unit', name: 'Filling Unit', category: 'Processing', size: { width: 6, height: 4 }, inputs: 7, outputs: 6, power: 20, description: 'Combines inputs into products' },
  { id: 'fitting-unit', name: 'Fitting Unit', category: 'Processing', size: { width: 3, height: 3 }, inputs: 3, outputs: 3, power: 20, description: 'Assembles components' },
  { id: 'gearing-unit', name: 'Gearing Unit', category: 'Processing', size: { width: 6, height: 4 }, inputs: 6, outputs: 6, power: 10, description: 'Produces gears' },
  { id: 'grinding-unit', name: 'Grinding Unit', category: 'Processing', size: { width: 6, height: 4 }, inputs: 6, outputs: 6, power: 50, description: 'Grinds materials' },
  { id: 'packaging-unit', name: 'Packaging Unit', category: 'Processing', size: { width: 6, height: 4 }, inputs: 6, outputs: 6, power: 20, description: 'Packages products' },
  { id: 'planting-unit', name: 'Planting Unit', category: 'Processing', size: { width: 5, height: 5 }, inputs: 6, outputs: 5, power: 20, description: 'Grows crops' },
  { id: 'seed-picking-unit', name: 'Seed-Picking Unit', category: 'Processing', size: { width: 5, height: 5 }, inputs: 5, outputs: 5, power: 10, description: 'Picks seeds' },
  { id: 'separating-unit', name: 'Separating Unit', category: 'Processing', size: { width: 6, height: 4 }, inputs: 6, outputs: 7, power: 20, description: 'Separates materials' },
  { id: 'reactor-crucible', name: 'Reactor Crucible', category: 'Processing', size: { width: 5, height: 5 }, inputs: 4, outputs: 4, power: 50, description: 'Chemical reactor' },
  { id: 'forge-of-the-sky', name: 'Forge of the Sky', category: 'Processing', size: { width: 5, height: 5 }, inputs: 6, outputs: 5, power: 50, description: 'Produces Xiranite' },

  // STORAGE
  { id: 'depot-bus-port', name: 'Depot Bus Port', category: 'Storage', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Connects to depot bus' },
  { id: 'depot-bus-section', name: 'Depot Bus Section', category: 'Storage', size: { width: 4, height: 8 }, inputs: 0, outputs: 0, power: 0, description: 'Bus segment' },
  { id: 'depot-loader', name: 'Depot Loader', category: 'Storage', size: { width: 3, height: 1 }, inputs: 1, outputs: 0, power: 0, description: 'Loads items INTO depot', isFavorite: true },
  { id: 'depot-unloader', name: 'Depot Unloader', category: 'Storage', size: { width: 3, height: 1 }, inputs: 0, outputs: 1, power: 0, description: 'Unloads items FROM depot', isFavorite: true },
  { id: 'protocol-stash', name: 'Protocol Stash', category: 'Storage', size: { width: 3, height: 3 }, inputs: 3, outputs: 3, power: 5, description: 'Direct depot access' },

  // UTILITY
  { id: 'electric-pylon', name: 'Electric Pylon', category: 'Utility', size: { width: 2, height: 2 }, inputs: 0, outputs: 0, power: 0, description: 'Wirelessly powers nearby facilities', isFavorite: true },
  { id: 'relay-tower', name: 'Relay Tower', category: 'Utility', size: { width: 3, height: 3 }, inputs: 0, outputs: 0, power: 0, description: 'Extends power grid (80m, line of sight)' },
  { id: 'xiranite-pylon', name: 'Xiranite Pylon', category: 'Utility', size: { width: 2, height: 2 }, inputs: 0, outputs: 0, power: 0, description: 'Special power pylon' },

  // LOGISTICS
  { id: 'conveyor-splitter', name: 'Conveyor Splitter', category: 'Logistics', size: { width: 1, height: 1 }, inputs: 1, outputs: 3, power: 0, description: 'Splits conveyor flow' },
  { id: 'conveyor-merger', name: 'Conveyor Merger', category: 'Logistics', size: { width: 1, height: 1 }, inputs: 3, outputs: 1, power: 0, description: 'Merges conveyor flow' },
  { id: 'pipe-splitter', name: 'Pipe Splitter', category: 'Logistics', size: { width: 1, height: 1 }, inputs: 1, outputs: 3, power: 0, description: 'Splits pipe flow' },
  { id: 'pipe-merger', name: 'Pipe Merger', category: 'Logistics', size: { width: 1, height: 1 }, inputs: 3, outputs: 1, power: 0, description: 'Merges pipe flow' },
  { id: 'memo-beacon', name: 'Memo Beacon', category: 'Logistics', size: { width: 1, height: 1 }, inputs: 0, outputs: 0, power: 0, description: 'Marks locations' },
  { id: 'sprinkler', name: 'Sprinkler', category: 'Logistics', size: { width: 3, height: 3 }, inputs: 1, outputs: 0, power: 10, description: 'Distributes liquids' },
  { id: 'easy-stash', name: 'Easy Stash', category: 'Logistics', size: { width: 3, height: 3 }, inputs: 0, outputs: 0, power: 5, description: 'Simple storage solution' },
  { id: 'sub-pac', name: 'Sub-PAC', category: 'Logistics', size: { width: 9, height: 9 }, inputs: 14, outputs: 6, power: 0, description: 'Sub Protocol Anchor Core for outposts' },

  // PLOTS
  { id: 'reed-rye-plot-t1', name: 'Reed Rye Plot T1', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows reed rye tier 1' },
  { id: 'reed-rye-plot-t2', name: 'Reed Rye Plot T2', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows reed rye tier 2' },
  { id: 'reed-rye-plot-t3', name: 'Reed Rye Plot T3', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows reed rye tier 3' },
  { id: 'reed-rye-plot-t4', name: 'Reed Rye Plot T4', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows reed rye tier 4' },
  { id: 'buckflower-plot-t1', name: 'Buckflower Plot T1', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows buckflower tier 1' },
  { id: 'buckflower-plot-t2', name: 'Buckflower Plot T2', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows buckflower tier 2' },
  { id: 'buckflower-plot-t3', name: 'Buckflower Plot T3', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows buckflower tier 3' },
  { id: 'jincao-plot-t1', name: 'Jincao Plot T1', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows jincao tier 1' },
  { id: 'jincao-plot-t2', name: 'Jincao Plot T2', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows jincao tier 2' },
  { id: 'aketine-plot', name: 'Aketine Plot', category: 'Plots', size: { width: 4, height: 4 }, inputs: 0, outputs: 0, power: 0, description: 'Grows aketine' },
];

const CATEGORY_COLORS: Record<Building['category'], string> = {
  Production: '#22c55e',
  Processing: '#3b82f6',
  Storage: '#f97316',
  Utility: '#06b6d4',
  Logistics: '#eab308',
  Plots: '#10b981',
};

type ToolMode = 'select' | 'build' | 'delete' | 'move';

interface State {
  grid: GridState;
  selectedBuilding: string | null;
  toolMode: ToolMode;
  showBuildingPicker: boolean;
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'list' | 'grid';
  showConveyors: boolean;
  showPipes: boolean;
  showStats: boolean;
  showAnim: boolean;
  autoConnect: boolean;
  showBus: boolean;
  speed: number;
  showFileMenu: boolean;
  showDataMenu: boolean;
  showEditMenu: boolean;
  outpostConfig: string;
  showOutpostMenu: boolean;
}

type Action =
  | { type: 'PLACE_BUILDING'; building: PlacedBuilding }
  | { type: 'REMOVE_BUILDING'; index: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_GRID' }
  | { type: 'SET_SELECTED_BUILDING'; buildingId: string | null }
  | { type: 'SET_TOOL_MODE'; mode: ToolMode }
  | { type: 'TOGGLE_BUILDING_PICKER' }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_VIEW_MODE'; mode: 'list' | 'grid' }
  | { type: 'TOGGLE_CONVEYORS' }
  | { type: 'TOGGLE_PIPES' }
  | { type: 'TOGGLE_STATS' }
  | { type: 'TOGGLE_ANIM' }
  | { type: 'TOGGLE_AUTO_CONNECT' }
  | { type: 'TOGGLE_BUS' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'TOGGLE_FILE_MENU' }
  | { type: 'TOGGLE_DATA_MENU' }
  | { type: 'TOGGLE_EDIT_MENU' }
  | { type: 'SET_OUTPOST_CONFIG'; config: string }
  | { type: 'TOGGLE_OUTPOST_MENU' }
  | { type: 'CLOSE_ALL_MENUS' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PLACE_BUILDING': {
      const newBuildings = [...state.grid.buildings, action.building];
      const newHistory = state.grid.history.slice(0, state.grid.historyIndex + 1);
      return {
        ...state,
        grid: {
          buildings: newBuildings,
          history: [...newHistory, newBuildings],
          historyIndex: newHistory.length,
        },
      };
    }
    case 'REMOVE_BUILDING': {
      const filteredBuildings = state.grid.buildings.filter((_, i) => i !== action.index);
      const removeHistory = state.grid.history.slice(0, state.grid.historyIndex + 1);
      return {
        ...state,
        grid: {
          buildings: filteredBuildings,
          history: [...removeHistory, filteredBuildings],
          historyIndex: removeHistory.length,
        },
      };
    }
    case 'UNDO':
      if (state.grid.historyIndex > 0) {
        return {
          ...state,
          grid: {
            ...state.grid,
            buildings: state.grid.history[state.grid.historyIndex - 1],
            historyIndex: state.grid.historyIndex - 1,
          },
        };
      }
      return state;
    case 'REDO':
      if (state.grid.historyIndex < state.grid.history.length - 1) {
        return {
          ...state,
          grid: {
            ...state.grid,
            buildings: state.grid.history[state.grid.historyIndex + 1],
            historyIndex: state.grid.historyIndex + 1,
          },
        };
      }
      return state;
    case 'CLEAR_GRID':
      return {
        ...state,
        grid: { buildings: [], history: [[]], historyIndex: 0 },
      };
    case 'SET_SELECTED_BUILDING':
      return { ...state, selectedBuilding: action.buildingId };
    case 'SET_TOOL_MODE':
      return { ...state, toolMode: action.mode };
    case 'TOGGLE_BUILDING_PICKER':
      return { ...state, showBuildingPicker: !state.showBuildingPicker };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'TOGGLE_CONVEYORS':
      return { ...state, showConveyors: !state.showConveyors };
    case 'TOGGLE_PIPES':
      return { ...state, showPipes: !state.showPipes };
    case 'TOGGLE_STATS':
      return { ...state, showStats: !state.showStats };
    case 'TOGGLE_ANIM':
      return { ...state, showAnim: !state.showAnim };
    case 'TOGGLE_AUTO_CONNECT':
      return { ...state, autoConnect: !state.autoConnect };
    case 'TOGGLE_BUS':
      return { ...state, showBus: !state.showBus };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'TOGGLE_FILE_MENU':
      return { ...state, showFileMenu: !state.showFileMenu, showDataMenu: false, showEditMenu: false, showOutpostMenu: false };
    case 'TOGGLE_DATA_MENU':
      return { ...state, showDataMenu: !state.showDataMenu, showFileMenu: false, showEditMenu: false, showOutpostMenu: false };
    case 'TOGGLE_EDIT_MENU':
      return { ...state, showEditMenu: !state.showEditMenu, showFileMenu: false, showDataMenu: false, showOutpostMenu: false };
    case 'SET_OUTPOST_CONFIG':
      return { ...state, outpostConfig: action.config, showOutpostMenu: false };
    case 'TOGGLE_OUTPOST_MENU':
      return { ...state, showOutpostMenu: !state.showOutpostMenu, showFileMenu: false, showDataMenu: false, showEditMenu: false };
    case 'CLOSE_ALL_MENUS':
      return { ...state, showFileMenu: false, showDataMenu: false, showEditMenu: false, showOutpostMenu: false };
    default:
      return state;
  }
}

const initialState: State = {
  grid: { buildings: [], history: [[]], historyIndex: 0 },
  selectedBuilding: null,
  toolMode: 'select',
  showBuildingPicker: false,
  searchQuery: '',
  selectedCategory: 'All',
  viewMode: 'list',
  showConveyors: true,
  showPipes: true,
  showStats: false,
  showAnim: false,
  autoConnect: false,
  showBus: false,
  speed: 1,
  showFileMenu: false,
  showDataMenu: false,
  showEditMenu: false,
  outpostConfig: 'pac-base',
  showOutpostMenu: false,
};

// ──── Toolbar Button Components ────

function ToolbarButton({
  children,
  active,
  onClick,
  title,
  className = '',
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-1.5 border border-[var(--color-border)] text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap ${
        active
          ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
          : 'bg-[var(--color-surface-2)] text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[var(--color-border)] mx-0.5 flex-shrink-0" />;
}

// ──── Main Component ────

export default function FactoryPlannerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.45);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const CELL_SIZE = 40;
  const activeConfig = OUTPOST_CONFIGS.find(c => c.id === state.outpostConfig) || OUTPOST_CONFIGS[0];
  const GRID_WIDTH = activeConfig.gridWidth;
  const GRID_HEIGHT = activeConfig.gridHeight;
  const PAC_SIZE = 9;
  const PAC_X = Math.floor((GRID_WIDTH - PAC_SIZE) / 2);
  const PAC_Y = Math.floor((GRID_HEIGHT - PAC_SIZE) / 2);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        dispatch({ type: 'CLOSE_ALL_MENUS' });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(container);
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setCanvasSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }
    return () => observer.disconnect();
  }, []);

  // Canvas rendering
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Transform
    ctx.save();
    ctx.translate(pan.x + canvasSize.width / 2, pan.y + canvasSize.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-GRID_WIDTH * CELL_SIZE / 2, -GRID_HEIGHT * CELL_SIZE / 2);

    // Grid background
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Grid lines
    ctx.strokeStyle = '#1e2230';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Major grid lines every 5 cells
    ctx.strokeStyle = '#2a3040';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= GRID_WIDTH; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Coordinate labels every 5 cells
    ctx.fillStyle = '#4a5568';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let x = 0; x <= GRID_WIDTH; x += 5) {
      ctx.fillText(x.toString(), x * CELL_SIZE, -4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= GRID_HEIGHT; y += 5) {
      ctx.fillText(y.toString(), -6, y * CELL_SIZE);
    }

    // ── PAC Drawing ──
    const pacX = PAC_X * CELL_SIZE;
    const pacY = PAC_Y * CELL_SIZE;
    const pacWidth = PAC_SIZE * CELL_SIZE;
    const pacHeight = PAC_SIZE * CELL_SIZE;

    // PAC shadow/glow
    ctx.shadowColor = '#00b0ff40';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#0a2a3a';
    ctx.fillRect(pacX, pacY, pacWidth, pacHeight);
    ctx.shadowBlur = 0;

    // PAC inner grid
    ctx.strokeStyle = '#1a4050';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= PAC_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(pacX + x * CELL_SIZE, pacY);
      ctx.lineTo(pacX + x * CELL_SIZE, pacY + pacHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= PAC_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(pacX, pacY + y * CELL_SIZE);
      ctx.lineTo(pacX + pacWidth, pacY + y * CELL_SIZE);
      ctx.stroke();
    }

    // PAC border
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(pacX + 1.5, pacY + 1.5, pacWidth - 3, pacHeight - 3);

    // Corner decorations
    const cornerSize = 12;
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pacX, pacY + cornerSize); ctx.lineTo(pacX, pacY); ctx.lineTo(pacX + cornerSize, pacY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pacX + pacWidth - cornerSize, pacY); ctx.lineTo(pacX + pacWidth, pacY); ctx.lineTo(pacX + pacWidth, pacY + cornerSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pacX, pacY + pacHeight - cornerSize); ctx.lineTo(pacX, pacY + pacHeight); ctx.lineTo(pacX + cornerSize, pacY + pacHeight); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pacX + pacWidth - cornerSize, pacY + pacHeight); ctx.lineTo(pacX + pacWidth, pacY + pacHeight); ctx.lineTo(pacX + pacWidth, pacY + pacHeight - cornerSize); ctx.stroke();

    // ── PAC PORTS ──
    const portCellSize = CELL_SIZE * 0.85;

    // TOP: 8 green INPUT ports
    const topInputCount = 8;
    for (let i = 0; i < topInputCount; i++) {
      const pX = pacX + (i + 0.5) * (pacWidth / topInputCount) - portCellSize / 2;
      const pY = pacY - portCellSize - 4;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(pX, pY, portCellSize, portCellSize);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, portCellSize, portCellSize);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = pX + portCellSize / 2;
      const cy = pY + portCellSize / 2;
      ctx.moveTo(cx, cy + 9);
      ctx.lineTo(cx - 7, cy - 3);
      ctx.lineTo(cx + 7, cy - 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('INPUT PORTS (INTO DEPOT)', pacX + pacWidth / 2, pacY - portCellSize - 10);

    // BOTTOM: 8 green INPUT ports
    const bottomInputCount = 8;
    for (let i = 0; i < bottomInputCount; i++) {
      const pX = pacX + (i + 0.5) * (pacWidth / bottomInputCount) - portCellSize / 2;
      const pY = pacY + pacHeight + 4;
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(pX, pY, portCellSize, portCellSize);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, portCellSize, portCellSize);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = pX + portCellSize / 2;
      const cy = pY + portCellSize / 2;
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx - 7, cy + 3);
      ctx.lineTo(cx + 7, cy + 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('INPUT PORTS (INTO DEPOT)', pacX + pacWidth / 2, pacY + pacHeight + portCellSize + 10);

    // RIGHT: Output 1, 2, 3
    const sidePortOffsets = [2, 4, 6];
    sidePortOffsets.forEach((offset, i) => {
      const pX = pacX + pacWidth + 4;
      const pY = pacY + offset * CELL_SIZE + (CELL_SIZE - portCellSize) / 2;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(pX, pY, portCellSize, portCellSize);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, portCellSize, portCellSize);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 1).toString(), pX + portCellSize / 2, pY + portCellSize / 2);
    });
    ctx.save();
    ctx.translate(pacX + pacWidth + portCellSize + 16, pacY + pacHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUTPUT (FROM DEPOT)', 0, 0);
    ctx.restore();

    // LEFT: Output 4, 5, 6
    sidePortOffsets.forEach((offset, i) => {
      const pX = pacX - portCellSize - 4;
      const pY = pacY + offset * CELL_SIZE + (CELL_SIZE - portCellSize) / 2;
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(pX, pY, portCellSize, portCellSize);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pX, pY, portCellSize, portCellSize);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 4).toString(), pX + portCellSize / 2, pY + portCellSize / 2);
    });
    ctx.save();
    ctx.translate(pacX - portCellSize - 16, pacY + pacHeight / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUTPUT (FROM DEPOT)', 0, 0);
    ctx.restore();

    // PAC center text
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROTOCOL', pacX + pacWidth / 2, pacY + pacHeight / 2 - 28);
    ctx.fillText('ANCHOR', pacX + pacWidth / 2, pacY + pacHeight / 2 - 8);
    ctx.fillText('CORE', pacX + pacWidth / 2, pacY + pacHeight / 2 + 12);
    ctx.fillStyle = '#4a7a8a';
    ctx.font = '10px monospace';
    ctx.fillText('9 x 9', pacX + pacWidth / 2, pacY + pacHeight / 2 + 36);
    ctx.fillStyle = '#22c55e';
    ctx.font = '9px monospace';
    ctx.fillText('GREEN = Items INTO Depot', pacX + pacWidth / 2, pacY + pacHeight / 2 + 52);
    ctx.fillStyle = '#f97316';
    ctx.fillText('ORANGE = Items FROM Depot (6 total)', pacX + pacWidth / 2, pacY + pacHeight / 2 + 64);

    // Grid boundary
    ctx.strokeStyle = '#2a3040';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    ctx.setLineDash([]);

    // Field size label at top
    ctx.fillStyle = '#4a5568';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${activeConfig.name} — ${GRID_WIDTH} x ${GRID_HEIGHT} tiles`, GRID_WIDTH * CELL_SIZE / 2, -20);

    // Depot Bus indicators
    if (activeConfig.depotBusSides >= 1) {
      ctx.fillStyle = '#f9731630';
      ctx.fillRect(0, 0, 4, GRID_HEIGHT * CELL_SIZE);
      ctx.fillStyle = '#f97316';
      ctx.save();
      ctx.translate(10, GRID_HEIGHT * CELL_SIZE / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DEPOT BUS SIDE', 0, 0);
      ctx.restore();
    }
    if (activeConfig.depotBusSides >= 2) {
      ctx.fillStyle = '#f9731630';
      ctx.fillRect(GRID_WIDTH * CELL_SIZE - 4, 0, 4, GRID_HEIGHT * CELL_SIZE);
      ctx.fillStyle = '#f97316';
      ctx.save();
      ctx.translate(GRID_WIDTH * CELL_SIZE - 10, GRID_HEIGHT * CELL_SIZE / 2);
      ctx.rotate(Math.PI / 2);
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DEPOT BUS SIDE', 0, 0);
      ctx.restore();
    }

    // Placed buildings
    state.grid.buildings.forEach((placedBuilding) => {
      const building = BUILDINGS.find(b => b.id === placedBuilding.buildingId);
      if (!building) return;
      const x = placedBuilding.x * CELL_SIZE;
      const y = placedBuilding.y * CELL_SIZE;
      const width = building.size.width * CELL_SIZE;
      const height = building.size.height * CELL_SIZE;
      ctx.fillStyle = CATEGORY_COLORS[building.category] + '99';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = CATEGORY_COLORS[building.category];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      const fontSize = Math.min(width / 8, height / 3, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(building.name, x + width / 2, y + height / 2);
      if (width >= 3 * CELL_SIZE && height >= 3 * CELL_SIZE) {
        ctx.font = `${fontSize * 0.7}px sans-serif`;
        ctx.fillText(
          `I/O: ${building.inputs}/${building.outputs}${building.power > 0 ? ` | ${building.power}W` : ''}`,
          x + width / 2,
          y + height / 2 + fontSize + 4
        );
      }
    });

    ctx.restore();
  }, [pan, zoom, state.grid.buildings, canvasSize, GRID_WIDTH, GRID_HEIGHT, PAC_X, PAC_Y, activeConfig]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Auto zoom-to-fit when outpost config changes
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const gridPixelWidth = GRID_WIDTH * CELL_SIZE;
      const gridPixelHeight = GRID_HEIGHT * CELL_SIZE;
      const fitZoom = Math.min(
        canvasSize.width / (gridPixelWidth + 120),
        canvasSize.height / (gridPixelHeight + 120)
      );
      setPan({ x: 0, y: 0 });
      setZoom(Math.max(0.1, Math.min(2, fitZoom)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.outpostConfig]);

  // ── Helpers ──

  // Convert screen coords to grid coords
  const screenToGrid = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { gridX: -1, gridY: -1 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x - canvasSize.width / 2) / zoom + GRID_WIDTH * CELL_SIZE / 2;
    const y = (clientY - rect.top - pan.y - canvasSize.height / 2) / zoom + GRID_HEIGHT * CELL_SIZE / 2;
    return { gridX: Math.floor(x / CELL_SIZE), gridY: Math.floor(y / CELL_SIZE) };
  };

  // Check if a building overlaps any existing building
  const checkOverlap = (bx: number, by: number, bw: number, bh: number, excludeIndex?: number) => {
    return state.grid.buildings.some((pb, i) => {
      if (i === excludeIndex) return false;
      const def = BUILDINGS.find(b => b.id === pb.buildingId);
      if (!def) return false;
      return bx < pb.x + def.size.width && bx + bw > pb.x &&
             by < pb.y + def.size.height && by + bh > pb.y;
    });
  };

  // Find building at grid position
  const findBuildingAt = (gx: number, gy: number) => {
    for (let i = state.grid.buildings.length - 1; i >= 0; i--) {
      const pb = state.grid.buildings[i];
      const def = BUILDINGS.find(b => b.id === pb.buildingId);
      if (!def) continue;
      if (gx >= pb.x && gx < pb.x + def.size.width && gy >= pb.y && gy < pb.y + def.size.height) {
        return i;
      }
    }
    return -1;
  };

  // ── Save / Load ──

  const saveToLocalStorage = useCallback(() => {
    try {
      const data = {
        buildings: state.grid.buildings,
        outpostConfig: state.outpostConfig,
        version: 1,
      };
      localStorage.setItem('aic-planner-save', JSON.stringify(data));
    } catch { /* silently fail */ }
  }, [state.grid.buildings, state.outpostConfig]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem('aic-planner-save');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.buildings && Array.isArray(data.buildings)) {
        dispatch({ type: 'CLEAR_GRID' });
        data.buildings.forEach((b: PlacedBuilding) => {
          dispatch({ type: 'PLACE_BUILDING', building: b });
        });
        if (data.outpostConfig) {
          dispatch({ type: 'SET_OUTPOST_CONFIG', config: data.outpostConfig });
        }
      }
    } catch { /* silently fail */ }
  }, []);

  // ── Keyboard Shortcuts ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
        dispatch({ type: 'SET_SELECTED_BUILDING', buildingId: null });
        if (state.showBuildingPicker) dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
        dispatch({ type: 'CLOSE_ALL_MENUS' });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
      }
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
        if (!state.showBuildingPicker) dispatch({ type: 'SET_TOOL_MODE', mode: 'build' });
      }
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
      }
      if (e.key === 'x' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'SET_TOOL_MODE', mode: 'delete' });
      }
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        handleZoomToFit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.showBuildingPicker, saveToLocalStorage]);

  // ── Mouse handlers ──

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && (state.toolMode === 'select' || (state.toolMode === 'build' && !state.selectedBuilding))) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { gridX, gridY } = screenToGrid(e.clientX, e.clientY);

    // Delete mode: remove building at click location
    if (state.toolMode === 'delete') {
      const idx = findBuildingAt(gridX, gridY);
      if (idx >= 0) {
        dispatch({ type: 'REMOVE_BUILDING', index: idx });
      }
      return;
    }

    // Build mode: place building with overlap detection
    if (state.toolMode === 'build' && state.selectedBuilding) {
      const building = BUILDINGS.find(b => b.id === state.selectedBuilding);
      if (!building) return;

      const isOnPAC = gridX < PAC_X + PAC_SIZE && gridX + building.size.width > PAC_X &&
                      gridY < PAC_Y + PAC_SIZE && gridY + building.size.height > PAC_Y;

      const isOverlap = checkOverlap(gridX, gridY, building.size.width, building.size.height);

      if (gridX >= 0 && gridX + building.size.width <= GRID_WIDTH &&
          gridY >= 0 && gridY + building.size.height <= GRID_HEIGHT &&
          !isOnPAC && !isOverlap) {
        dispatch({
          type: 'PLACE_BUILDING',
          building: { buildingId: state.selectedBuilding, x: gridX, y: gridY, rotation: 0 },
        });
      }
    }

    // Select mode: click on a building to select it (for future operations)
    if (state.toolMode === 'select') {
      const idx = findBuildingAt(gridX, gridY);
      if (idx >= 0) {
        // TODO: Show building info panel
      }
    }
  };

  // Right-click to delete (context menu replacement)
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { gridX, gridY } = screenToGrid(e.clientX, e.clientY);
    const idx = findBuildingAt(gridX, gridY);
    if (idx >= 0) {
      dispatch({ type: 'REMOVE_BUILDING', index: idx });
    }
  };

  const handleBuildingSelect = (buildingId: string) => {
    dispatch({ type: 'SET_SELECTED_BUILDING', buildingId });
    dispatch({ type: 'SET_TOOL_MODE', mode: 'build' });
    dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
  };

  const handleZoomToFit = useCallback(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const gridPixelWidth = GRID_WIDTH * CELL_SIZE;
      const gridPixelHeight = GRID_HEIGHT * CELL_SIZE;
      const fitZoom = Math.min(
        canvasSize.width / (gridPixelWidth + 120),
        canvasSize.height / (gridPixelHeight + 120)
      );
      setPan({ x: 0, y: 0 });
      setZoom(Math.max(0.1, Math.min(2, fitZoom)));
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(0.45);
    }
  }, [canvasSize, GRID_WIDTH, GRID_HEIGHT]);

  // Filter buildings
  const filteredBuildings = BUILDINGS.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         building.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCategory = state.selectedCategory === 'All' ||
                           (state.selectedCategory === 'Favorite' && building.isFavorite) ||
                           building.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Favorite', 'Production', 'Processing', 'Storage', 'Utility', 'Logistics', 'Plots'];

  const totalPower = state.grid.buildings.reduce((sum, pb) => {
    const building = BUILDINGS.find(b => b.id === pb.buildingId);
    return sum + (building?.power || 0);
  }, 0);

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A] overflow-hidden">
      {/* ─── Top Bar: Title + Outpost Selector + Stats ─── */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-3 py-2 flex items-center gap-3 flex-shrink-0">
        <h1 className="text-sm font-bold text-white whitespace-nowrap">AIC Planner</h1>

        <ToolbarDivider />

        {/* Outpost Configuration Selector */}
        <div className="relative" data-menu>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_OUTPOST_MENU' })}
            className="px-2.5 py-1.5 bg-[#0a2a3a] hover:bg-[#0d3548] border border-[#00b0ff50] text-xs text-[#00b0ff] font-medium flex items-center gap-1.5 transition-all"
            title="Select outpost configuration"
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline">{activeConfig.name}</span>
            <span className="sm:hidden">{activeConfig.label}</span>
            <span className="text-[10px] text-[#00b0ff80]">({GRID_WIDTH}x{GRID_HEIGHT})</span>
            <ChevronDown size={12} />
          </button>
          {state.showOutpostMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-2xl py-1 min-w-[280px] z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Main PAC</div>
              {OUTPOST_CONFIGS.filter(c => c.pacType === 'pac').map(config => (
                <button
                  key={config.id}
                  onClick={() => dispatch({ type: 'SET_OUTPOST_CONFIG', config: config.id })}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 transition-colors ${
                    state.outpostConfig === config.id ? 'bg-[#00b0ff20] text-[#00b0ff]' : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium">{config.name}</div>
                    <div className="text-[10px] text-gray-500">{config.description}{config.cost ? ` — ${config.cost}` : ''}</div>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{config.gridWidth}x{config.gridHeight}</span>
                </button>
              ))}
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold border-t border-[var(--color-border)] mt-1">Sub-PAC (Outpost)</div>
              {OUTPOST_CONFIGS.filter(c => c.pacType === 'sub-pac').map(config => (
                <button
                  key={config.id}
                  onClick={() => dispatch({ type: 'SET_OUTPOST_CONFIG', config: config.id })}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 transition-colors ${
                    state.outpostConfig === config.id ? 'bg-[#00b0ff20] text-[#00b0ff]' : 'text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-medium">{config.name}</div>
                    <div className="text-[10px] text-gray-500">{config.description}{config.cost ? ` — ${config.cost}` : ''}</div>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{config.gridWidth}x{config.gridHeight}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Power readout */}
        <div className="text-[11px] text-gray-400 whitespace-nowrap">
          <span className="text-[var(--color-accent)] font-bold">{totalPower}W</span>
          <span className="hidden sm:inline"> Power</span>
        </div>

        {/* Buildings count */}
        <div className="text-[11px] text-gray-400 whitespace-nowrap">
          <span className="text-white font-bold">{state.grid.buildings.length}</span>
          <span className="hidden sm:inline"> Buildings</span>
        </div>

        <div className="flex-1" />

        {/* Zoom display */}
        <div className="text-[11px] text-gray-500 font-mono whitespace-nowrap">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* ─── Toolbar Row: ALL tools in one row ─── */}
      <div className="bg-[#111318] border-b border-[var(--color-border)] px-2 py-1 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
        {/* File menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_FILE_MENU' })} title="File operations">
            <FileText size={13} />
            <span className="hidden sm:inline">File</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showFileMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl py-1 min-w-[140px] z-50">
              <button onClick={() => { dispatch({ type: 'CLEAR_GRID' }); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors">New</button>
              <button onClick={() => { loadFromLocalStorage(); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors">Load <span className="text-gray-500 text-[10px]">Ctrl+L</span></button>
              <button onClick={() => { saveToLocalStorage(); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors">Save <span className="text-gray-500 text-[10px]">Ctrl+S</span></button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button className="w-full px-3 py-1.5 text-left text-xs text-gray-500 cursor-not-allowed">Export Image (coming soon)</button>
            </div>
          )}
        </div>

        {/* Data menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_DATA_MENU' })} title="Data operations">
            <Database size={13} />
            <span className="hidden sm:inline">Data</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showDataMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl py-1 min-w-[140px] z-50">
              <button className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors">Import JSON</button>
              <button className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors">Export JSON</button>
            </div>
          )}
        </div>

        {/* Edit menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_EDIT_MENU' })} title="Edit operations">
            <Edit3 size={13} />
            <span className="hidden sm:inline">Edit</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showEditMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-xl py-1 min-w-[140px] z-50">
              <button onClick={() => { dispatch({ type: 'SET_TOOL_MODE', mode: 'delete' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[#2A2A2A] transition-colors flex items-center gap-2"><Trash2 size={12} />Delete Mode <span className="text-gray-500 text-[10px] ml-auto">X</span></button>
              <button className="w-full px-3 py-1.5 text-left text-xs text-gray-500 cursor-not-allowed flex items-center gap-2"><RotateCw size={12} />Rotate (coming soon)</button>
              <button className="w-full px-3 py-1.5 text-left text-xs text-gray-500 cursor-not-allowed flex items-center gap-2"><Copy size={12} />Copy (coming soon)</button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button onClick={() => { dispatch({ type: 'CLEAR_GRID' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-[#2A2A2A] transition-colors flex items-center gap-2"><Trash2 size={12} />Clear All Buildings</button>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Tool mode: Select */}
        <ToolbarButton
          active={state.toolMode === 'select' && !state.showBuildingPicker}
          onClick={() => {
            dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
            if (state.showBuildingPicker) dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
          }}
          title="Select / Pan (drag to move)"
        >
          <MousePointer2 size={13} />
          <span className="hidden sm:inline">Select</span>
        </ToolbarButton>

        {/* Build */}
        <ToolbarButton
          active={state.showBuildingPicker}
          onClick={() => {
            dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
            if (!state.showBuildingPicker) {
              dispatch({ type: 'SET_TOOL_MODE', mode: 'build' });
            } else {
              dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
            }
          }}
          title="Open building library (B)"
        >
          <Building2 size={13} />
          Build
        </ToolbarButton>

        {/* Delete */}
        <ToolbarButton
          active={state.toolMode === 'delete'}
          onClick={() => dispatch({ type: 'SET_TOOL_MODE', mode: state.toolMode === 'delete' ? 'select' : 'delete' })}
          title="Delete buildings (X) - Right-click also deletes"
          className={state.toolMode === 'delete' ? '!bg-red-600 !border-red-600 !text-white' : ''}
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Del</span>
        </ToolbarButton>

        {/* Zoom to Fit */}
        <ToolbarButton onClick={handleZoomToFit} title="Zoom to fit entire grid">
          <Maximize2 size={13} />
          <span className="hidden md:inline">Fit</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => dispatch({ type: 'UNDO' })}
          title="Undo"
          className={state.grid.historyIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}
        >
          <Undo2 size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => dispatch({ type: 'REDO' })}
          title="Redo"
          className={state.grid.historyIndex === state.grid.history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}
        >
          <Redo2 size={13} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Toggles */}
        <ToolbarButton active={state.showConveyors} onClick={() => dispatch({ type: 'TOGGLE_CONVEYORS' })} title="Toggle conveyors">
          Conv.
        </ToolbarButton>
        <ToolbarButton active={state.showPipes} onClick={() => dispatch({ type: 'TOGGLE_PIPES' })} title="Toggle pipes">
          Pipes
        </ToolbarButton>
        <ToolbarButton active={state.showStats} onClick={() => dispatch({ type: 'TOGGLE_STATS' })} title="Toggle statistics overlay">
          Stats
        </ToolbarButton>
        <ToolbarButton active={state.showAnim} onClick={() => dispatch({ type: 'TOGGLE_ANIM' })} title="Toggle animations">
          Anim
        </ToolbarButton>
        <ToolbarButton active={state.autoConnect} onClick={() => dispatch({ type: 'TOGGLE_AUTO_CONNECT' })} title="Auto-connect buildings">
          <Infinity size={13} />
        </ToolbarButton>
        <ToolbarButton active={state.showBus} onClick={() => dispatch({ type: 'TOGGLE_BUS' })} title="Toggle depot bus">
          <Bus size={13} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Speed */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 5, 10].map((speed) => (
            <ToolbarButton
              key={speed}
              active={state.speed === speed}
              onClick={() => dispatch({ type: 'SET_SPEED', speed })}
              title={`Speed: ${speed}x`}
            >
              {speed}x
            </ToolbarButton>
          ))}
        </div>
      </div>

      {/* ─── Canvas Area (fills all remaining space) ─── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden min-h-0">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${state.toolMode === 'select' ? 'cursor-grab active:cursor-grabbing' : state.toolMode === 'delete' ? 'cursor-pointer' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
        />

        {/* Floating Zoom Controls (bottom-right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.25))}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomToFit}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors text-[10px] font-bold"
            title="Zoom to fit"
          >
            FIT
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        {/* Current tool mode indicator (bottom-left) */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className={`bg-[var(--color-surface)] border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${
            state.toolMode === 'delete' ? 'border-red-600 text-red-400' : 'border-[var(--color-border)] text-gray-400'
          }`}>
            {state.toolMode === 'build' && state.selectedBuilding
              ? `Placing: ${BUILDINGS.find(b => b.id === state.selectedBuilding)?.name || 'Unknown'}`
              : state.toolMode === 'select'
              ? 'Pan / Select — Right-click to delete'
              : state.toolMode === 'delete'
              ? 'Click building to delete — Esc to cancel'
              : state.toolMode}
          </div>
        </div>

        {/* ─── Building Picker Panel (overlay left) ─── */}
        {state.showBuildingPicker && (
          <div className="absolute top-0 left-0 h-full w-80 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-2xl z-20">
            {/* Panel Header */}
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Building Library</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
                  className={`p-1.5 transition-colors ${state.viewMode === 'list' ? 'bg-[var(--color-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
                  title="List view"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                  className={`p-1.5 transition-colors ${state.viewMode === 'grid' ? 'bg-[var(--color-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_BUILDING_PICKER' })}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search buildings..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
                  className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-[var(--color-border)] px-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', category })}
                  className={`px-2 py-1.5 whitespace-nowrap border-b-2 transition-all text-[11px] ${
                    state.selectedCategory === category
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Building List */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {filteredBuildings.map((building) => (
                  <button
                    key={building.id}
                    onClick={() => handleBuildingSelect(building.id)}
                    className="w-full p-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">
                            {building.name}
                          </h3>
                          {building.isFavorite && (
                            <Star size={10} className="text-[var(--color-accent)] fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{building.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span className="font-medium">{building.size.width}x{building.size.height}</span>
                          <span>I/O: {building.inputs}/{building.outputs}</span>
                          {building.power > 0 && (
                            <span className="text-[var(--color-accent)] font-medium">{building.power}W</span>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-medium flex-shrink-0"
                        style={{
                          backgroundColor: CATEGORY_COLORS[building.category] + '30',
                          color: CATEGORY_COLORS[building.category],
                          border: `1px solid ${CATEGORY_COLORS[building.category]}40`
                        }}
                      >
                        {building.category}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredBuildings.length === 0 && (
                  <div className="text-center text-gray-500 py-6 text-xs">
                    No buildings found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
