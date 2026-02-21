'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, Zap, ArrowRight,
  Package, Settings, ChevronRight, Layers,
  Calculator, ExternalLink, TrendingUp, Users, Star,
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { SCRAPED_BLUEPRINTS, type BlueprintEntry } from '@/data/blueprints';
import { usePersistStore } from '@/store/persistStore';

// ─── Types ──────────────────────────────────────────────────────────
interface RecipeItem { id: string; name: string; count: number }
interface Recipe {
  id: string; name: string; machine: string; machineName: string;
  inputs: RecipeItem[]; outputs: RecipeItem[];
  craftTime: number; power: number;
}
interface Building { id: string; name: string; power: number }
interface FactoryData {
  buildings: Record<string, Building>;
  items: Record<string, string>;
  recipes: Recipe[];
}
interface ChainNode {
  recipe: Recipe; outputItem: RecipeItem;
  children: ChainNode[]; depth: number;
}

const ITEM_ICON_URL = 'https://endfieldtools.dev/assets/images/endfield/itemicon';

const BUILDING_COLORS: Record<string, string> = {
  item_port_furnance_1: '#FF6B35', item_port_grinder_1: '#E74C3C', item_port_shaper_1: '#9B59B6',
  item_port_thickener_1: '#3498DB', item_port_winder_1: '#2ECC71', item_port_filling_pd_mc_1: '#F39C12',
  item_port_cmpt_mc_1: '#1ABC9C', item_port_tools_asm_mc_1: '#E67E22',
  item_port_seedcol_1: '#27AE60', item_port_planter_1: '#66BB6A', item_port_mix_pool_1: '#00BCD4',
  item_port_dismantler_1: '#95A5A6', item_port_xiranite_oven_1: '#FF5722',
  item_port_power_sta_1: '#F44336',
};

const BUILDING_LABELS: Record<string, string> = {
  item_port_furnance_1: 'Smelting', item_port_grinder_1: 'Grinding', item_port_shaper_1: 'Shaping',
  item_port_thickener_1: 'Thickening', item_port_winder_1: 'Winding', item_port_filling_pd_mc_1: 'Filling',
  item_port_cmpt_mc_1: 'Assembling', item_port_tools_asm_mc_1: 'Tool Assembly',
  item_port_seedcol_1: 'Seed Picking', item_port_planter_1: 'Planting', item_port_mix_pool_1: 'Mixing',
  item_port_dismantler_1: 'Dismantling', item_port_xiranite_oven_1: 'Xiranite Smelting',
  item_port_power_sta_1: 'Power Generation',
};

function slugToItemId(slug: string): string { return `item_${slug}`; }
function itemIdToSlug(itemId: string): string { return itemId.replace(/^item_/, ''); }

function pickBestRecipe(itemId: string, recipesForItem: Map<string, Recipe[]>): Recipe | null {
  const candidates = recipesForItem.get(itemId);
  if (!candidates || candidates.length === 0) return null;
  const rawPreferred = candidates.filter(r =>
    r.inputs.every(inp => !recipesForItem.has(inp.id) || recipesForItem.get(inp.id)!.length === 0)
  );
  return rawPreferred.length > 0 ? rawPreferred[0] : candidates[0];
}

function buildProductionTree(
  itemId: string, recipesForItem: Map<string, Recipe[]>,
  depth: number, visited: Set<string>,
): ChainNode | null {
  if (depth > 10 || visited.has(itemId)) return null;
  const recipe = pickBestRecipe(itemId, recipesForItem);
  if (!recipe) return null;
  const outputItem = recipe.outputs.find(o => o.id === itemId);
  if (!outputItem) return null;
  const newVisited = new Set(visited);
  newVisited.add(itemId);
  const children: ChainNode[] = [];
  for (const input of recipe.inputs) {
    const child = buildProductionTree(input.id, recipesForItem, depth + 1, newVisited);
    if (child) children.push(child);
  }
  return { recipe, outputItem, children, depth };
}

// ─── Flowchart Layout Engine ────────────────────────────────────────

interface FlowNode {
  id: string; type: 'item' | 'machine';
  itemId?: string; itemName?: string; itemCount?: number;
  isRaw?: boolean; isOutput?: boolean;
  machineName?: string; machineId?: string;
  craftTime?: number; power?: number;
  row: number; col: number; colSpan: number;
}
interface FlowEdge { fromId: string; toId: string }

function layoutFlowchart(
  rootNode: ChainNode, recipesForItem: Map<string, Recipe[]>,
): { nodes: FlowNode[]; edges: FlowEdge[]; totalRows: number; totalCols: number } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  let ctr = 0;

  function subtreeWidth(node: ChainNode): number {
    let w = 0;
    for (const input of node.recipe.inputs) {
      const child = node.children.find(c => c.outputItem.id === input.id);
      w += child ? subtreeWidth(child) : 1;
    }
    return Math.max(w, 1);
  }

  function place(node: ChainNode, colStart: number, bottomRow: number): string {
    const w = subtreeWidth(node);
    const outId = `n${ctr++}`;
    nodes.push({
      id: outId, type: 'item', itemId: node.outputItem.id,
      itemName: node.outputItem.name, itemCount: node.outputItem.count,
      isOutput: node.depth === 0, row: bottomRow, col: colStart, colSpan: w,
    });
    const mId = `n${ctr++}`;
    nodes.push({
      id: mId, type: 'machine', machineName: node.recipe.machineName,
      machineId: node.recipe.machine, craftTime: node.recipe.craftTime,
      power: node.recipe.power, row: bottomRow + 1, col: colStart, colSpan: w,
    });
    edges.push({ fromId: mId, toId: outId });

    let curCol = colStart;
    for (const input of node.recipe.inputs) {
      const child = node.children.find(c => c.outputItem.id === input.id);
      if (child) {
        const childOutId = place(child, curCol, bottomRow + 2);
        edges.push({ fromId: childOutId, toId: mId });
        curCol += subtreeWidth(child);
      } else {
        const rawId = `n${ctr++}`;
        nodes.push({
          id: rawId, type: 'item', itemId: input.id, itemName: input.name,
          itemCount: input.count, isRaw: true,
          row: bottomRow + 2, col: curCol, colSpan: 1,
        });
        edges.push({ fromId: rawId, toId: mId });
        curCol++;
      }
    }
    return outId;
  }

  place(rootNode, 0, 0);
  const maxRow = Math.max(...nodes.map(n => n.row), 0);
  for (const n of nodes) n.row = maxRow - n.row;
  return { nodes, edges, totalRows: maxRow + 1, totalCols: subtreeWidth(rootNode) };
}

// ─── Constants ──────────────────────────────────────────────────────
const CW = 160; // cell width
const CH = 110; // cell height
const CARD_W = 140;
const CARD_H_ITEM = 96;
const CARD_H_MACHINE = 40;
const PAD = 40;

// ─── ItemCard Component ─────────────────────────────────────────────
function ItemCard({ itemId, name, count, isRaw, isOutput, isClickable, onClick, recipesForItem }: {
  itemId: string; name: string; count: number;
  isRaw?: boolean; isOutput?: boolean;
  isClickable?: boolean; onClick?: () => void;
  recipesForItem?: Map<string, Recipe[]>;
}) {
  const borderColor = isRaw ? '#8B5CF6' : isOutput ? '#22d3ee' : '#2A2A2A';
  const glowColor = isRaw ? 'rgba(139,92,246,0.15)' : isOutput ? 'rgba(34,211,238,0.12)' : 'transparent';
  const bgColor = isRaw ? 'rgba(139,92,246,0.06)' : isOutput ? 'rgba(34,211,238,0.06)' : '#0d1117';

  // Check if this item has recipes (is craftable)
  const hasRecipes = recipesForItem?.has(itemId);
  const canClick = isClickable && hasRecipes;

  const content = (
    <div
      className={`relative flex flex-col items-center justify-center gap-1 border-2 transition-all ${canClick ? 'cursor-pointer hover:scale-105 hover:border-[var(--color-accent)]' : ''}`}
      style={{
        width: CARD_W, height: CARD_H_ITEM, borderColor, backgroundColor: bgColor,
        boxShadow: `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}`,
      }}
    >
      {/* Label badge */}
      {isRaw && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#8B5CF6] text-white z-10"
          style={{ letterSpacing: '0.12em' }}>
          RAW
        </span>
      )}
      {isOutput && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-[#22d3ee] text-black z-10"
          style={{ letterSpacing: '0.12em' }}>
          OUTPUT
        </span>
      )}

      {/* Item icon */}
      <div className="w-11 h-11 relative flex items-center justify-center">
        <Image
          src={`${ITEM_ICON_URL}/${itemId}.png`}
          alt={name}
          width={44}
          height={44}
          className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]"
          unoptimized
        />
      </div>

      {/* Name */}
      <p className="text-[11px] text-center leading-tight text-white/90 font-medium px-2 truncate w-full">
        {name}
      </p>

      {/* Quantity badge */}
      <div className="flex items-center gap-0.5">
        <span className="text-[12px] font-mono font-bold text-[var(--color-accent)]">
          x{count}
        </span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor }} />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor }} />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor }} />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor }} />
    </div>
  );

  if (canClick && onClick) {
    return <button onClick={onClick} className="focus:outline-none">{content}</button>;
  }
  return content;
}

// ─── MachineLabel Component ─────────────────────────────────────────
function MachineLabel({ machineId, machineName, craftTime }: {
  machineId: string; machineName: string; craftTime: number;
}) {
  const color = BUILDING_COLORS[machineId] || '#FFD429';
  const label = BUILDING_LABELS[machineId] || machineName;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-black whitespace-nowrap shadow-lg"
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 12px ${color}40`,
      }}
    >
      <Settings size={11} className="opacity-70" />
      <span>{label}</span>
      <span className="opacity-60 text-[10px] flex items-center gap-0.5 ml-1">
        <Clock size={9} /> {craftTime}s
      </span>
    </div>
  );
}

// ─── FlowchartView Component ────────────────────────────────────────
function FlowchartView({
  rootNode, recipesForItem, onItemClick,
}: {
  rootNode: ChainNode; recipesForItem: Map<string, Recipe[]>;
  onItemClick?: (itemId: string) => void;
}) {
  const { nodes, edges, totalRows, totalCols } = useMemo(
    () => layoutFlowchart(rootNode, recipesForItem),
    [rootNode, recipesForItem]
  );

  const svgW = totalCols * CW;
  const svgH = totalRows * CH;

  const nodeMap = useMemo(() => {
    const m = new Map<string, FlowNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const getCenter = useCallback((node: FlowNode, edge: 'top' | 'bottom') => {
    const cx = (node.col + node.colSpan / 2) * CW;
    const h = node.type === 'item' ? CARD_H_ITEM : CARD_H_MACHINE;
    const cy = node.row * CH + (edge === 'top' ? 0 : h);
    return { x: cx, y: cy };
  }, []);

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="relative"
        style={{
          width: svgW + PAD * 2,
          minHeight: svgH + PAD * 2,
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.02) 0%, transparent 70%)',
        }}
      >
        {/* Grid pattern background */}
        <svg className="absolute inset-0 pointer-events-none opacity-10" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22d3ee" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* SVG arrows layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgW + PAD * 2}
          height={svgH + PAD * 2}
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="8" refX="5" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#22d3ee" fillOpacity="0.6" />
            </marker>
            <linearGradient id="edgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {edges.map((edge, i) => {
            const from = nodeMap.get(edge.fromId);
            const to = nodeMap.get(edge.toId);
            if (!from || !to) return null;

            const p1 = getCenter(from, 'bottom');
            const p2 = getCenter(to, 'top');
            const x1 = p1.x + PAD;
            const y1 = p1.y + PAD;
            const x2 = p2.x + PAD;
            const y2 = p2.y + PAD - 6;

            // Smooth bezier curves
            if (Math.abs(x1 - x2) < 2) {
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#22d3ee" strokeOpacity="0.25" strokeWidth="2"
                    markerEnd="url(#arrow)" />
                  {/* Animated flow dot */}
                  <circle r="2.5" fill="#22d3ee" opacity="0.7">
                    <animateMotion dur="2s" repeatCount="indefinite"
                      path={`M ${x1} ${y1} L ${x2} ${y2}`} />
                  </circle>
                </g>
              );
            }

            const midY = (y1 + y2) / 2;
            const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
            return (
              <g key={i}>
                <path d={path} fill="none" stroke="#22d3ee" strokeOpacity="0.25"
                  strokeWidth="2" markerEnd="url(#arrow)" />
                <circle r="2.5" fill="#22d3ee" opacity="0.7">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Node cards layer */}
        <div className="relative" style={{ padding: PAD, zIndex: 2 }}>
          {nodes.map(node => {
            const cx = (node.col + node.colSpan / 2) * CW;
            const y = node.row * CH;

            if (node.type === 'machine') {
              return (
                <div key={node.id} className="absolute flex items-center justify-center"
                  style={{ left: cx - CARD_W / 2, top: y, width: CARD_W, height: CARD_H_MACHINE }}>
                  <MachineLabel
                    machineId={node.machineId || ''}
                    machineName={node.machineName || ''}
                    craftTime={node.craftTime || 0}
                  />
                </div>
              );
            }

            return (
              <div key={node.id} className="absolute"
                style={{ left: cx - CARD_W / 2, top: y }}>
                <ItemCard
                  itemId={node.itemId || ''}
                  name={node.itemName || ''}
                  count={node.itemCount || 0}
                  isRaw={node.isRaw}
                  isOutput={node.isOutput}
                  isClickable={true}
                  recipesForItem={recipesForItem}
                  onClick={() => onItemClick?.(node.itemId || '')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Production Rate Calculator Component ──────────────────────────
function ProductionRateCalculator({ recipe }: { recipe: Recipe }) {
  const [desiredRate, setDesiredRate] = useState<string>('60');

  const calculations = useMemo(() => {
    const rate = parseFloat(desiredRate) || 0;
    if (rate <= 0) return null;

    const outputItem = recipe.outputs[0];
    const cycleTime = recipe.craftTime; // seconds
    const outputPerCycle = outputItem.count;
    const outputPerMinute = (outputPerCycle / cycleTime) * 60;

    const machinesNeeded = Math.ceil(rate / outputPerMinute);
    const actualOutput = machinesNeeded * outputPerMinute;
    const totalPower = machinesNeeded * recipe.power;

    const inputsPerMin = recipe.inputs.map(inp => ({
      ...inp,
      ratePerMin: (inp.count / cycleTime) * 60 * machinesNeeded,
    }));

    return {
      machinesNeeded,
      actualOutput: actualOutput.toFixed(2),
      totalPower,
      inputsPerMin,
    };
  }, [desiredRate, recipe]);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
        <Calculator size={14} className="text-[var(--color-accent)]" />
        <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Production Rate Calculator</span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm text-white/80">Desired Output Rate:</label>
          <input
            type="number"
            value={desiredRate}
            onChange={(e) => setDesiredRate(e.target.value)}
            className="px-3 py-2 bg-[#0c1018] border border-[var(--color-border)] text-white text-sm font-mono focus:border-[var(--color-accent)] outline-none transition-colors"
            min="0"
            step="1"
          />
          <span className="text-sm text-white/60 font-mono">items/min</span>
        </div>

        {calculations && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - Summary */}
            <div className="space-y-3">
              <div className="bg-[#0c1018] border border-[var(--color-border)] p-4">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Machines Required</div>
                <div className="text-2xl font-bold text-[var(--color-accent)] font-mono">{calculations.machinesNeeded}</div>
              </div>

              <div className="bg-[#0c1018] border border-[var(--color-border)] p-4">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Actual Output</div>
                <div className="text-2xl font-bold text-[#22d3ee] font-mono">{calculations.actualOutput} <span className="text-sm text-white/40">/min</span></div>
              </div>

              <div className="bg-[#0c1018] border border-[var(--color-border)] p-4">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Zap size={10} /> Total Power Consumption
                </div>
                <div className="text-2xl font-bold text-[#F39C12] font-mono">{calculations.totalPower} <span className="text-sm text-white/40">W</span></div>
              </div>
            </div>

            {/* Right column - Input materials */}
            <div className="bg-[#0c1018] border border-[var(--color-border)] p-4">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Input Materials Required</div>
              <div className="space-y-2">
                {calculations.inputsPerMin.map((inp, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 relative">
                        <Image src={`${ITEM_ICON_URL}/${inp.id}.png`} alt={inp.name}
                          width={24} height={24} className="object-contain" unoptimized />
                      </div>
                      <span className="text-xs text-white/80">{inp.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-[var(--color-accent)]">
                      {inp.ratePerMin.toFixed(1)} <span className="text-[10px] text-white/40">/min</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blueprint Card Component ───────────────────────────────────────
function BlueprintCard({ blueprint }: { blueprint: BlueprintEntry }) {
  return (
    <Link href={`/blueprints/${blueprint.slug}`}
      className="block bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden transition-all hover:border-[var(--color-accent)] hover:shadow-lg group">
      {/* Preview image */}
      {blueprint.previewImage && (
        <div className="relative w-full h-40 bg-[#0c1018] overflow-hidden">
          <Image
            src={blueprint.previewImage}
            alt={blueprint.Title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] to-transparent" />
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
          {blueprint.Title}
        </h3>

        {/* Author & Stats */}
        <div className="flex items-center gap-3 text-[10px] text-white/40 mb-3">
          <span className="flex items-center gap-1">
            <Users size={10} /> {blueprint.Author}
          </span>
          {blueprint.netPower !== undefined && (
            <span className="flex items-center gap-1">
              <Zap size={10} /> {blueprint.netPower > 0 ? '+' : ''}{blueprint.netPower}W
            </span>
          )}
        </div>

        {/* Outputs */}
        <div className="space-y-1">
          {blueprint.outputsPerMin.slice(0, 3).map((output, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-white/60">{output.name}</span>
              <span className="font-mono font-bold text-[var(--color-accent)]">{output.rate}/min</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {blueprint.Tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {blueprint.Tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[8px] px-1.5 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View link */}
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Blueprint</span>
          <ExternalLink size={10} />
        </div>
      </div>
    </Link>
  );
}

// ─── Recipe Flow (horizontal input -> machine -> output) ────────────
function RecipeFlowView({ recipe }: { recipe: Recipe }) {
  const machineColor = BUILDING_COLORS[recipe.machine] || '#FFD429';
  const machineLabel = BUILDING_LABELS[recipe.machine] || recipe.machineName;

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center py-6">
      {/* Inputs */}
      <div className="flex items-center gap-2 flex-wrap">
        {recipe.inputs.map((inp, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0c1018] border border-[#1e2a3a]"
            style={{ minWidth: 120 }}>
            <div className="w-9 h-9 relative shrink-0">
              <Image src={`${ITEM_ICON_URL}/${inp.id}.png`} alt={inp.name}
                width={36} height={36} className="object-contain" unoptimized />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/80 truncate">{inp.name}</p>
              <p className="text-[11px] font-mono font-bold text-[var(--color-accent)]">x{inp.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow + Machine */}
      <div className="flex items-center gap-2">
        <ChevronRight size={20} className="text-white/30" />
        <div className="flex flex-col items-center gap-1">
          <div className="px-4 py-2 text-xs font-bold text-black flex items-center gap-2 shadow-lg"
            style={{ backgroundColor: machineColor, boxShadow: `0 4px 20px ${machineColor}30` }}>
            <Settings size={13} className="opacity-60" />
            {machineLabel}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/50">
            <span className="flex items-center gap-1"><Clock size={10} /> {recipe.craftTime}s</span>
            <span className="flex items-center gap-1"><Zap size={10} /> {recipe.power}W</span>
          </div>
        </div>
        <ChevronRight size={20} className="text-white/30" />
      </div>

      {/* Outputs */}
      <div className="flex items-center gap-2 flex-wrap">
        {recipe.outputs.map((out, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[rgba(34,211,238,0.05)] border-2 border-[#22d3ee]/40"
            style={{ minWidth: 120 }}>
            <div className="w-9 h-9 relative shrink-0">
              <Image src={`${ITEM_ICON_URL}/${out.id}.png`} alt={out.name}
                width={36} height={36} className="object-contain" unoptimized />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#22d3ee] font-bold truncate">{out.name}</p>
              <p className="text-[11px] font-mono font-bold text-[var(--color-accent)]">x{out.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function RecipeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const itemId = slugToItemId(slug);

  const [factoryData, setFactoryData] = useState<FactoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRecipeIdx, setActiveRecipeIdx] = useState(0);

  // Persist store for bookmarks and recent recipes
  const { toggleRecipeBookmark, isRecipeBookmarked, addRecentRecipe } = usePersistStore();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Handle item click in flowchart - navigate to item's recipe page
  const handleItemClick = useCallback((clickedItemId: string) => {
    window.location.href = `/factory-planner/recipes/${itemIdToSlug(clickedItemId)}`;
  }, []);

  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(r => r.json())
      .then((data: FactoryData) => { setFactoryData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const itemRecipes = useMemo(() => {
    if (!factoryData) return [];
    return factoryData.recipes.filter(r => r.outputs.some(o => o.id === itemId));
  }, [factoryData, itemId]);

  const itemName = useMemo(() => {
    if (!factoryData) return slug;
    return factoryData.items[itemId] || slug;
  }, [factoryData, itemId, slug]);

  // Track this recipe view and check bookmark status
  useEffect(() => {
    if (itemName && itemName !== slug) {
      addRecentRecipe(itemId, itemName);
    }
    setIsBookmarked(isRecipeBookmarked(itemId));
  }, [itemId, itemName, slug, addRecentRecipe, isRecipeBookmarked]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(() => {
    const newState = toggleRecipeBookmark(itemId);
    setIsBookmarked(newState);
  }, [itemId, toggleRecipeBookmark]);

  const recipesForItem = useMemo(() => {
    if (!factoryData) return new Map<string, Recipe[]>();
    const map = new Map<string, Recipe[]>();
    for (const r of factoryData.recipes) {
      for (const o of r.outputs) {
        const existing = map.get(o.id);
        if (existing) existing.push(r);
        else map.set(o.id, [r]);
      }
    }
    return map;
  }, [factoryData]);

  const productionChains = useMemo(() => {
    if (!factoryData || itemRecipes.length === 0) return [];
    return itemRecipes.map(recipe => {
      const outputItem = recipe.outputs.find(o => o.id === itemId)!;
      const visited = new Set<string>([itemId]);
      const children: ChainNode[] = [];
      for (const input of recipe.inputs) {
        const child = buildProductionTree(input.id, recipesForItem, 1, visited);
        if (child) children.push(child);
      }
      const rootNode: ChainNode = { recipe, outputItem, children, depth: 0 };
      const cyclesPerMin = 60 / recipe.craftTime;
      const maxPerMin = outputItem.count * cyclesPerMin;
      return { rootNode, maxPerMin, recipe };
    });
  }, [factoryData, itemRecipes, itemId, recipesForItem]);

  const getAllRawMaterials = useCallback(
    (node: ChainNode): { id: string; name: string }[] => {
      const raw = new Map<string, string>();
      const collect = (n: ChainNode) => {
        for (const inp of n.recipe.inputs) {
          if (!recipesForItem.has(inp.id)) raw.set(inp.id, inp.name);
        }
        for (const child of n.children) collect(child);
      };
      collect(node);
      return Array.from(raw.entries()).map(([id, name]) => ({ id, name }));
    },
    [recipesForItem]
  );

  // Find blueprints that produce this item
  const relatedBlueprints = useMemo(() => {
    return SCRAPED_BLUEPRINTS.filter(bp =>
      bp.outputsPerMin.some(output =>
        output.name.toLowerCase() === itemName.toLowerCase()
      )
    );
  }, [itemName]);

  // Find recipes that use this item as input (Used In)
  const usedInRecipes = useMemo(() => {
    if (!factoryData) return [];
    const using = new Map<string, { recipe: Recipe; outputItem: RecipeItem }>();

    for (const recipe of factoryData.recipes) {
      // Check if this recipe uses our item as input
      const usesItem = recipe.inputs.some(inp => inp.id === itemId);
      if (usesItem) {
        // Get the main output of this recipe
        const mainOutput = recipe.outputs[0];
        using.set(mainOutput.id, { recipe, outputItem: mainOutput });
      }
    }

    return Array.from(using.values());
  }, [factoryData, itemId]);

  if (loading) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="diamond-spinner mx-auto mb-4" />
          <p className="terminal-text">Loading recipe data...</p>
        </div>
      </div>
    );
  }

  if (!factoryData || itemRecipes.length === 0) {
    return (
      <div className="min-h-screen text-[var(--color-text-secondary)]">
        <div className="max-w-7xl mx-auto">
          <Link href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-6">
            <ArrowLeft size={14} /> Back to Recipes
          </Link>
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
            <p className="text-[var(--color-text-tertiary)]">
              {factoryData ? `No recipes found for "${slug}"` : 'Failed to load recipe data.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeChain = productionChains[activeRecipeIdx];
  const rawMats = activeChain ? getAllRawMaterials(activeChain.rootNode) : [];
  const activeMachineColor = BUILDING_COLORS[activeChain?.recipe.machine || ''] || '#FFD429';

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)] mb-6">
          <Link href="/factory-planner" className="hover:text-[var(--color-accent)] transition-colors">Factory Planner</Link>
          <ChevronRight size={14} />
          <Link href="/recipes" className="hover:text-[var(--color-accent)] transition-colors">Recipes</Link>
          <ChevronRight size={14} />
          <span className="text-white">{itemName}</span>
        </div>

        {/* RIOS Header */}
        <RIOSHeader
          title={itemName}
          subtitle="Crafting Protocol"
          category="LOGISTICS"
          code="RIOS-REC-001"
        />

        {/* Item Hero Section */}
        <div className="relative mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
          {/* Background gradient accent */}
          <div className="absolute inset-0 opacity-30"
            style={{ background: `linear-gradient(135deg, ${activeMachineColor}08 0%, transparent 50%)` }} />

          <div className="relative p-6">
            <div className="flex items-start gap-6">
              {/* Item icon - large */}
              <div className="w-24 h-24 relative bg-[#080c12] border-2 flex items-center justify-center overflow-hidden shrink-0"
                style={{ borderColor: activeMachineColor + '60' }}>
                <Image
                  src={`${ITEM_ICON_URL}/${itemId}.png`}
                  alt={itemName}
                  width={96}
                  height={96}
                  className="object-contain"
                  unoptimized
                />
                {/* Glow effect */}
                <div className="absolute inset-0"
                  style={{ boxShadow: `inset 0 0 30px ${activeMachineColor}15` }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold text-white tracking-wide uppercase flex-1"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {itemName}
                  </h1>
                  <button
                    onClick={handleBookmarkToggle}
                    className={`p-3 transition-all ${
                      isBookmarked
                        ? 'bg-[var(--color-accent)] text-black hover:opacity-80'
                        : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this recipe'}
                  >
                    <Star size={20} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                </div>

                <div className="flex items-center gap-5 mt-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                    <Layers size={14} className="text-[var(--color-accent)]" />
                    {itemRecipes.length} recipe{itemRecipes.length > 1 ? 's' : ''} available
                  </span>
                  {activeChain && (
                    <>
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                        <Clock size={14} className="text-[var(--color-accent)]" />
                        {activeChain.recipe.craftTime}s craft time
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                        <Zap size={14} className="text-[var(--color-accent)]" />
                        {activeChain.recipe.power}W
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-bold font-mono"
                        style={{ color: activeMachineColor }}>
                        <ArrowRight size={14} />
                        {activeChain.maxPerMin.toFixed(1)}/min
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Selector Tabs */}
        {itemRecipes.length > 1 && (
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {itemRecipes.map((recipe, idx) => {
              const color = BUILDING_COLORS[recipe.machine] || '#FFD429';
              const label = BUILDING_LABELS[recipe.machine] || recipe.machineName;
              const isActive = idx === activeRecipeIdx;
              return (
                <button
                  key={recipe.id}
                  onClick={() => setActiveRecipeIdx(idx)}
                  className={`px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap border-2 ${
                    isActive
                      ? 'text-black scale-[1.02]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-white/20'
                  }`}
                  style={isActive ? {
                    backgroundColor: color, borderColor: color,
                    boxShadow: `0 4px 20px ${color}30`,
                  } : undefined}
                >
                  <span className="flex items-center gap-2">
                    <Settings size={13} className={isActive ? 'opacity-60' : 'opacity-40'} />
                    Recipe {idx + 1}: {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Recipe Flow (horizontal: inputs -> machine -> outputs) */}
        {activeChain && (
          <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: activeMachineColor }} />
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Recipe Overview</span>
            </div>
            <RecipeFlowView recipe={activeChain.recipe} />
          </div>
        )}

        {/* Simulate in Factory Planner Button */}
        <div className="mb-8">
          <Link
            href={`/factory-planner/planner?simulate=${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 hover:shadow-lg"
          >
            <TrendingUp size={16} />
            Simulate in Factory Planner
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Related Items - Navigation Links */}
        {(activeChain && (activeChain.recipe.inputs.length > 0 || usedInRecipes.length > 0)) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Related Items</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Items */}
              {activeChain.recipe.inputs.length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                  <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ArrowRight size={12} className="text-[var(--color-accent)]" />
                    Required Inputs
                  </h3>
                  <div className="space-y-2">
                    {activeChain.recipe.inputs.map((inp, i) => (
                      <Link
                        key={i}
                        href={`/factory-planner/recipes/${itemIdToSlug(inp.id)}`}
                        className="flex items-center gap-3 p-2 bg-[#0c1018] border border-[var(--color-border)] transition-all hover:border-[var(--color-accent)] group"
                      >
                        <div className="w-8 h-8 relative">
                          <Image src={`${ITEM_ICON_URL}/${inp.id}.png`} alt={inp.name}
                            width={32} height={32} className="object-contain" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 group-hover:text-[var(--color-accent)] transition-colors">{inp.name}</p>
                          <p className="text-[10px] text-white/40">x{inp.count} per cycle</p>
                        </div>
                        <ChevronRight size={14} className="text-white/30 group-hover:text-[var(--color-accent)] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Used In */}
              {usedInRecipes.length > 0 && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
                  <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ArrowLeft size={12} className="text-[#22d3ee]" />
                    Used In
                  </h3>
                  <div className="space-y-2">
                    {usedInRecipes.slice(0, 5).map(({ recipe, outputItem }, i) => (
                      <Link
                        key={i}
                        href={`/factory-planner/recipes/${itemIdToSlug(outputItem.id)}`}
                        className="flex items-center gap-3 p-2 bg-[#0c1018] border border-[var(--color-border)] transition-all hover:border-[#22d3ee] group"
                      >
                        <div className="w-8 h-8 relative">
                          <Image src={`${ITEM_ICON_URL}/${outputItem.id}.png`} alt={outputItem.name}
                            width={32} height={32} className="object-contain" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 group-hover:text-[#22d3ee] transition-colors">{outputItem.name}</p>
                          <p className="text-[10px] text-white/40">{recipe.machineName}</p>
                        </div>
                        <ChevronRight size={14} className="text-white/30 group-hover:text-[#22d3ee] transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Production Rate Calculator */}
        {activeChain && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-[var(--color-accent)] rotate-45" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Production Planning</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-accent)]/20 to-transparent ml-2" />
            </div>
            <ProductionRateCalculator recipe={activeChain.recipe} />
          </div>
        )}

        {/* Raw Materials Section */}
        {rawMats.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-[#8B5CF6] rotate-45" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Raw Materials Required</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {rawMats.map(mat => (
                <div key={mat.id}
                  className="flex items-center gap-2.5 px-3 py-2 bg-[rgba(139,92,246,0.05)] border border-[#8B5CF6]/30 transition-colors hover:border-[#8B5CF6]/60">
                  <div className="w-7 h-7 relative">
                    <Image src={`${ITEM_ICON_URL}/${mat.id}.png`} alt={mat.name}
                      width={28} height={28} className="object-contain" unoptimized />
                  </div>
                  <span className="text-xs text-white/80">{mat.name}</span>
                  <span className="text-[8px] font-bold uppercase text-[#8B5CF6] tracking-wider px-1.5 py-0.5 bg-[#8B5CF6]/10">
                    RAW
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Chain Flowchart */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-[#22d3ee] rotate-45" />
            <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Full Production Chain</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#22d3ee]/20 to-transparent ml-2" />
          </div>

          {activeChain && (
            <div className="bg-[#060a10] border border-[var(--color-border)] overflow-hidden">
              {/* Flowchart header bar */}
              <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                  CHAIN // {itemName} // RECIPE {activeRecipeIdx + 1}
                </span>
                <span className="text-[10px] text-white/30 font-mono">
                  DEPTH: {activeChain.rootNode.children.length > 0 ? 'MULTI-STAGE' : 'SINGLE-STAGE'}
                </span>
              </div>

              <FlowchartView
                rootNode={activeChain.rootNode}
                recipesForItem={recipesForItem}
                onItemClick={handleItemClick}
              />
            </div>
          )}
        </div>

        {/* Community Blueprints Section */}
        {relatedBlueprints.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-[#8B5CF6] rotate-45" />
              <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Community Blueprints</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#8B5CF6]/20 to-transparent ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedBlueprints.map(bp => (
                <BlueprintCard key={bp.id} blueprint={bp} />
              ))}
            </div>

            {relatedBlueprints.length === 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center">
                <p className="text-sm text-white/40">No community blueprints found for this item yet.</p>
                <p className="text-xs text-white/30 mt-2">Be the first to share a blueprint!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
