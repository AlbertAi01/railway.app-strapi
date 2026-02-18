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
  ChevronUp,
} from 'lucide-react';

// Building data types
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

// Complete building database with correct data
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

// Color map for categories
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
  | { type: 'TOGGLE_EDIT_MENU' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'PLACE_BUILDING':
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
    case 'REMOVE_BUILDING':
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
        grid: {
          buildings: [],
          history: [[]],
          historyIndex: 0,
        },
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
      return { ...state, showFileMenu: !state.showFileMenu, showDataMenu: false, showEditMenu: false };
    case 'TOGGLE_DATA_MENU':
      return { ...state, showDataMenu: !state.showDataMenu, showFileMenu: false, showEditMenu: false };
    case 'TOGGLE_EDIT_MENU':
      return { ...state, showEditMenu: !state.showEditMenu, showFileMenu: false, showDataMenu: false };
    default:
      return state;
  }
}

const initialState: State = {
  grid: {
    buildings: [],
    history: [[]],
    historyIndex: 0,
  },
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
};

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
  const GRID_WIDTH = 50; // Large grid area around PAC
  const GRID_HEIGHT = 50;
  const PAC_SIZE = 9; // PAC is 9x9
  const PAC_X = Math.floor((GRID_WIDTH - PAC_SIZE) / 2); // Center PAC
  const PAC_Y = Math.floor((GRID_HEIGHT - PAC_SIZE) / 2);

  // Track container size with ResizeObserver
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
    // Also set initial size
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

    // Set canvas size from tracked container dimensions
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x + canvasSize.width / 2, pan.y + canvasSize.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-GRID_WIDTH * CELL_SIZE / 2, -GRID_HEIGHT * CELL_SIZE / 2);

    // Draw grid background
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

    // Draw grid lines
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

    // Draw major grid lines every 5 cells
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

    // Coordinate labels on edges (every 5 cells)
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

    // Draw the PAC (Protocol Anchor Core) - 9x9 building in center
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

    // PAC inner grid lines (subtle)
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

    // PAC border (bright cyan)
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(pacX + 1.5, pacY + 1.5, pacWidth - 3, pacHeight - 3);

    // PAC corner decorations (Arknights angular style)
    const cornerSize = 12;
    ctx.strokeStyle = '#00b0ff';
    ctx.lineWidth = 2;
    // Top-left
    ctx.beginPath(); ctx.moveTo(pacX, pacY + cornerSize); ctx.lineTo(pacX, pacY); ctx.lineTo(pacX + cornerSize, pacY); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(pacX + pacWidth - cornerSize, pacY); ctx.lineTo(pacX + pacWidth, pacY); ctx.lineTo(pacX + pacWidth, pacY + cornerSize); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(pacX, pacY + pacHeight - cornerSize); ctx.lineTo(pacX, pacY + pacHeight); ctx.lineTo(pacX + cornerSize, pacY + pacHeight); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(pacX + pacWidth - cornerSize, pacY + pacHeight); ctx.lineTo(pacX + pacWidth, pacY + pacHeight); ctx.lineTo(pacX + pacWidth, pacY + pacHeight - cornerSize); ctx.stroke();

    // === PAC PORT SYSTEM ===
    // VERIFIED MECHANICS (from wiki + community guides):
    // - Green arrow ports (top 8 + bottom 8) = INPUT ports = receive items INTO depot
    //   Arrows point INWARD toward PAC center (down on top, up on bottom)
    // - Orange numbered ports (1-3 right, 4-6 left) = OUTPUT ports = dispatch items FROM depot
    //   These are the 6 configurable output ports that pull items from depot storage
    // Sources: endfield.wiki.gg, enka.network tutorial, game8.co, allthings.how

    const portCellSize = CELL_SIZE * 0.85;

    // --- TOP EDGE: 8 green INPUT ports (items flow DOWN into PAC/depot) ---
    const topInputCount = 8;
    for (let i = 0; i < topInputCount; i++) {
      const portX = pacX + (i + 0.5) * (pacWidth / topInputCount) - portCellSize / 2;
      const portY = pacY - portCellSize - 4;

      // Green port background
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(portX, portY, portCellSize, portCellSize);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(portX, portY, portCellSize, portCellSize);

      // Down arrow (items flow DOWN into PAC = into depot)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = portX + portCellSize / 2;
      const cy = portY + portCellSize / 2;
      ctx.moveTo(cx, cy + 9);
      ctx.lineTo(cx - 7, cy - 3);
      ctx.lineTo(cx + 7, cy - 3);
      ctx.closePath();
      ctx.fill();
    }

    // Label above top input ports
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('INPUT PORTS (INTO DEPOT)', pacX + pacWidth / 2, pacY - portCellSize - 10);

    // --- BOTTOM EDGE: 8 green INPUT ports (items flow UP into PAC/depot) ---
    const bottomInputCount = 8;
    for (let i = 0; i < bottomInputCount; i++) {
      const portX = pacX + (i + 0.5) * (pacWidth / bottomInputCount) - portCellSize / 2;
      const portY = pacY + pacHeight + 4;

      // Green port background
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(portX, portY, portCellSize, portCellSize);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(portX, portY, portCellSize, portCellSize);

      // Up arrow (items flow UP into PAC = into depot)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const cx = portX + portCellSize / 2;
      const cy = portY + portCellSize / 2;
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx - 7, cy + 3);
      ctx.lineTo(cx + 7, cy + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Label below bottom input ports
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('INPUT PORTS (INTO DEPOT)', pacX + pacWidth / 2, pacY + pacHeight + portCellSize + 10);

    // --- RIGHT SIDE: Output ports 1, 2, 3 (orange, numbered) ---
    // These are configurable depot OUTPUT ports that dispatch items FROM depot
    const sidePortOffsets = [2, 4, 6]; // Y positions relative to PAC top
    sidePortOffsets.forEach((offset, i) => {
      const portX = pacX + pacWidth + 4;
      const portY = pacY + offset * CELL_SIZE + (CELL_SIZE - portCellSize) / 2;

      // Orange square (output port)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(portX, portY, portCellSize, portCellSize);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(portX, portY, portCellSize, portCellSize);

      // Port number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 1).toString(), portX + portCellSize / 2, portY + portCellSize / 2);
    });

    // RIGHT side label
    ctx.save();
    ctx.translate(pacX + pacWidth + portCellSize + 16, pacY + pacHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUTPUT (FROM DEPOT)', 0, 0);
    ctx.restore();

    // --- LEFT SIDE: Output ports 4, 5, 6 (orange, numbered) ---
    sidePortOffsets.forEach((offset, i) => {
      const portX = pacX - portCellSize - 4;
      const portY = pacY + offset * CELL_SIZE + (CELL_SIZE - portCellSize) / 2;

      // Orange square (output port)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(portX, portY, portCellSize, portCellSize);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(portX, portY, portCellSize, portCellSize);

      // Port number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 4).toString(), portX + portCellSize / 2, portY + portCellSize / 2);
    });

    // LEFT side label
    ctx.save();
    ctx.translate(pacX - portCellSize - 16, pacY + pacHeight / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OUTPUT (FROM DEPOT)', 0, 0);
    ctx.restore();

    // --- PAC center text ---
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROTOCOL', pacX + pacWidth / 2, pacY + pacHeight / 2 - 28);
    ctx.fillText('ANCHOR', pacX + pacWidth / 2, pacY + pacHeight / 2 - 8);
    ctx.fillText('CORE', pacX + pacWidth / 2, pacY + pacHeight / 2 + 12);

    // PAC size label
    ctx.fillStyle = '#4a7a8a';
    ctx.font = '10px monospace';
    ctx.fillText('9 × 9', pacX + pacWidth / 2, pacY + pacHeight / 2 + 36);

    // Legend: green = input, orange = output
    ctx.fillStyle = '#22c55e';
    ctx.font = '9px monospace';
    ctx.fillText('GREEN = Items INTO Depot', pacX + pacWidth / 2, pacY + pacHeight / 2 + 52);
    ctx.fillStyle = '#f97316';
    ctx.fillText('ORANGE = Items FROM Depot (6 total)', pacX + pacWidth / 2, pacY + pacHeight / 2 + 64);

    // Draw grid boundary indicator
    ctx.strokeStyle = '#2a3040';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(0, 0, GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    ctx.setLineDash([]);

    // Draw placed buildings
    state.grid.buildings.forEach((placedBuilding, index) => {
      const building = BUILDINGS.find(b => b.id === placedBuilding.buildingId);
      if (!building) return;

      const x = placedBuilding.x * CELL_SIZE;
      const y = placedBuilding.y * CELL_SIZE;
      const width = building.size.width * CELL_SIZE;
      const height = building.size.height * CELL_SIZE;

      // Building background with transparency
      ctx.fillStyle = CATEGORY_COLORS[building.category] + '99';
      ctx.fillRect(x, y, width, height);

      // Building border
      ctx.strokeStyle = CATEGORY_COLORS[building.category];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Building name (adjust font size based on building size)
      const fontSize = Math.min(width / 8, height / 3, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(building.name, x + width / 2, y + height / 2);

      // Show I/O and power info for larger buildings
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan, zoom, state.grid.buildings, canvasSize]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && state.toolMode === 'select') {
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
    setZoom(prev => Math.max(0.15, Math.min(3, prev * delta)));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.toolMode === 'build' && state.selectedBuilding) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x - canvasSize.width / 2) / zoom + GRID_WIDTH * CELL_SIZE / 2;
      const y = (e.clientY - rect.top - pan.y - canvasSize.height / 2) / zoom + GRID_HEIGHT * CELL_SIZE / 2;

      const gridX = Math.floor(x / CELL_SIZE);
      const gridY = Math.floor(y / CELL_SIZE);

      // Check if placement is valid (not on PAC and within bounds)
      const building = BUILDINGS.find(b => b.id === state.selectedBuilding);
      if (!building) return;

      const isOnPAC = gridX < PAC_X + PAC_SIZE && gridX + building.size.width > PAC_X &&
                      gridY < PAC_Y + PAC_SIZE && gridY + building.size.height > PAC_Y;

      if (gridX >= 0 && gridX + building.size.width <= GRID_WIDTH &&
          gridY >= 0 && gridY + building.size.height <= GRID_HEIGHT &&
          !isOnPAC) {
        dispatch({
          type: 'PLACE_BUILDING',
          building: {
            buildingId: state.selectedBuilding,
            x: gridX,
            y: gridY,
            rotation: 0,
          },
        });
      }
    }
  };

  const handleBuildingSelect = (buildingId: string) => {
    dispatch({ type: 'SET_SELECTED_BUILDING', buildingId });
    dispatch({ type: 'SET_TOOL_MODE', mode: 'build' });
    dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
  };

  const handleZoomToFit = () => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const gridPixelWidth = GRID_WIDTH * CELL_SIZE;
      const gridPixelHeight = GRID_HEIGHT * CELL_SIZE;
      const fitZoom = Math.min(
        canvasSize.width / (gridPixelWidth + 100),
        canvasSize.height / (gridPixelHeight + 100)
      );
      setPan({ x: 0, y: 0 });
      setZoom(Math.max(0.15, Math.min(2, fitZoom)));
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(0.45);
    }
  };

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

  // Calculate total power consumption
  const totalPower = state.grid.buildings.reduce((sum, pb) => {
    const building = BUILDINGS.find(b => b.id === pb.buildingId);
    return sum + (building?.power || 0);
  }, 0);

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Factory Planner</h1>
        <div className="text-sm text-gray-300">
          <span className="text-[var(--color-accent)] font-bold">{totalPower}</span>
          <span className="text-gray-400">/0 Power </span>
          <span className="text-[var(--color-accent)]">(Unlimited)</span>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${state.toolMode === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        />

        {/* Building Picker Panel */}
        {state.showBuildingPicker && (
          <div className="absolute top-0 left-0 h-full w-96 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-2xl">
            {/* Panel Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Building Library</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'list' })}
                  className={`p-2 rounded transition-colors ${state.viewMode === 'list' ? 'bg-[var(--color-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
                  title="List view"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
                  className={`p-2 rounded transition-colors ${state.viewMode === 'grid' ? 'bg-[var(--color-accent)] text-black' : 'text-gray-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_BUILDING_PICKER' })}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, category..."
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b border-[var(--color-border)] px-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', category })}
                  className={`px-3 py-2 whitespace-nowrap border-b-2 transition-all text-sm ${
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
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredBuildings.map((building) => (
                  <button
                    key={building.id}
                    onClick={() => handleBuildingSelect(building.id)}
                    className="w-full p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded hover:border-[var(--color-accent)] transition-all text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">
                            {building.name}
                          </h3>
                          {building.isFavorite && (
                            <Star size={14} className="text-[var(--color-accent)] fill-current flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{building.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="font-medium">Size: {building.size.width}x{building.size.height}</span>
                          <span>I/O: {building.inputs}/{building.outputs}</span>
                          {building.power > 0 && (
                            <span className="text-[var(--color-accent)] font-medium">{building.power}W</span>
                          )}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
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
                  <div className="text-center text-gray-500 py-8">
                    No buildings found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-3">
        <div className="flex flex-col gap-2">
          {/* Row 1: File/Data */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FILE_MENU' })}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white flex items-center gap-2 transition-colors"
              >
                <FileText size={16} />
                File
                <ChevronDown size={14} className="opacity-50" />
              </button>
              {state.showFileMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded shadow-xl py-1 min-w-[150px] z-10">
                  <button onClick={() => { dispatch({ type: 'CLEAR_GRID' }); dispatch({ type: 'TOGGLE_FILE_MENU' }); }} className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">New</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Load</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Save</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Export Image</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_DATA_MENU' })}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white flex items-center gap-2 transition-colors"
              >
                <Database size={16} />
                Data
                <ChevronDown size={14} className="opacity-50" />
              </button>
              {state.showDataMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded shadow-xl py-1 min-w-[150px] z-10">
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Import JSON</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Export JSON</button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Build tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_BUILDING_PICKER' });
                if (!state.showBuildingPicker) {
                  dispatch({ type: 'SET_TOOL_MODE', mode: 'build' });
                } else {
                  dispatch({ type: 'SET_TOOL_MODE', mode: 'select' });
                }
              }}
              className={`px-4 py-2 border border-[var(--color-border)] rounded text-white flex items-center gap-2 transition-all ${
                state.showBuildingPicker ? 'bg-[var(--color-accent)] text-black font-semibold' : 'bg-[var(--color-surface-2)] hover:bg-[#2A2A2A]'
              }`}
            >
              <Building2 size={16} />
              Build
            </button>

            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_EDIT_MENU' })}
                className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white flex items-center gap-2 transition-colors"
              >
                <Edit3 size={16} />
                Edit
                <ChevronDown size={14} className="opacity-50" />
              </button>
              {state.showEditMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded shadow-xl py-1 min-w-[150px] z-10">
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Delete</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Rotate</button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-[#2A2A2A] transition-colors">Copy</button>
                </div>
              )}
            </div>

            <button
              onClick={handleZoomToFit}
              className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white flex items-center gap-2 transition-colors"
              title="Zoom to fit"
            >
              <Maximize2 size={16} />
              Zoom to Fit
            </button>

            <div className="w-px h-8 bg-[var(--color-border)]" />

            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.grid.historyIndex === 0}
              className="px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>

            <button
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.grid.historyIndex === state.grid.history.length - 1}
              className="px-3 py-2 bg-[var(--color-surface-2)] hover:bg-[#2A2A2A] border border-[var(--color-border)] rounded text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>

            <div className="w-px h-8 bg-[var(--color-border)]" />

            <button
              onClick={() => dispatch({ type: 'TOGGLE_CONVEYORS' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all text-sm ${
                state.showConveyors ? 'bg-green-600 text-white font-medium' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Toggle conveyor display"
            >
              Conveyors
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_PIPES' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all text-sm ${
                state.showPipes ? 'bg-green-600 text-white font-medium' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Toggle pipe display"
            >
              Pipes
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_STATS' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all text-sm ${
                state.showStats ? 'bg-[var(--color-accent)] text-black font-medium' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Toggle statistics"
            >
              Stats
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_ANIM' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all text-sm ${
                state.showAnim ? 'bg-[var(--color-accent)] text-black font-medium' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Toggle animations"
            >
              Anim
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_AUTO_CONNECT' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all ${
                state.autoConnect ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Auto-connect buildings"
            >
              <Infinity size={16} />
            </button>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_BUS' })}
              className={`px-3 py-2 border border-[var(--color-border)] rounded transition-all ${
                state.showBus ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
              }`}
              title="Toggle depot bus"
            >
              <Bus size={16} />
            </button>

            <div className="w-px h-8 bg-[var(--color-border)]" />

            <div className="flex items-center gap-1">
              {[1, 2, 5, 10, 20].map((speed) => (
                <button
                  key={speed}
                  onClick={() => dispatch({ type: 'SET_SPEED', speed })}
                  className={`px-2.5 py-2 border border-[var(--color-border)] rounded transition-all text-sm ${
                    state.speed === speed ? 'bg-[var(--color-accent)] text-black font-semibold' : 'bg-[var(--color-surface-2)] text-white hover:bg-[#2A2A2A]'
                  }`}
                  title={`Speed: ${speed}x`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
