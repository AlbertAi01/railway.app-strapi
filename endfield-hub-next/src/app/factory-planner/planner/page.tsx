'use client';

import React, { useRef, useEffect, useState, useReducer, useCallback, useMemo, startTransition } from 'react';
import { useAuthStore } from '@/store/authStore';
import { syncToCloud, loadFromCloud } from '@/lib/userSync';
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
  Share2,
  Download,
  Upload,
  Clipboard,
  BarChart3,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
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
  rotation: number; // 0, 90, 180, 270
}

// ──── Factory Recipe Data Types ────

interface RecipeItem {
  id: string;
  name: string;
  count: number;
}

interface Recipe {
  id: string;
  name: string;
  machine: string;
  machineName: string;
  inputs: RecipeItem[];
  outputs: RecipeItem[];
  craftTime: number;
  power: number;
}

interface FactoryBuilding {
  id: string;
  name: string;
  power: number;
  width: number;
  height: number;
  category: string;
}

interface FactoryRecipeData {
  buildings: Record<string, FactoryBuilding>;
  items: Record<string, string>;
  recipes: Recipe[];
}

// Get effective dimensions accounting for rotation
function getEffectiveDimensions(building: Building, rotation: number): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: building.size.height, height: building.size.width };
  }
  return { width: building.size.width, height: building.size.height };
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

// ──── Building ID Mapping ────
// Maps planner building IDs to factory recipe facility IDs
const BUILDING_TO_FACILITY_MAP: Record<string, string> = {
  'refining-unit': 'item_port_furnance_1',
  'shredding-unit': 'item_port_grinder_1',
  'moulding-unit': 'item_port_shaper_1',
  'filling-unit': 'item_port_filling_pd_mc_1',
  'fitting-unit': 'item_port_cmpt_mc_1',
  'gearing-unit': 'item_port_winder_1',
  'grinding-unit': 'item_port_thickener_1',
  'packaging-unit': 'item_port_tools_asm_mc_1',
  'planting-unit': 'item_port_planter_1',
  'seed-picking-unit': 'item_port_seedcol_1',
  'separating-unit': 'item_port_dismantler_1',
  'reactor-crucible': 'item_port_mix_pool_1',
  'forge-of-the-sky': 'item_port_xiranite_oven_1',
  'fluid-supply-unit': 'item_port_dumper_1',
  'electric-pylon': 'item_port_power_diffuser_1',
  'relay-tower': 'item_port_power_pole_2',
  'xiranite-pylon': 'item_port_power_diffuser_2',
  'thermal-bank': 'item_port_power_sta_1',
  'electric-nexus': 'item_port_power_port_1',
};

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
  { id: 'thermal-bank', name: 'Thermal Bank', category: 'Utility', size: { width: 2, height: 2 }, inputs: 0, outputs: 0, power: -220, description: 'Power generator (220W)', isFavorite: true },
  { id: 'electric-nexus', name: 'Electric Nexus', category: 'Utility', size: { width: 1, height: 1 }, inputs: 0, outputs: 0, power: 0, description: 'Power grid junction' },

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
  Production: '#4ade80',
  Processing: '#60a5fa',
  Storage: '#FFD429',
  Utility: '#22d3ee',
  Logistics: '#fbbf24',
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
  showProductionStats: boolean;
  // Move/drag state
  movingBuildingIndex: number | null; // Index of building being moved (picked up)
  movingBuildingData: PlacedBuilding | null; // The building data being moved
  // Rotation for placement/moving
  placementRotation: number; // 0, 90, 180, 270
}

type Action =
  | { type: 'PLACE_BUILDING'; building: PlacedBuilding }
  | { type: 'REMOVE_BUILDING'; index: number }
  | { type: 'MOVE_BUILDING'; index: number; newX: number; newY: number; newRotation: number }
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
  | { type: 'TOGGLE_PRODUCTION_STATS' }
  | { type: 'CLOSE_ALL_MENUS' }
  | { type: 'PICK_UP_BUILDING'; index: number }
  | { type: 'DROP_MOVING_BUILDING' }
  | { type: 'CANCEL_MOVE' }
  | { type: 'SET_PLACEMENT_ROTATION'; rotation: number }
  | { type: 'ROTATE_PLACEMENT' };

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
    case 'MOVE_BUILDING': {
      const movedBuildings = state.grid.buildings.map((b, i) =>
        i === action.index ? { ...b, x: action.newX, y: action.newY, rotation: action.newRotation } : b
      );
      const moveHistory = state.grid.history.slice(0, state.grid.historyIndex + 1);
      return {
        ...state,
        grid: {
          buildings: movedBuildings,
          history: [...moveHistory, movedBuildings],
          historyIndex: moveHistory.length,
        },
        movingBuildingIndex: null,
        movingBuildingData: null,
      };
    }
    case 'PICK_UP_BUILDING': {
      const pickedBuilding = state.grid.buildings[action.index];
      if (!pickedBuilding) return state;
      return {
        ...state,
        movingBuildingIndex: action.index,
        movingBuildingData: { ...pickedBuilding },
        placementRotation: pickedBuilding.rotation,
        toolMode: 'move',
      };
    }
    case 'DROP_MOVING_BUILDING':
      return {
        ...state,
        movingBuildingIndex: null,
        movingBuildingData: null,
        toolMode: 'select',
      };
    case 'CANCEL_MOVE':
      return {
        ...state,
        movingBuildingIndex: null,
        movingBuildingData: null,
        toolMode: 'select',
        placementRotation: 0,
      };
    case 'SET_PLACEMENT_ROTATION':
      return { ...state, placementRotation: action.rotation };
    case 'ROTATE_PLACEMENT':
      return { ...state, placementRotation: (state.placementRotation + 90) % 360 };
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
    case 'TOGGLE_PRODUCTION_STATS':
      return { ...state, showProductionStats: !state.showProductionStats };
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
  showProductionStats: false,
  movingBuildingIndex: null,
  movingBuildingData: null,
  placementRotation: 0,
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

// ──── Production Stats Panel ────

interface ProductionStatsProps {
  buildings: PlacedBuilding[];
  onClose: () => void;
}

function ProductionStatsPanel({ buildings, onClose }: ProductionStatsProps) {
  const [recipeData, setRecipeData] = useState<FactoryRecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load factory recipes on mount
  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load recipes');
        return res.json();
      })
      .then((data: FactoryRecipeData) => {
        setRecipeData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Calculate production stats
  const stats = useMemo(() => {
    if (!recipeData) return null;

    // Count buildings by type
    const buildingCounts: Record<string, number> = {};
    let totalPowerConsumption = 0;
    let totalPowerGeneration = 0;

    buildings.forEach(pb => {
      const facilityId = BUILDING_TO_FACILITY_MAP[pb.buildingId];
      if (!facilityId) return;

      const facilityData = recipeData.buildings[facilityId];
      if (!facilityData) return;

      // Count this building
      buildingCounts[facilityId] = (buildingCounts[facilityId] || 0) + 1;

      // Calculate power (will be refined by recipes later)
      if (facilityData.power > 0) {
        totalPowerConsumption += facilityData.power;
      } else if (facilityData.power < 0) {
        totalPowerGeneration += Math.abs(facilityData.power);
      }
    });

    // Get all recipes for placed buildings
    const buildingRecipes: Record<string, Recipe[]> = {};
    Object.keys(buildingCounts).forEach(facilityId => {
      buildingRecipes[facilityId] = recipeData.recipes.filter(r => r.machine === facilityId);
    });

    // Calculate aggregate inputs/outputs (for first recipe of each building type)
    const inputRates: Record<string, number> = {};
    const outputRates: Record<string, number> = {};

    // Reset power calculations to use recipe-based power
    totalPowerConsumption = 0;
    totalPowerGeneration = 0;

    Object.entries(buildingCounts).forEach(([facilityId, count]) => {
      const recipes = buildingRecipes[facilityId];
      if (!recipes || recipes.length === 0) {
        // No recipes - use building power as fallback
        const facilityData = recipeData.buildings[facilityId];
        if (facilityData && facilityData.power > 0) {
          totalPowerConsumption += facilityData.power * count;
        }
        return;
      }

      // Use first recipe as default
      const recipe = recipes[0];
      const itemsPerMinute = 60 / recipe.craftTime;

      // Power from recipe (negative = generation)
      if (recipe.power > 0) {
        totalPowerConsumption += recipe.power * count;
      } else if (recipe.power < 0) {
        totalPowerGeneration += Math.abs(recipe.power) * count;
      }

      // Inputs
      recipe.inputs.forEach(input => {
        const rate = input.count * itemsPerMinute * count;
        inputRates[input.name] = (inputRates[input.name] || 0) + rate;
      });

      // Outputs
      recipe.outputs.forEach(output => {
        const rate = output.count * itemsPerMinute * count;
        outputRates[output.name] = (outputRates[output.name] || 0) + rate;
      });
    });

    // Convert to sorted arrays
    const inputsList = Object.entries(inputRates)
      .sort((a, b) => b[1] - a[1])
      .map(([name, rate]) => ({ name, rate }));

    const outputsList = Object.entries(outputRates)
      .sort((a, b) => b[1] - a[1])
      .map(([name, rate]) => ({ name, rate }));

    // Building summary with recipe-based power
    const buildingsList = Object.entries(buildingCounts)
      .map(([facilityId, count]) => {
        const facilityData = recipeData.buildings[facilityId];
        const recipes = buildingRecipes[facilityId];
        const recipe = recipes && recipes.length > 0 ? recipes[0] : null;

        return {
          facilityId,
          name: facilityData?.name || 'Unknown',
          count,
          power: recipe ? recipe.power : (facilityData?.power || 0),
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      totalPowerConsumption,
      totalPowerGeneration,
      buildingsList,
      inputsList,
      outputsList,
      totalBuildings: buildings.length,
    };
  }, [buildings, recipeData]);

  if (loading) {
    return (
      <div className="absolute top-0 right-0 h-full w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col shadow-2xl z-20">
        <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={14} />
            Production Stats
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Close production stats"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading recipe data...</div>
        </div>
      </div>
    );
  }

  if (error || !recipeData) {
    return (
      <div className="absolute top-0 right-0 h-full w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col shadow-2xl z-20">
        <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={14} />
            Production Stats
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Close production stats"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-sm px-4 text-center">
            Failed to load recipe data: {error || 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const powerUsagePercent = stats.totalPowerGeneration > 0
    ? (stats.totalPowerConsumption / stats.totalPowerGeneration) * 100
    : 0;

  const isPowerSufficient = stats.totalPowerConsumption <= stats.totalPowerGeneration;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col shadow-2xl z-20">
      {/* Panel Header */}
      <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={14} />
          Production Stats
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
          title="Close production stats"
        >
          <X size={14} />
        </button>
      </div>

      {/* Stats Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Power Section */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
          <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
            <Zap size={12} className="text-[var(--color-accent)]" />
            POWER
          </h3>
          <div className="space-y-2">
            {/* Power Bar */}
            <div className="relative h-4 bg-[#0d1117] border border-[var(--color-border)] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isPowerSufficient ? 'bg-[var(--color-accent)]' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(powerUsagePercent, 100)}%` }}
              />
              {powerUsagePercent > 100 && (
                <div
                  className="absolute top-0 h-full bg-red-700 opacity-50"
                  style={{
                    left: '100%',
                    width: `${Math.min((powerUsagePercent - 100), 100)}%`
                  }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-medium">
                {stats.totalPowerConsumption.toFixed(0)}W / {stats.totalPowerGeneration.toFixed(0)}W
              </span>
              <span className={isPowerSufficient ? 'text-green-400' : 'text-red-400'}>
                {powerUsagePercent.toFixed(0)}%
              </span>
            </div>
            {isPowerSufficient ? (
              <div className="flex items-center gap-1 text-[10px] text-green-400">
                <CheckCircle size={10} />
                <span>Power grid sufficient</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-red-400">
                <AlertTriangle size={10} />
                <span>Insufficient power generation</span>
              </div>
            )}
          </div>
        </div>

        {/* Buildings Section */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
          <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
            <Building2 size={12} className="text-[var(--color-accent)]" />
            BUILDINGS ({stats.totalBuildings} placed)
          </h3>
          {stats.buildingsList.length > 0 ? (
            <div className="space-y-1">
              {stats.buildingsList.map(({ facilityId, name, count, power }) => (
                <div
                  key={facilityId}
                  className="flex items-center justify-between text-[10px] text-gray-300 py-1"
                >
                  <span className="flex-1">
                    {count}x {name}
                  </span>
                  {power > 0 && (
                    <span className="text-[var(--color-accent)] font-medium ml-2">
                      {power * count}W
                    </span>
                  )}
                  {power < 0 && (
                    <span className="text-green-400 font-medium ml-2">
                      {Math.abs(power * count)}W
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-500">No production buildings placed</div>
          )}
        </div>

        {/* Inputs Required Section */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
          <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
            <Download size={12} className="text-blue-400" />
            INPUTS REQUIRED
          </h3>
          {stats.inputsList.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {stats.inputsList.map(({ name, rate }) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-[10px] text-gray-300 py-1"
                >
                  <span className="flex-1 truncate" title={name}>{name}</span>
                  <span className="text-blue-400 font-medium ml-2">
                    {rate.toFixed(1)}/min
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-500">No inputs required</div>
          )}
        </div>

        {/* Outputs Produced Section */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3">
          <h3 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
            <Upload size={12} className="text-green-400" />
            OUTPUTS PRODUCED
          </h3>
          {stats.outputsList.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {stats.outputsList.map(({ name, rate }) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-[10px] text-gray-300 py-1"
                >
                  <span className="flex-1 truncate" title={name}>{name}</span>
                  <span className="text-green-400 font-medium ml-2">
                    {rate.toFixed(1)}/min
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-500">No outputs produced</div>
          )}
        </div>

        {/* Efficiency Note */}
        {stats.totalBuildings === 0 && (
          <div className="bg-[#161310] border border-[var(--color-border)] p-3 text-center">
            <TrendingUp size={24} className="text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Place buildings on the grid to see production statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── Main Component ────

export default function FactoryPlannerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [mouseGridPos, setMouseGridPos] = useState<{ gridX: number; gridY: number } | null>(null);

  // Auth for cloud sync
  const { token } = useAuthStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Clear - darker background matching Zero Sanity
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Transform
    ctx.save();
    ctx.translate(pan.x + canvasSize.width / 2, pan.y + canvasSize.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-GRID_WIDTH * CELL_SIZE / 2, -GRID_HEIGHT * CELL_SIZE / 2);

    // Grid background - warm-tinted
    ctx.fillStyle = '#161310';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Grid lines - warm gray
    ctx.strokeStyle = '#1a1815';
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

    // Major grid lines every 5 cells - slightly lighter warm
    ctx.strokeStyle = '#2a2520';
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

    // PAC border - cyan with amber accent
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(pacX + 1.5, pacY + 1.5, pacWidth - 3, pacHeight - 3);

    // Corner decorations - amber for Zero Sanity branding
    const cornerSize = 12;
    ctx.strokeStyle = '#FFD429';
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

    // ── GRID BOUNDARY MARKERS (like endfieldtools.dev) ──
    // Thick border around valid grid area
    ctx.strokeStyle = '#FFD429';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Corner markers (L-shaped brackets)
    const bracketSize = 30;
    const bracketThick = 3;
    ctx.strokeStyle = '#FFD429';
    ctx.lineWidth = bracketThick;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(0, bracketSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(bracketSize, 0);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(GRID_WIDTH * CELL_SIZE - bracketSize, 0);
    ctx.lineTo(GRID_WIDTH * CELL_SIZE, 0);
    ctx.lineTo(GRID_WIDTH * CELL_SIZE, bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(0, GRID_HEIGHT * CELL_SIZE - bracketSize);
    ctx.lineTo(0, GRID_HEIGHT * CELL_SIZE);
    ctx.lineTo(bracketSize, GRID_HEIGHT * CELL_SIZE);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(GRID_WIDTH * CELL_SIZE - bracketSize, GRID_HEIGHT * CELL_SIZE);
    ctx.lineTo(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    ctx.lineTo(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE - bracketSize);
    ctx.stroke();

    // Field size label at top
    ctx.fillStyle = '#FFD429';
    ctx.font = 'bold 13px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${activeConfig.name} — ${GRID_WIDTH} x ${GRID_HEIGHT} tiles`, GRID_WIDTH * CELL_SIZE / 2, -24);

    // OUT OF BOUNDS text outside grid (top)
    ctx.fillStyle = '#ff444480';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUT OF BOUNDS', GRID_WIDTH * CELL_SIZE / 2, -60);

    // Grid coordinate labels along edges
    ctx.fillStyle = '#FFD429';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let x = 0; x <= GRID_WIDTH; x += 5) {
      ctx.fillText(x.toString(), x * CELL_SIZE, -8);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = 0; y <= GRID_HEIGHT; y += 5) {
      ctx.fillText(y.toString(), -8, y * CELL_SIZE);
    }

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

    // Placed buildings (with rotation support)
    state.grid.buildings.forEach((placedBuilding, idx) => {
      // Skip the building being moved (it will be drawn as a ghost)
      if (idx === state.movingBuildingIndex) return;

      const building = BUILDINGS.find(b => b.id === placedBuilding.buildingId);
      if (!building) return;
      const eff = getEffectiveDimensions(building, placedBuilding.rotation);
      const x = placedBuilding.x * CELL_SIZE;
      const y = placedBuilding.y * CELL_SIZE;
      const width = eff.width * CELL_SIZE;
      const height = eff.height * CELL_SIZE;
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
      // Rotation indicator for rotated buildings
      if (placedBuilding.rotation !== 0) {
        ctx.fillStyle = '#ffffff90';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`${placedBuilding.rotation}°`, x + width - 3, y + 3);
      }
    });

    // Ghost preview for building being placed or moved
    const ghostBuilding = state.movingBuildingData
      ? BUILDINGS.find(b => b.id === state.movingBuildingData!.buildingId)
      : state.toolMode === 'build' && state.selectedBuilding
        ? BUILDINGS.find(b => b.id === state.selectedBuilding)
        : null;

    if (ghostBuilding && mouseGridPos) {
      const rotation = state.placementRotation;
      const eff = getEffectiveDimensions(ghostBuilding, rotation);
      const gx = mouseGridPos.gridX;
      const gy = mouseGridPos.gridY;

      // Check validity
      const isOnPAC = gx < PAC_X + PAC_SIZE && gx + eff.width > PAC_X &&
                      gy < PAC_Y + PAC_SIZE && gy + eff.height > PAC_Y;
      const isOverlap = checkOverlap(gx, gy, eff.width, eff.height, state.movingBuildingIndex ?? undefined);
      const isInBounds = gx >= 0 && gx + eff.width <= GRID_WIDTH &&
                         gy >= 0 && gy + eff.height <= GRID_HEIGHT;
      const isValid = !isOnPAC && !isOverlap && isInBounds;

      const x = gx * CELL_SIZE;
      const y = gy * CELL_SIZE;
      const width = eff.width * CELL_SIZE;
      const height = eff.height * CELL_SIZE;

      // Ghost fill
      ctx.fillStyle = isValid
        ? CATEGORY_COLORS[ghostBuilding.category] + '40'
        : '#ff000030';
      ctx.fillRect(x, y, width, height);

      // Ghost border
      ctx.strokeStyle = isValid
        ? CATEGORY_COLORS[ghostBuilding.category]
        : '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);

      // Ghost name
      const fontSize = Math.min(width / 8, height / 3, 14);
      ctx.fillStyle = isValid ? '#ffffffaa' : '#ff4444aa';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ghostBuilding.name, x + width / 2, y + height / 2);

      // Rotation indicator
      if (rotation !== 0) {
        ctx.fillStyle = '#ffffffaa';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`${rotation}°`, x + width - 3, y + 3);
      }

      // Invalid placement reason
      if (!isValid) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const reason = isOnPAC ? 'OVERLAPS PAC' : !isInBounds ? 'OUT OF BOUNDS' : 'OVERLAPS BUILDING';
        ctx.fillText(reason, x + width / 2, y - 4);
      }
    }

    ctx.restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan, zoom, state.grid.buildings, canvasSize, GRID_WIDTH, GRID_HEIGHT, PAC_X, PAC_Y, activeConfig, mouseGridPos, state.movingBuildingIndex, state.movingBuildingData, state.selectedBuilding, state.toolMode, state.placementRotation]);

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

  // Initialize with PAC centered on first load
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      // Center the PAC in viewport on initial load
      setPan({ x: 0, y: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width, canvasSize.height]);

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

  // Check if a building overlaps any existing building (accounts for rotation)
  const checkOverlap = (bx: number, by: number, bw: number, bh: number, excludeIndex?: number) => {
    return state.grid.buildings.some((pb, i) => {
      if (i === excludeIndex) return false;
      const def = BUILDINGS.find(b => b.id === pb.buildingId);
      if (!def) return false;
      const eff = getEffectiveDimensions(def, pb.rotation);
      return bx < pb.x + eff.width && bx + bw > pb.x &&
             by < pb.y + eff.height && by + bh > pb.y;
    });
  };

  // Find building at grid position (accounts for rotation)
  const findBuildingAt = (gx: number, gy: number) => {
    for (let i = state.grid.buildings.length - 1; i >= 0; i--) {
      const pb = state.grid.buildings[i];
      const def = BUILDINGS.find(b => b.id === pb.buildingId);
      if (!def) continue;
      const eff = getEffectiveDimensions(def, pb.rotation);
      if (gx >= pb.x && gx < pb.x + eff.width && gy >= pb.y && gy < pb.y + eff.height) {
        return i;
      }
    }
    return -1;
  };

  // ── Save / Load (with cloud sync) ──

  const saveToLocalStorage = useCallback(async () => {
    try {
      const data = {
        buildings: state.grid.buildings,
        outpostConfig: state.outpostConfig,
        version: 1,
      };
      localStorage.setItem('aic-planner-save', JSON.stringify(data));

      // Also sync to cloud if authenticated
      if (token) {
        await syncToCloud('factoryPlanner' as any, data, token);
      }
    } catch { /* silently fail */ }
  }, [state.grid.buildings, state.outpostConfig, token]);

  const loadFromLocalStorage = useCallback(async () => {
    try {
      let data: any = null;

      // Try cloud first if authenticated
      if (token) {
        data = await loadFromCloud('factoryPlanner' as any, token);
      }

      // Fall back to localStorage
      if (!data) {
        const raw = localStorage.getItem('aic-planner-save');
        if (raw) {
          data = JSON.parse(raw);
        }
      }

      if (data && data.buildings && Array.isArray(data.buildings)) {
        dispatch({ type: 'CLEAR_GRID' });
        data.buildings.forEach((b: PlacedBuilding) => {
          dispatch({ type: 'PLACE_BUILDING', building: b });
        });
        if (data.outpostConfig) {
          dispatch({ type: 'SET_OUTPOST_CONFIG', config: data.outpostConfig });
        }
      }
    } catch { /* silently fail */ }
  }, [token]);

  // Debounced auto-save when buildings change
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.grid.buildings, saveToLocalStorage]);

  // Load on mount
  useEffect(() => {
    loadFromLocalStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Export/Import/Share ──

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLayoutData = useCallback(() => ({
    buildings: state.grid.buildings,
    outpostConfig: state.outpostConfig,
    version: 1,
    createdAt: new Date().toISOString(),
    buildingCount: state.grid.buildings.length,
  }), [state.grid.buildings, state.outpostConfig]);

  const exportJSON = useCallback(() => {
    const data = getLayoutData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory-layout-${state.outpostConfig}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getLayoutData, state.outpostConfig]);

  const copyJSON = useCallback(async () => {
    const data = getLayoutData();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data));
      alert('Layout JSON copied to clipboard!');
    } catch {
      alert('Copy failed. Use Export JSON instead.');
    }
  }, [getLayoutData]);

  const importJSONClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: reject files over 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Maximum allowed size is 2MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        // Sanitize: deep-clone to strip prototype pollution
        const data = JSON.parse(JSON.stringify(raw));

        if (!data || typeof data !== 'object' || !Array.isArray(data.buildings)) {
          alert('Invalid layout file. Expected a JSON object with a buildings array.');
          return;
        }

        // Validate each building entry has required fields with correct types
        const validBuildings = data.buildings.filter((b: unknown): b is PlacedBuilding => {
          if (!b || typeof b !== 'object') return false;
          const obj = b as Record<string, unknown>;
          return (
            typeof obj.buildingId === 'string' && obj.buildingId.length < 100 &&
            typeof obj.x === 'number' && Number.isFinite(obj.x) && obj.x >= 0 && obj.x < 100 &&
            typeof obj.y === 'number' && Number.isFinite(obj.y) && obj.y >= 0 && obj.y < 100 &&
            typeof obj.rotation === 'number' && [0, 90, 180, 270].includes(obj.rotation)
          );
        });

        // Limit number of buildings to prevent DoS via massive arrays
        if (validBuildings.length > 200) {
          alert('Layout contains too many buildings (max 200).');
          return;
        }

        // Validate outpost config if present
        const VALID_CONFIGS = ['pac-base', 'pac-expansion-1', 'pac-expansion-2', 'sub-pac-base', 'sub-pac-expansion-1', 'sub-pac-expansion-2'];
        const outpostConfig = typeof data.outpostConfig === 'string' && VALID_CONFIGS.includes(data.outpostConfig) ? data.outpostConfig : undefined;

        dispatch({ type: 'CLEAR_GRID' });
        validBuildings.forEach((b: PlacedBuilding) => {
          dispatch({ type: 'PLACE_BUILDING', building: { buildingId: b.buildingId, x: b.x, y: b.y, rotation: b.rotation } });
        });
        if (outpostConfig) {
          dispatch({ type: 'SET_OUTPOST_CONFIG', config: outpostConfig });
        }
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const shareBlueprint = useCallback(() => {
    try {
      const data = getLayoutData();
      const encoded = btoa(JSON.stringify(data));
      const url = `${window.location.origin}/factory-planner/planner?bp=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        prompt('Copy this share link:', url);
      });
    } catch {
      alert('Failed to generate share link.');
    }
  }, [getLayoutData]);

  // Load blueprint from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bp = params.get('bp');
    if (bp) {
      try {
        // Security: limit URL param size to prevent DoS
        if (bp.length > 50000) return;
        const raw = JSON.parse(atob(bp));
        // Sanitize: deep-clone to strip prototype pollution
        const data = JSON.parse(JSON.stringify(raw));
        if (data && typeof data === 'object' && Array.isArray(data.buildings)) {
          // Validate each building
          const validBuildings = data.buildings.filter((b: unknown): b is PlacedBuilding => {
            if (!b || typeof b !== 'object') return false;
            const obj = b as Record<string, unknown>;
            return (
              typeof obj.buildingId === 'string' && obj.buildingId.length < 100 &&
              typeof obj.x === 'number' && Number.isFinite(obj.x) && obj.x >= 0 && obj.x < 100 &&
              typeof obj.y === 'number' && Number.isFinite(obj.y) && obj.y >= 0 && obj.y < 100 &&
              typeof obj.rotation === 'number' && [0, 90, 180, 270].includes(obj.rotation)
            );
          });
          if (validBuildings.length > 200) return;

          dispatch({ type: 'CLEAR_GRID' });
          validBuildings.forEach((b: PlacedBuilding) => {
            dispatch({ type: 'PLACE_BUILDING', building: { buildingId: b.buildingId, x: b.x, y: b.y, rotation: b.rotation } });
          });
          const VALID_CONFIGS = ['pac-base', 'pac-expansion-1', 'pac-expansion-2', 'sub-pac-base', 'sub-pac-expansion-1', 'sub-pac-expansion-2'];
          if (typeof data.outpostConfig === 'string' && VALID_CONFIGS.includes(data.outpostConfig)) {
            dispatch({ type: 'SET_OUTPOST_CONFIG', config: data.outpostConfig });
          }
        }
      } catch { /* ignore invalid bp param */ }
    }
  }, []);

  // ── Stats calculations ──

  const statsData = useMemo(() => {
    const buildings = state.grid.buildings;
    const categoryCounts: Record<string, number> = {};
    let totalPower = 0;
    let totalInputs = 0;
    let totalOutputs = 0;

    buildings.forEach(pb => {
      const b = BUILDINGS.find(bld => bld.id === pb.buildingId);
      if (b) {
        categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
        totalPower += b.power;
        totalInputs += b.inputs;
        totalOutputs += b.outputs;
      }
    });

    return {
      total: buildings.length,
      categoryCounts,
      totalPower,
      totalInputs,
      totalOutputs,
    };
  }, [state.grid.buildings]);

  // ── Keyboard Shortcuts ──

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        // Cancel move if moving
        if (state.movingBuildingIndex !== null) {
          dispatch({ type: 'CANCEL_MOVE' });
        } else {
          dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
          dispatch({ type: 'SET_SELECTED_BUILDING', buildingId: null });
          dispatch({ type: 'SET_PLACEMENT_ROTATION', rotation: 0 });
          if (state.showBuildingPicker) dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
        }
        dispatch({ type: 'CLOSE_ALL_MENUS' });
      }
      // R key to rotate 90 degrees
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'ROTATE_PLACEMENT' });
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
        if (state.movingBuildingIndex !== null) dispatch({ type: 'CANCEL_MOVE' });
        dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
      }
      if (e.key === 'x' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'SET_TOOL_MODE', mode: 'delete' });
      }
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        handleZoomToFit();
      }
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
        dispatch({ type: 'SET_TOOL_MODE', mode: 'move' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.showBuildingPicker, state.movingBuildingIndex, saveToLocalStorage]);

  // ── Mouse handlers ──

  const [dragDistance, setDragDistance] = useState(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const PAN_DRAG_THRESHOLD = 5; // pixels before we consider it a drag (not a click)

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Left-click drag pans in ALL modes
    if (e.button === 0) {
      setIsDragging(true);
      setDragDistance(0);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setDragDistance(dist);
      if (dist >= PAN_DRAG_THRESHOLD) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
    }
    // Track grid position for ghost preview
    const { gridX, gridY } = screenToGrid(e.clientX, e.clientY);
    setMouseGridPos({ gridX, gridY });
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
    // Ignore click if we were dragging (panning) - use distance threshold
    if (dragDistance >= PAN_DRAG_THRESHOLD) return;

    const { gridX, gridY } = screenToGrid(e.clientX, e.clientY);

    // If we're currently moving a building, drop it here
    if (state.movingBuildingIndex !== null && state.movingBuildingData) {
      const building = BUILDINGS.find(b => b.id === state.movingBuildingData!.buildingId);
      if (!building) return;
      const eff = getEffectiveDimensions(building, state.placementRotation);

      const isOnPAC = gridX < PAC_X + PAC_SIZE && gridX + eff.width > PAC_X &&
                      gridY < PAC_Y + PAC_SIZE && gridY + eff.height > PAC_Y;
      const isOverlap = checkOverlap(gridX, gridY, eff.width, eff.height, state.movingBuildingIndex);
      const isInBounds = gridX >= 0 && gridX + eff.width <= GRID_WIDTH &&
                         gridY >= 0 && gridY + eff.height <= GRID_HEIGHT;

      if (!isOnPAC && !isOverlap && isInBounds) {
        dispatch({
          type: 'MOVE_BUILDING',
          index: state.movingBuildingIndex,
          newX: gridX,
          newY: gridY,
          newRotation: state.placementRotation,
        });
      }
      return;
    }

    // Delete mode: remove building at click location
    if (state.toolMode === 'delete') {
      const idx = findBuildingAt(gridX, gridY);
      if (idx >= 0) {
        dispatch({ type: 'REMOVE_BUILDING', index: idx });
      }
      return;
    }

    // Build mode: place building with overlap detection + rotation
    if (state.toolMode === 'build' && state.selectedBuilding) {
      const building = BUILDINGS.find(b => b.id === state.selectedBuilding);
      if (!building) return;
      const eff = getEffectiveDimensions(building, state.placementRotation);

      const isOnPAC = gridX < PAC_X + PAC_SIZE && gridX + eff.width > PAC_X &&
                      gridY < PAC_Y + PAC_SIZE && gridY + eff.height > PAC_Y;
      const isOverlap = checkOverlap(gridX, gridY, eff.width, eff.height);

      if (gridX >= 0 && gridX + eff.width <= GRID_WIDTH &&
          gridY >= 0 && gridY + eff.height <= GRID_HEIGHT &&
          !isOnPAC && !isOverlap) {
        dispatch({
          type: 'PLACE_BUILDING',
          building: { buildingId: state.selectedBuilding, x: gridX, y: gridY, rotation: state.placementRotation },
        });
      }
      return;
    }

    // Move mode: click on a building to pick it up
    if (state.toolMode === 'move') {
      const idx = findBuildingAt(gridX, gridY);
      if (idx >= 0) {
        dispatch({ type: 'PICK_UP_BUILDING', index: idx });
      }
      return;
    }

    // Select mode: click on a building to pick it up for moving
    if (state.toolMode === 'select') {
      const idx = findBuildingAt(gridX, gridY);
      if (idx >= 0) {
        dispatch({ type: 'PICK_UP_BUILDING', index: idx });
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
            title="Change outpost size and type"
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline">{activeConfig.name}</span>
            <span className="sm:hidden">{activeConfig.label}</span>
            <span className="text-[10px] text-[#00b0ff80]">({GRID_WIDTH}x{GRID_HEIGHT})</span>
            <ChevronDown size={12} />
          </button>
          {state.showOutpostMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl py-1 min-w-[280px] z-[100]">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Main PAC</div>
              {OUTPOST_CONFIGS.filter(c => c.pacType === 'pac').map(config => (
                <button
                  key={config.id}
                  onClick={() => dispatch({ type: 'SET_OUTPOST_CONFIG', config: config.id })}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 transition-colors ${
                    state.outpostConfig === config.id ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]' : 'text-gray-300 hover:bg-[var(--color-surface-2)] hover:text-white'
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
                    state.outpostConfig === config.id ? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]' : 'text-gray-300 hover:bg-[var(--color-surface-2)] hover:text-white'
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
      <div className="bg-[#111318] border-b border-[var(--color-border)] px-2 py-1 flex items-center gap-1 flex-shrink-0 overflow-visible">
        {/* File menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_FILE_MENU' })} title="Save/load menu">
            <FileText size={13} />
            <span className="hidden sm:inline">File</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showFileMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl py-1 min-w-[180px] z-[100]">
              <button onClick={() => { dispatch({ type: 'CLEAR_GRID' }); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><FileText size={12} />New Grid <span className="text-gray-500 text-[10px] ml-auto">Ctrl+N</span></button>
              <button onClick={() => { loadFromLocalStorage(); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Upload size={12} />Load <span className="text-gray-500 text-[10px] ml-auto">Ctrl+O</span></button>
              <button onClick={() => { saveToLocalStorage(); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Download size={12} />Save <span className="text-gray-500 text-[10px] ml-auto">Ctrl+S</span></button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button onClick={() => { shareBlueprint(); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Share2 size={12} />Share Blueprint</button>
            </div>
          )}
        </div>

        {/* Data menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_DATA_MENU' })} title="Import/export JSON menu">
            <Database size={13} />
            <span className="hidden sm:inline">Data</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showDataMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl py-1 min-w-[180px] z-[100]">
              <button onClick={() => { exportJSON(); dispatch({ type: 'TOGGLE_DATA_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Download size={12} />Export JSON</button>
              <button onClick={() => { importJSONClick(); dispatch({ type: 'TOGGLE_DATA_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Upload size={12} />Import JSON</button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button onClick={() => { copyJSON(); dispatch({ type: 'TOGGLE_DATA_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Clipboard size={12} />Copy to Clipboard</button>
            </div>
          )}
        </div>

        {/* Edit menu */}
        <div className="relative" data-menu>
          <ToolbarButton onClick={() => dispatch({ type: 'TOGGLE_EDIT_MENU' })} title="Edit and delete menu">
            <Edit3 size={13} />
            <span className="hidden sm:inline">Edit</span>
            <ChevronDown size={11} className="opacity-50" />
          </ToolbarButton>
          {state.showEditMenu && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl py-1 min-w-[140px] z-[100]">
              <button onClick={() => { dispatch({ type: 'SET_TOOL_MODE', mode: 'delete' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Trash2 size={12} />Delete Mode <span className="text-gray-500 text-[10px] ml-auto">X</span></button>
              <button onClick={() => { dispatch({ type: 'SET_TOOL_MODE', mode: 'move' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><MousePointer2 size={12} />Move Mode <span className="text-gray-500 text-[10px] ml-auto">M</span></button>
              <button onClick={() => { dispatch({ type: 'ROTATE_PLACEMENT' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-white hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><RotateCw size={12} />Rotate 90° <span className="text-gray-500 text-[10px] ml-auto">R</span></button>
              <button className="w-full px-3 py-1.5 text-left text-xs text-gray-500 cursor-not-allowed flex items-center gap-2"><Copy size={12} />Copy (coming soon)</button>
              <div className="border-t border-[var(--color-border)] my-1" />
              <button onClick={() => { dispatch({ type: 'CLEAR_GRID' }); dispatch({ type: 'TOGGLE_EDIT_MENU' }); }} className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-[var(--color-surface-2)] transition-colors flex items-center gap-2"><Trash2 size={12} />Clear All Buildings</button>
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
          title="Select mode (V) - Click building to move"
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

        {/* Move */}
        <ToolbarButton
          active={state.toolMode === 'move' && state.movingBuildingIndex === null}
          onClick={() => {
            if (state.movingBuildingIndex !== null) {
              dispatch({ type: 'CANCEL_MOVE' });
            } else {
              dispatch({ type: 'SET_TOOL_MODE', mode: state.toolMode === 'move' ? 'select' : 'move' });
            }
          }}
          title="Move mode (M) - Click building, then click where to place"
        >
          <MousePointer2 size={13} />
          <span className="hidden sm:inline">Move</span>
        </ToolbarButton>

        {/* Delete */}
        <ToolbarButton
          active={state.toolMode === 'delete'}
          onClick={() => dispatch({ type: 'SET_TOOL_MODE', mode: state.toolMode === 'delete' ? 'select' : 'delete' })}
          title="Delete mode (X) - Click building to remove"
          className={state.toolMode === 'delete' ? '!bg-red-600 !border-red-600 !text-white' : ''}
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Del</span>
        </ToolbarButton>

        {/* Rotate */}
        <ToolbarButton
          onClick={() => dispatch({ type: 'ROTATE_PLACEMENT' })}
          title="Rotate building 90° clockwise (R)"
          active={state.placementRotation !== 0}
        >
          <RotateCw size={13} />
          <span className="hidden sm:inline">{state.placementRotation > 0 ? `${state.placementRotation}°` : 'Rot'}</span>
        </ToolbarButton>

        {/* Zoom to Fit */}
        <ToolbarButton onClick={handleZoomToFit} title="Zoom to fit grid (F)">
          <Maximize2 size={13} />
          <span className="hidden md:inline">Fit</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => dispatch({ type: 'UNDO' })}
          title="Undo last action (Ctrl+Z)"
          className={state.grid.historyIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}
        >
          <Undo2 size={13} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => dispatch({ type: 'REDO' })}
          title="Redo last action (Ctrl+Y)"
          className={state.grid.historyIndex === state.grid.history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}
        >
          <Redo2 size={13} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Toggles */}
        <ToolbarButton active={state.showConveyors} onClick={() => dispatch({ type: 'TOGGLE_CONVEYORS' })} title="Toggle conveyor belt visibility">
          Conv.
        </ToolbarButton>
        <ToolbarButton active={state.showPipes} onClick={() => dispatch({ type: 'TOGGLE_PIPES' })} title="Toggle pipe visibility">
          Pipes
        </ToolbarButton>
        <ToolbarButton active={state.showStats} onClick={() => dispatch({ type: 'TOGGLE_STATS' })} title="Toggle building statistics overlay">
          Stats
        </ToolbarButton>
        <ToolbarButton active={state.showProductionStats} onClick={() => dispatch({ type: 'TOGGLE_PRODUCTION_STATS' })} title="Toggle production calculator panel">
          <Activity size={13} />
          Prod
        </ToolbarButton>
        <ToolbarButton active={state.showAnim} onClick={() => dispatch({ type: 'TOGGLE_ANIM' })} title="Toggle animations on/off">
          Anim
        </ToolbarButton>
        <ToolbarButton active={state.autoConnect} onClick={() => dispatch({ type: 'TOGGLE_AUTO_CONNECT' })} title="Toggle auto-connect buildings with conveyor belts">
          <Infinity size={13} />
        </ToolbarButton>
        <ToolbarButton active={state.showBus} onClick={() => dispatch({ type: 'TOGGLE_BUS' })} title="Toggle depot bus visibility">
          <Bus size={13} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Speed */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 5, 10, 20].map((speed) => (
            <ToolbarButton
              key={speed}
              active={state.speed === speed}
              onClick={() => dispatch({ type: 'SET_SPEED', speed })}
              title={`Set simulation speed to ${speed}x`}
            >
              {speed}x
            </ToolbarButton>
          ))}
        </div>
      </div>

      {/* Hidden file input for JSON import */}
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />

      {/* ─── Canvas Area (fills all remaining space) ─── */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden min-h-0">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${
            isDragging && dragDistance >= PAN_DRAG_THRESHOLD ? 'cursor-grabbing' :
            state.movingBuildingIndex !== null ? 'cursor-crosshair' :
            state.toolMode === 'build' && state.selectedBuilding ? 'cursor-crosshair' :
            state.toolMode === 'delete' ? 'cursor-pointer' :
            'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { handleMouseUp(); setMouseGridPos(null); }}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
        />

        {/* Floating Zoom Controls (bottom-right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.25))}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors"
            title="Zoom in 25%"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomToFit}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors text-[10px] font-bold"
            title="Zoom to fit grid (F)"
          >
            FIT
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
            className="w-8 h-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors"
            title="Zoom out 20%"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        {/* Stats Panel (top-right overlay) - RIOS terminal style */}
        {state.showStats && (
          <div className="absolute top-4 right-4 z-10 w-56 bg-[var(--color-surface)]/95 backdrop-blur-sm border border-[var(--color-border)] shadow-xl clip-corner-tl">
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]">
              <h3 className="text-xs font-bold terminal-text-sm flex items-center gap-1.5"><BarChart3 size={12} />FACTORY STATS</h3>
              <button onClick={() => dispatch({ type: 'TOGGLE_STATS' })} className="text-gray-400 hover:text-[var(--color-accent)]"><X size={14} /></button>
            </div>
            <div className="p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total Buildings</span>
                <span className="text-[var(--color-accent)] font-bold">{statsData.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Power Usage</span>
                <span className="text-[var(--color-accent)] font-bold">{statsData.totalPower} <span className="text-[10px] text-gray-500">W</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total Inputs</span>
                <span className="text-[var(--color-accent)] font-bold">{statsData.totalInputs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Total Outputs</span>
                <span className="text-[var(--color-accent)] font-bold">{statsData.totalOutputs}</span>
              </div>
              {statsData.total > 0 && (
                <>
                  <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                    <div className="terminal-text-sm mb-1">By Category</div>
                    {Object.entries(statsData.categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <div key={cat} className="flex justify-between py-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 inline-block" style={{ backgroundColor: CATEGORY_COLORS[cat as Building['category']] || '#888' }} />
                          <span className="text-gray-300">{cat}</span>
                        </span>
                        <span className="text-[var(--color-accent)]">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {statsData.total === 0 && (
                <div className="text-center py-4 text-gray-500 text-[10px]">
                  No buildings placed.<br />Place buildings to see stats.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current tool mode indicator (bottom-left) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-end gap-2">
          <div className={`bg-[var(--color-surface)]/95 backdrop-blur-sm border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${
            state.toolMode === 'delete' ? 'border-red-600 text-red-400' :
            state.movingBuildingIndex !== null ? 'border-[#00b0ff] text-[#00b0ff]' :
            state.toolMode === 'move' ? 'border-cyan-700 text-cyan-400' :
            state.toolMode === 'build' && state.selectedBuilding ? 'border-[var(--color-accent)] text-[var(--color-accent)]' :
            'border-[var(--color-border)] text-gray-400'
          }`}>
            {state.movingBuildingIndex !== null
              ? `Moving: ${BUILDINGS.find(b => b.id === state.movingBuildingData?.buildingId)?.name || 'Building'} — Click to drop | R rotate`
              : state.toolMode === 'build' && state.selectedBuilding
              ? `Placing: ${BUILDINGS.find(b => b.id === state.selectedBuilding)?.name || 'Unknown'}${state.placementRotation ? ` (${state.placementRotation}°)` : ''} — Click to place | R rotate`
              : state.toolMode === 'select'
              ? 'Drag to pan — Click building to move — Right-click to delete'
              : state.toolMode === 'move'
              ? 'Click a building to pick up — Drag to pan'
              : state.toolMode === 'delete'
              ? 'Click building to delete — Drag to pan'
              : state.toolMode}
          </div>
          {/* Esc Cancel Button - shown when in any non-default state */}
          {(state.toolMode !== 'select' || state.movingBuildingIndex !== null || state.selectedBuilding) && (
            <button
              onClick={() => {
                if (state.movingBuildingIndex !== null) dispatch({ type: 'CANCEL_MOVE' });
                dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
                dispatch({ type: 'SET_SELECTED_BUILDING', buildingId: null });
                dispatch({ type: 'SET_PLACEMENT_ROTATION', rotation: 0 });
                if (state.showBuildingPicker) dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
              }}
              className="bg-red-600/90 backdrop-blur-sm hover:bg-red-500 text-white px-3 py-1.5 border border-red-500 transition-colors flex items-center gap-1.5 text-xs font-bold animate-pulse"
              title="Cancel current action (Esc)"
            >
              <kbd className="bg-red-800 px-1 py-0.5 text-[10px] rounded-sm">ESC</kbd>
              Cancel
            </button>
          )}
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
                  title="Switch to list view"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                  className={`p-1.5 transition-colors ${state.viewMode === 'grid' ? 'bg-[var(--color-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
                  title="Switch to grid view"
                >
                  <Grid3x3 size={14} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_BUILDING_PICKER' })}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Close building library (Esc)"
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
                  onChange={(e) => startTransition(() => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value }))}
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
                  title={`Filter buildings by ${category === 'All' ? 'all categories' : category === 'Favorite' ? 'favorites' : category + ' category'}`}
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
                    title={`Click to place ${building.name} - ${building.description}`}
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

        {/* ─── Production Stats Panel (overlay right) ─── */}
        {state.showProductionStats && (
          <ProductionStatsPanel
            buildings={state.grid.buildings}
            onClose={() => dispatch({ type: 'TOGGLE_PRODUCTION_STATS' })}
          />
        )}
      </div>
    </div>
  );
}
