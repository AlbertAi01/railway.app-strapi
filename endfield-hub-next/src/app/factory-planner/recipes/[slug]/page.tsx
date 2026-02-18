'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, Zap, ArrowDown,
  Package, Settings,
} from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

// ─── Types ──────────────────────────────────────────────────────────
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

interface Building {
  id: string;
  name: string;
  power: number;
}

interface FactoryData {
  buildings: Record<string, Building>;
  items: Record<string, string>;
  recipes: Recipe[];
}

// Flowchart node - flattened for layout
interface FlowNode {
  id: string;
  type: 'item' | 'machine';
  itemId?: string;
  itemName?: string;
  itemCount?: number;
  isRaw?: boolean;
  isOutput?: boolean;
  machineName?: string;
  machineId?: string;
  craftTime?: number;
  power?: number;
  row: number;
  col: number;
  colSpan: number;
}

interface FlowEdge {
  fromId: string;
  toId: string;
}

// Production chain tree node
interface ChainNode {
  recipe: Recipe;
  outputItem: RecipeItem;
  children: ChainNode[];
  depth: number;
}

const ITEM_ICON_URL = 'https://endfieldtools.dev/assets/images/endfield/itemicon';

const BUILDING_COLORS: Record<string, string> = {
  furnance_1: '#FF6B35',
  grinder_1: '#E74C3C',
  shaper_1: '#9B59B6',
  thickener_1: '#3498DB',
  winder_1: '#2ECC71',
  filling_powder_mc_1: '#F39C12',
  component_mc_1: '#1ABC9C',
  tools_assebling_mc_1: '#E67E22',
  seedcollector_1: '#27AE60',
  planter_1: '#66BB6A',
  mix_pool_1: '#00BCD4',
  dismantler_1: '#95A5A6',
  xiranite_oven_1: '#FF5722',
};

function slugToItemId(slug: string): string {
  return `item_${slug}`;
}

function pickBestRecipe(itemId: string, recipesForItem: Map<string, Recipe[]>): Recipe | null {
  const candidates = recipesForItem.get(itemId);
  if (!candidates || candidates.length === 0) return null;
  const rawPreferred = candidates.filter(r =>
    r.inputs.every(inp => !recipesForItem.has(inp.id) || recipesForItem.get(inp.id)!.length === 0)
  );
  if (rawPreferred.length > 0) return rawPreferred[0];
  return candidates[0];
}

function buildProductionTree(
  itemId: string,
  recipesForItem: Map<string, Recipe[]>,
  depth: number,
  visited: Set<string>,
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
// Converts a ChainNode tree into a flat list of positioned FlowNodes + edges
// Layout: raw materials at top flowing down to final output at bottom

function layoutFlowchart(
  rootNode: ChainNode,
  recipesForItem: Map<string, Recipe[]>,
): { nodes: FlowNode[]; edges: FlowEdge[]; totalRows: number; totalCols: number } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  let nodeCounter = 0;

  function getSubtreeWidth(node: ChainNode, recipesMap: Map<string, Recipe[]>): number {
    // Width = sum of widths of all input sub-trees + raw inputs
    let width = 0;
    for (const input of node.recipe.inputs) {
      const childNode = node.children.find(c => c.outputItem.id === input.id);
      if (childNode) {
        width += getSubtreeWidth(childNode, recipesMap);
      } else {
        width += 1; // raw material takes 1 column
      }
    }
    return Math.max(width, 1);
  }

  const totalWidth = getSubtreeWidth(rootNode, recipesForItem);

  // Now place nodes with absolute positions
  // Row 0 = top (final output), higher rows = deeper (raw materials)
  // We'll build bottom-up and then flip

  function placeNode(
    node: ChainNode,
    colStart: number,
    bottomRow: number,
  ): string {
    const width = getSubtreeWidth(node, recipesForItem);

    // Place output item at bottomRow (will become the top after flip)
    const outputId = `node-${nodeCounter++}`;
    const outputRow = bottomRow;
    nodes.push({
      id: outputId,
      type: 'item',
      itemId: node.outputItem.id,
      itemName: node.outputItem.name,
      itemCount: node.outputItem.count,
      isOutput: node.depth === 0,
      row: outputRow,
      col: colStart,
      colSpan: width,
    });

    // Place machine badge above output
    const machineRow = bottomRow + 1;
    const machineId = `node-${nodeCounter++}`;
    nodes.push({
      id: machineId,
      type: 'machine',
      machineName: node.recipe.machineName,
      machineId: node.recipe.machine,
      craftTime: node.recipe.craftTime,
      power: node.recipe.power,
      row: machineRow,
      col: colStart,
      colSpan: width,
    });
    edges.push({ fromId: machineId, toId: outputId });

    // Place inputs above machine
    const inputRow = machineRow + 1;
    let currentCol = colStart;

    for (const input of node.recipe.inputs) {
      const childNode = node.children.find(c => c.outputItem.id === input.id);
      if (childNode) {
        // Recurse - place sub-tree, its output feeds into our machine
        const childOutputId = placeNode(childNode, currentCol, inputRow);
        edges.push({ fromId: childOutputId, toId: machineId });
        currentCol += getSubtreeWidth(childNode, recipesForItem);
      } else {
        // Raw material
        const rawId = `node-${nodeCounter++}`;
        nodes.push({
          id: rawId,
          type: 'item',
          itemId: input.id,
          itemName: input.name,
          itemCount: input.count,
          isRaw: true,
          row: inputRow,
          col: currentCol,
          colSpan: 1,
        });
        edges.push({ fromId: rawId, toId: machineId });
        currentCol += 1;
      }
    }

    return outputId;
  }

  placeNode(rootNode, 0, 0);

  // Find max row to flip (we built bottom=0, but want to display top=0 as final output)
  const maxRow = Math.max(...nodes.map(n => n.row), 0);
  for (const node of nodes) {
    node.row = maxRow - node.row;
  }

  return { nodes, edges, totalRows: maxRow + 1, totalCols: totalWidth };
}


// ─── Flowchart Renderer ─────────────────────────────────────────────

const CELL_WIDTH = 140;
const CELL_HEIGHT = 100;
const CARD_WIDTH = 120;
const CARD_HEIGHT_ITEM = 84;
const CARD_HEIGHT_MACHINE = 36;

function FlowchartView({
  rootNode,
  recipesForItem,
}: {
  rootNode: ChainNode;
  recipesForItem: Map<string, Recipe[]>;
}) {
  const { nodes, edges, totalRows, totalCols } = useMemo(
    () => layoutFlowchart(rootNode, recipesForItem),
    [rootNode, recipesForItem]
  );

  const svgWidth = totalCols * CELL_WIDTH;
  const svgHeight = totalRows * CELL_HEIGHT;
  const padding = 32;

  const getNodeTop = useCallback((node: FlowNode) => {
    const centerCol = node.col + node.colSpan / 2;
    return { x: centerCol * CELL_WIDTH, y: node.row * CELL_HEIGHT };
  }, []);

  const getNodeBottom = useCallback((node: FlowNode) => {
    const centerCol = node.col + node.colSpan / 2;
    const h = node.type === 'item' ? CARD_HEIGHT_ITEM : CARD_HEIGHT_MACHINE;
    return { x: centerCol * CELL_WIDTH, y: node.row * CELL_HEIGHT + h };
  }, []);

  const nodeMap = useMemo(() => {
    const m = new Map<string, FlowNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  return (
    <div className="overflow-x-auto">
      <div
        className="relative border-2 border-[var(--color-accent)]/30 bg-[#080c12]"
        style={{
          width: svgWidth + padding * 2,
          minHeight: svgHeight + padding * 2,
        }}
      >
        {/* SVG layer for arrows */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgWidth + padding * 2}
          height={svgHeight + padding * 2}
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="4"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" fillOpacity="0.7" />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.fromId);
            const toNode = nodeMap.get(edge.toId);
            if (!fromNode || !toNode) return null;

            const from = getNodeBottom(fromNode);
            const to = getNodeTop(toNode);

            // Offset by padding
            const x1 = from.x + padding;
            const y1 = from.y + padding;
            const x2 = to.x + padding;
            const y2 = to.y + padding;

            const midY = (y1 + y2) / 2;

            return (
              <path
                key={i}
                d={
                  x1 === x2
                    ? `M ${x1} ${y1} L ${x2} ${y2 - 4}`
                    : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2 - 4}`
                }
                fill="none"
                stroke="var(--color-accent)"
                strokeOpacity="0.5"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>

        {/* Node cards */}
        <div className="relative" style={{ padding, zIndex: 2 }}>
          {nodes.map(node => {
            const centerCol = node.col + node.colSpan / 2;
            const x = centerCol * CELL_WIDTH;
            const y = node.row * CELL_HEIGHT;

            if (node.type === 'machine') {
              const color = BUILDING_COLORS[node.machineId || ''] || 'var(--color-accent)';
              return (
                <div
                  key={node.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: x - CARD_WIDTH / 2,
                    top: y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT_MACHINE,
                  }}
                >
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-black whitespace-nowrap"
                    style={{ backgroundColor: color }}
                  >
                    <span>{node.machineName}</span>
                    <span className="opacity-70 flex items-center gap-0.5">
                      <Clock size={9} /> {node.craftTime}s
                    </span>
                  </div>
                </div>
              );
            }

            // Item card
            const isRaw = node.isRaw;
            const isOutput = node.isOutput;
            const borderColor = isRaw
              ? '#8B5CF6'
              : isOutput
                ? 'var(--color-accent)'
                : 'var(--color-border)';
            const bgColor = isRaw
              ? 'rgba(139, 92, 246, 0.08)'
              : isOutput
                ? 'rgba(0, 176, 255, 0.08)'
                : '#0d1117';

            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: x - CARD_WIDTH / 2,
                  top: y,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT_ITEM,
                }}
              >
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-1 border-2 relative"
                  style={{
                    borderColor,
                    backgroundColor: bgColor,
                  }}
                >
                  {/* Raw / Output label */}
                  {isRaw && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0 text-[9px] font-bold uppercase tracking-wider bg-[#8B5CF6] text-white">
                      Raw
                    </span>
                  )}
                  {isOutput && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-accent)] text-black">
                      Output
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-10 h-10 relative flex items-center justify-center">
                    <Image
                      src={`${ITEM_ICON_URL}/${node.itemId}.png`}
                      alt={node.itemName || ''}
                      width={40}
                      height={40}
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Name */}
                  <p className="text-[10px] text-center leading-tight text-white font-medium px-1 truncate w-full">
                    {node.itemName}
                  </p>

                  {/* Count */}
                  <span className="text-[11px] font-mono font-bold text-[var(--color-accent)]">
                    x{node.itemCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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

  useEffect(() => {
    fetch('/data/factory-recipes.json')
      .then(r => r.json())
      .then((data: FactoryData) => {
        setFactoryData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const itemRecipes = useMemo(() => {
    if (!factoryData) return [];
    return factoryData.recipes.filter(r =>
      r.outputs.some(o => o.id === itemId)
    );
  }, [factoryData, itemId]);

  const itemName = useMemo(() => {
    if (!factoryData) return slug;
    return factoryData.items[itemId] || slug;
  }, [factoryData, itemId, slug]);

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

  // Build production chains for each recipe
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

  // Collect all raw materials across all chains
  const getAllRawMaterials = useCallback(
    (node: ChainNode): { id: string; name: string }[] => {
      const raw = new Map<string, string>();
      const collect = (n: ChainNode) => {
        for (const inp of n.recipe.inputs) {
          if (!recipesForItem.has(inp.id)) {
            raw.set(inp.id, inp.name);
          }
        }
        for (const child of n.children) collect(child);
      };
      collect(node);
      return Array.from(raw.entries()).map(([id, name]) => ({ id, name }));
    },
    [recipesForItem]
  );

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
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-6"
          >
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

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-4"
        >
          <ArrowLeft size={14} /> Back to Recipes
        </Link>

        <RIOSHeader title="Crafting Protocols" category="LOGISTICS" code="RIOS-REC-001" icon={<Package size={28} />} />
        <div className="mb-6" />

        {/* Item Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 relative bg-[var(--color-surface)] border-2 border-[var(--color-accent)]/50 flex items-center justify-center overflow-hidden">
            <Image
              src={`${ITEM_ICON_URL}/${itemId}.png`}
              alt={itemName}
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-rajdhani)] uppercase tracking-wide">
              {itemName}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                <Settings size={14} className="text-[var(--color-accent)]" />
                {itemRecipes.length} recipe{itemRecipes.length > 1 ? 's' : ''}
              </span>
              {activeChain && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)]">
                  <Zap size={14} className="text-[var(--color-accent)]" />
                  {activeChain.maxPerMin.toFixed(1)}/min
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recipe selector (if multiple recipes) */}
        {itemRecipes.length > 1 && (
          <div className="flex gap-2 mb-6">
            {itemRecipes.map((recipe, idx) => {
              const color = BUILDING_COLORS[recipe.machine] || 'var(--color-accent)';
              const isActive = idx === activeRecipeIdx;
              return (
                <button
                  key={recipe.id}
                  onClick={() => setActiveRecipeIdx(idx)}
                  className={`px-4 py-2 text-sm font-bold transition-colors border-2 ${
                    isActive
                      ? 'text-black'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                  }`}
                  style={isActive ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  Recipe {idx + 1}: {recipe.machineName}
                </button>
              );
            })}
          </div>
        )}

        {/* Recipe Details Card */}
        {activeChain && (
          <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
            <div className="p-5">
              {/* Recipe info row */}
              <div className="flex flex-wrap items-center gap-6 mb-5">
                <div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Machine</p>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-black"
                    style={{ backgroundColor: BUILDING_COLORS[activeChain.recipe.machine] || 'var(--color-accent)' }}
                  >
                    {activeChain.recipe.machineName}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Craft Time</p>
                  <span className="flex items-center gap-1 text-sm text-white">
                    <Clock size={14} className="text-[var(--color-accent)]" />
                    {activeChain.recipe.craftTime}s
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Power</p>
                  <span className="flex items-center gap-1 text-sm text-white">
                    <Zap size={14} className="text-[var(--color-accent)]" />
                    {activeChain.recipe.power}W
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Output Rate</p>
                  <span className="text-sm text-[var(--color-accent)] font-bold font-mono">
                    {activeChain.maxPerMin.toFixed(1)}/min
                  </span>
                </div>
              </div>

              {/* Inputs -> Outputs summary */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {activeChain.recipe.inputs.map((inp, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0a0e16] border border-[var(--color-border)]"
                    >
                      <Image
                        src={`${ITEM_ICON_URL}/${inp.id}.png`}
                        alt={inp.name}
                        width={28}
                        height={28}
                        className="object-contain"
                        unoptimized
                      />
                      <div>
                        <p className="text-xs text-white">{inp.name}</p>
                        <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono">x{inp.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <ArrowDown size={20} className="text-[var(--color-accent)] rotate-[-90deg]" />
                <div className="flex items-center gap-2 flex-wrap">
                  {activeChain.recipe.outputs.map((out, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-[rgba(0,176,255,0.08)] border-2 border-[var(--color-accent)]/50"
                    >
                      <Image
                        src={`${ITEM_ICON_URL}/${out.id}.png`}
                        alt={out.name}
                        width={28}
                        height={28}
                        className="object-contain"
                        unoptimized
                      />
                      <div>
                        <p className="text-xs text-[var(--color-accent)] font-bold">{out.name}</p>
                        <p className="text-[10px] text-[var(--color-accent)] font-mono">x{out.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Materials */}
        {rawMats.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3 uppercase tracking-wider font-[family-name:var(--font-rajdhani)]">
              <div className="w-2 h-2 bg-[#8B5CF6] rotate-45" />
              Raw Materials Required
            </h2>
            <div className="flex flex-wrap gap-2">
              {rawMats.map(mat => (
                <div
                  key={mat.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgba(139,92,246,0.08)] border border-[#8B5CF6]/40"
                >
                  <Image
                    src={`${ITEM_ICON_URL}/${mat.id}.png`}
                    alt={mat.name}
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                  <span className="text-xs text-white">{mat.name}</span>
                  <span className="text-[9px] font-bold uppercase text-[#8B5CF6]">Raw</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Chain Flowchart */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider font-[family-name:var(--font-rajdhani)]">
            <div className="w-2 h-2 bg-[var(--color-accent)] rotate-45" />
            Production Chain
          </h2>

          {activeChain && (
            <FlowchartView
              rootNode={activeChain.rootNode}
              recipesForItem={recipesForItem}
            />
          )}
        </div>
      </div>
    </div>
  );
}
