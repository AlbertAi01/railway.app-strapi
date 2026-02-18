'use client';

import { useState, useMemo, useCallback } from 'react';
import { RECIPES } from '@/lib/data';
import { Factory, Plus, Trash2, ZoomIn, ArrowDown, ArrowUp, ChevronDown, Download, Copy, AlertCircle, Wrench, Move } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const GRID_SIZE = 6;
const FACILITY_COLORS: Record<string, string> = {
  'Smelter': '#FF6B35', 'Assembler': '#4ECDC4', 'Wire Press': '#FFE66D',
  'Chemical Plant': '#95E1D3', 'Crusher': '#F38181',
};

interface GridCell {
  id: string;
  row: number;
  col: number;
  recipe: typeof RECIPES[0] | null;
  quantity: number;
  facility: string;
}

type Mode = 'build' | 'edit';

export default function FactoryPlannerPage() {
  const [grid, setGrid] = useState<(GridCell | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => null))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<Mode>('build');
  const [showConveyors, setShowConveyors] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showAnim, setShowAnim] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  const placedCells = useMemo(() => {
    const cells: GridCell[] = [];
    grid.forEach(row => row.forEach(cell => { if (cell) cells.push(cell); }));
    return cells;
  }, [grid]);

  const totalPower = useMemo(() => {
    return placedCells.reduce((sum, cell) => {
      if (!cell.recipe) return sum;
      return sum + (cell.recipe.FacilityLevel ?? 0) * 15 * cell.quantity;
    }, 0);
  }, [placedCells]);

  const totalInputs = useMemo(() => {
    const inputs: Record<string, number> = {};
    placedCells.forEach(cell => {
      if (!cell.recipe) return;
      cell.recipe.Inputs.forEach(inp => {
        inputs[inp.item] = (inputs[inp.item] || 0) + inp.quantity * cell.quantity;
      });
    });
    return inputs;
  }, [placedCells]);

  const totalOutputs = useMemo(() => {
    const outputs: Record<string, number> = {};
    placedCells.forEach(cell => {
      if (!cell.recipe) return;
      cell.recipe.Outputs.forEach(out => {
        outputs[out.item] = (outputs[out.item] || 0) + out.quantity * cell.quantity;
      });
    });
    return outputs;
  }, [placedCells]);

  const bottlenecks = useMemo(() => {
    const issues: string[] = [];
    Object.entries(totalInputs).forEach(([item, needed]) => {
      const produced = totalOutputs[item] || 0;
      if (produced < needed) {
        issues.push(`${item}: need ${needed}, produce ${produced}`);
      }
    });
    return issues;
  }, [totalInputs, totalOutputs]);

  const placeRecipe = useCallback((row: number, col: number, recipe: typeof RECIPES[0]) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = {
        id: `${row}-${col}`, row, col, recipe, quantity: 1, facility: recipe.FacilityRequired ?? 'Unknown',
      };
      return newGrid;
    });
    setShowRecipePicker(false);
    setSelectedCell(null);
  }, []);

  const removeCell = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = null;
      return newGrid;
    });
    setSelectedCell(null);
  }, []);

  const updateQuantity = useCallback((row: number, col: number, qty: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      const cell = newGrid[row][col];
      if (cell) newGrid[row][col] = { ...cell, quantity: Math.max(1, qty) };
      return newGrid;
    });
  }, []);

  const clearAll = () => {
    if (confirm('Clear entire factory layout?')) {
      setGrid(Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => null)));
      setSelectedCell(null);
    }
  };

  const exportJSON = () => {
    const data = { grid: placedCells, totalInputs, totalOutputs, bottlenecks, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `factory-layout-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlan = async () => {
    let plan = 'Factory Layout\n\n';
    placedCells.forEach((cell, i) => {
      if (cell.recipe) {
        plan += `${i + 1}. ${cell.recipe.Name} (x${cell.quantity}) @ ${cell.facility} [${cell.row},${cell.col}]\n`;
      }
    });
    plan += `\nTotal Power: ${totalPower}W\nCreated with Zero Sanity Toolkit`;
    try {
      await navigator.clipboard.writeText(plan);
      alert('Layout copied!');
    } catch { alert('Failed to copy.'); }
  };

  return (
    <div className="min-h-screen text-[var(--color-text-secondary)]">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Factory Planner" category="LOGISTICS" code="RIOS-FAC-001" icon={<Factory size={28} />} />

        <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
          Design and optimize your AIC Factory layout. Place machines, connect production chains, and identify bottlenecks.
        </p>

        {/* Power Header */}
        <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-3 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-tertiary)]">
              <span className="text-white font-bold">{totalPower}</span> / <span className="text-[var(--color-accent)]">&#8734;</span> Power
              <span className="text-[10px] ml-2 text-green-400">(Unlimited)</span>
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">{placedCells.length} Machines</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          {/* Grid Area */}
          <div>
            {showConveyors && Object.keys(totalInputs).length > 0 && (
              <div className="flex items-center gap-2 mb-2 px-2 flex-wrap">
                {Object.entries(totalInputs).filter(([item]) => !totalOutputs[item] || totalOutputs[item] < totalInputs[item]).map(([item, qty]) => (
                  <div key={item} className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px]">
                    <ArrowDown size={10} /> {item} x{qty - (totalOutputs[item] || 0)}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="grid gap-1 p-3" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {grid.map((row, ri) => row.map((cell, ci) => {
                  const isSelected = selectedCell && selectedCell[0] === ri && selectedCell[1] === ci;
                  return (
                    <div key={`${ri}-${ci}`}
                      onClick={() => {
                        if (mode === 'build' && !cell) { setSelectedCell([ri, ci]); setShowRecipePicker(true); }
                        else if (cell) { setSelectedCell(isSelected ? null : [ri, ci]); }
                      }}
                      className={`aspect-square border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                        isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' :
                        cell ? 'border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)]/50' :
                        'border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-surface-2)]/30'
                      }`}
                      style={cell ? { borderLeftColor: FACILITY_COLORS[cell.facility] || 'var(--color-border)', borderLeftWidth: '4px' } : {}}>
                      {cell ? (
                        <>
                          <div className="absolute top-0.5 left-1">
                            <span className="w-4 h-4 flex items-center justify-center bg-[var(--color-accent)] text-black text-[8px] font-bold rounded-full">
                              {ri * GRID_SIZE + ci + 1}
                            </span>
                          </div>
                          <Wrench size={16} style={{ color: FACILITY_COLORS[cell.facility] || 'var(--color-accent)' }} />
                          <span className="text-[8px] text-white font-bold text-center leading-tight truncate w-full px-1">
                            {cell.recipe?.Name || cell.facility}
                          </span>
                          {showStats && cell.recipe && (
                            <span className="text-[7px] text-[var(--color-text-tertiary)]">x{cell.quantity}</span>
                          )}
                          {showAnim && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] animate-pulse" />}
                        </>
                      ) : (
                        <Plus size={14} className="text-[var(--color-border)]" />
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>

            {showConveyors && Object.keys(totalOutputs).length > 0 && (
              <div className="flex items-center gap-2 mt-2 px-2 flex-wrap">
                {Object.entries(totalOutputs).filter(([item]) => !totalInputs[item] || totalOutputs[item] > totalInputs[item]).map(([item, qty]) => (
                  <div key={item} className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px]">
                    <ArrowUp size={10} /> {item} x{qty - (totalInputs[item] || 0)}
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-3">
              <button onClick={exportJSON} className="px-3 py-1.5 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center gap-1">
                <Download size={12} /> File
              </button>
              <button onClick={copyPlan} className="px-3 py-1.5 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-white flex items-center gap-1">
                <Copy size={12} /> Data
              </button>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <button onClick={() => setMode('build')}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 border ${mode === 'build' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'}`}>
                <Wrench size={12} /> Build
              </button>
              <button onClick={() => setMode('edit')}
                className={`px-3 py-1.5 text-xs flex items-center gap-1 border ${mode === 'edit' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'}`}>
                <Move size={12} /> Edit
              </button>
              <button className="px-3 py-1.5 text-xs border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white flex items-center gap-1">
                <ZoomIn size={12} /> Zoom to Fit
              </button>
              <div className="w-px h-6 bg-[var(--color-border)]" />
              {[
                { label: 'Conveyors', active: showConveyors, toggle: () => setShowConveyors(!showConveyors) },
                { label: 'Stats', active: showStats, toggle: () => setShowStats(!showStats) },
                { label: 'Anim', active: showAnim, toggle: () => setShowAnim(!showAnim) },
              ].map(t => (
                <button key={t.label} onClick={t.toggle}
                  className={`px-2 py-1.5 text-xs border ${t.active ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                  {t.label}
                </button>
              ))}
              <div className="w-px h-6 bg-[var(--color-border)]" />
              {[1, 2, 5, 10, 20].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`px-2 py-1 text-[10px] border ${speed === s ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-tertiary)]'}`}>
                  {s}x
                </button>
              ))}
              <div className="ml-auto">
                <button onClick={clearAll} className="px-3 py-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {showRecipePicker && selectedCell && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-accent)] clip-corner-tl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <h3 className="text-sm font-bold text-white">Place Machine</h3>
                  <button onClick={() => { setShowRecipePicker(false); setSelectedCell(null); }} className="text-[var(--color-text-tertiary)] hover:text-white">x</button>
                </div>
                <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                  {RECIPES.map(recipe => (
                    <button key={recipe.id} onClick={() => placeRecipe(selectedCell[0], selectedCell[1], recipe)}
                      className="w-full text-left p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
                      style={{ borderLeftColor: FACILITY_COLORS[recipe.FacilityRequired ?? ''] || 'var(--color-border)', borderLeftWidth: '4px' }}>
                      <p className="text-white text-sm font-bold">{recipe.Name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{recipe.FacilityRequired ?? 'Unknown'} Lv.{recipe.FacilityLevel ?? '?'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-[var(--color-text-tertiary)]">
                          {recipe.Inputs.map(i => `${i.item} x${i.quantity}`).join(', ')}
                        </span>
                        <span className="text-[9px] text-[var(--color-accent)]">{'->'}</span>
                        <span className="text-[9px] text-green-400">
                          {recipe.Outputs.map(o => `${o.item} x${o.quantity}`).join(', ')}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedCell && !showRecipePicker && grid[selectedCell[0]][selectedCell[1]] && (() => {
              const cell = grid[selectedCell[0]][selectedCell[1]]!;
              return (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]"
                    style={{ borderLeftColor: FACILITY_COLORS[cell.facility], borderLeftWidth: '4px' }}>
                    <h3 className="text-sm font-bold text-white">{cell.recipe?.Name || cell.facility}</h3>
                    <button onClick={() => removeCell(selectedCell[0], selectedCell[1])} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-[var(--color-text-tertiary)]">Quantity:</label>
                      <input type="number" min="1" value={cell.quantity}
                        onChange={e => updateQuantity(selectedCell[0], selectedCell[1], parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm text-center" />
                    </div>
                    {cell.recipe && (
                      <>
                        <div>
                          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1">Inputs:</p>
                          {cell.recipe.Inputs.map((inp, i) => (
                            <p key={i} className="text-xs text-white">{inp.item} x{inp.quantity * cell.quantity}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--color-text-tertiary)] mb-1">Outputs:</p>
                          {cell.recipe.Outputs.map((out, i) => (
                            <p key={i} className="text-xs text-[var(--color-accent)]">{out.item} x{out.quantity * cell.quantity}</p>
                          ))}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)]">
                          <p>Facility: {cell.facility} Lv.{cell.recipe.FacilityLevel ?? 0}</p>
                          <p>Throughput: {((cell.recipe.ThroughputPerMin ?? 0) * cell.quantity).toFixed(1)}/min</p>
                          <p>Power: {(cell.recipe.FacilityLevel ?? 0) * 15 * cell.quantity}W</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h3 className="text-sm font-bold text-white">Total Inputs</h3>
                <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
              </div>
              <div className="p-3 space-y-1">
                {Object.keys(totalInputs).length > 0 ? Object.entries(totalInputs).map(([item, qty]) => (
                  <div key={item} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">{item}</span>
                    <span className="text-white font-bold">x{qty}</span>
                  </div>
                )) : <p className="text-xs text-[var(--color-text-tertiary)]">No machines placed</p>}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <h3 className="text-sm font-bold text-white">Total Outputs</h3>
                <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" />
              </div>
              <div className="p-3 space-y-1">
                {Object.keys(totalOutputs).length > 0 ? Object.entries(totalOutputs).map(([item, qty]) => (
                  <div key={item} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">{item}</span>
                    <span className="text-[var(--color-accent)] font-bold">x{qty}</span>
                  </div>
                )) : <p className="text-xs text-[var(--color-text-tertiary)]">No machines placed</p>}
              </div>
            </div>

            {bottlenecks.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 clip-corner-tl p-4">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2"><AlertCircle size={14} /> Bottlenecks</h3>
                {bottlenecks.map((b, i) => <p key={i} className="text-xs text-red-300">{b}</p>)}
              </div>
            )}

            {placedCells.length > 0 && bottlenecks.length === 0 && (
              <div className="bg-green-900/20 border border-green-500/30 clip-corner-tl p-4">
                <h3 className="text-sm font-bold text-green-400 mb-1">Balanced!</h3>
                <p className="text-xs text-green-300">All materials are supplied within the chain.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
