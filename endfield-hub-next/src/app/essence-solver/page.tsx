'use client';

import { useState } from 'react';
import { Calculator, Zap, FlaskConical, Copy, Download } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

const ESSENCE_VALUES = [1, 2, 3, 5, 10, 20, 50, 100];

export default function EssenceSolverPage() {
  const [target, setTarget] = useState(100);
  const [inventory, setInventory] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    5: 0,
    10: 0,
    20: 0,
    50: 0,
    100: 0
  });

  const calculateOptimalSolution = () => {
    let remaining = target;
    const solution: { [key: number]: number } = {};
    const sortedValues = [...ESSENCE_VALUES].sort((a, b) => b - a);

    // Greedy approach: use largest values first
    for (const value of sortedValues) {
      const available = inventory[value] || 0;
      const needed = Math.floor(remaining / value);
      const use = Math.min(available, needed);

      if (use > 0) {
        solution[value] = use;
        remaining -= use * value;
      }
    }

    return { solution, remaining };
  };

  const calculateConversionSolution = () => {
    // More advanced: consider converting smaller essences
    let remaining = target;
    const solution: { [key: number]: number } = {};
    const conversions: string[] = [];

    // Calculate total essence value in inventory
    const totalValue = Object.entries(inventory).reduce(
      (sum, [value, count]) => sum + (Number(value) * count),
      0
    );

    if (totalValue < target) {
      return { solution: {}, remaining: target, conversions, insufficient: true };
    }

    // Use greedy approach first
    const sortedValues = [...ESSENCE_VALUES].sort((a, b) => b - a);
    const tempInventory = { ...inventory };

    for (const value of sortedValues) {
      const available = tempInventory[value] || 0;
      const needed = Math.floor(remaining / value);
      const use = Math.min(available, needed);

      if (use > 0) {
        solution[value] = use;
        remaining -= use * value;
        tempInventory[value] -= use;
      }
    }

    // If we have remaining, try converting up
    if (remaining > 0) {
      for (const value of ESSENCE_VALUES) {
        const available = tempInventory[value] || 0;
        if (available > 0 && remaining > 0) {
          // Find next larger value that would help
          const nextLarger = ESSENCE_VALUES.find(v => v > value);
          if (nextLarger && remaining < nextLarger) {
            const convert = Math.ceil(remaining / value);
            const actualConvert = Math.min(convert, available);
            solution[value] = (solution[value] || 0) + actualConvert;
            remaining -= actualConvert * value;
            conversions.push(`Convert ${actualConvert}×${value} essence`);
          }
        }
      }
    }

    return { solution, remaining, conversions, insufficient: false };
  };

  const { solution, remaining, conversions, insufficient } = calculateConversionSolution();
  const waste = remaining < 0 ? Math.abs(remaining) : 0;

  const copyResultsToClipboard = async () => {
    if (insufficient || Object.keys(solution).length === 0) return;

    let results = `Essence Solver Results\nTarget: ${target}\n\n`;

    results += 'Optimal Solution:\n';
    Object.entries(solution)
      .sort(([a], [b]) => Number(b) - Number(a))
      .forEach(([value, count]) => {
        results += `• Use Essence ×${value}: ×${count}\n`;
      });

    results += `\nTotal Used: ${target - remaining}\n`;
    results += `Waste: ${waste}\n`;

    if (conversions && conversions.length > 0) {
      results += '\nConversion Steps:\n';
      conversions.forEach(c => {
        results += `• ${c}\n`;
      });
    }

    results += '\nCreated with Zero Sanity Toolkit - zerosanity.app';

    try {
      await navigator.clipboard.writeText(results);
      alert('Results copied to clipboard!');
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  };

  const exportResultsJSON = () => {
    const resultsData = {
      target,
      inventory,
      solution,
      totalUsed: target - remaining,
      waste,
      conversions,
      insufficient,
      timestamp: new Date().toISOString()
    };
    const data = JSON.stringify(resultsData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-essence-solution-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080c12] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="Essence Optimization" category="ANALYSIS" code="RIOS-ESS-001" icon={<FlaskConical size={28} />} />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={copyResultsToClipboard}
            disabled={insufficient || Object.keys(solution).length === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Results
          </button>
          <button
            onClick={exportResultsJSON}
            disabled={insufficient || Object.keys(solution).length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Results (JSON)
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[var(--color-accent)]" />
              Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-white">
                  Target Essence Amount
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                />
              </div>

              <div>
                <h3 className="font-bold text-white mb-3">Current Inventory</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ESSENCE_VALUES.map(value => (
                    <div key={value} className="bg-[var(--color-surface-2)] p-3 clip-corner-tl">
                      <label className="block text-sm mb-2 text-[var(--color-text-secondary)]">
                        Essence ×{value}
                      </label>
                      <input
                        type="number"
                        value={inventory[value]}
                        onChange={(e) => setInventory({
                          ...inventory,
                          [value]: Number(e.target.value)
                        })}
                        min="0"
                        className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                <h3 className="font-bold text-white mb-2">Total Essence Value</h3>
                <p className="text-2xl text-[var(--color-accent)] font-bold">
                  {Object.entries(inventory).reduce(
                    (sum, [value, count]) => sum + (Number(value) * count),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[var(--color-accent)]" />
              Optimal Solution
            </h2>

            {insufficient ? (
              <div className="bg-red-900/20 border-l-4 border-red-500 clip-corner-tl p-4">
                <h3 className="font-bold text-red-400 mb-2">Insufficient Essence</h3>
                <p className="text-sm text-red-300">
                  You don't have enough essence in your inventory to reach the target amount.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(solution).length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {Object.entries(solution)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([value, count]) => (
                          <div key={value} className="flex items-center justify-between bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                            <span className="text-white font-medium">Use Essence ×{value}</span>
                            <span className="text-[var(--color-accent)] font-bold text-lg">×{count}</span>
                          </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                        <span className="text-sm text-[var(--color-text-tertiary)]">Total Used</span>
                        <p className="text-xl text-white font-bold">
                          {target - remaining}
                        </p>
                      </div>
                      <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl">
                        <span className="text-sm text-[var(--color-text-tertiary)]">Waste</span>
                        <p className="text-xl text-[var(--color-accent)] font-bold">
                          {waste}
                        </p>
                      </div>
                    </div>

                    {conversions && conversions.length > 0 && (
                      <div className="bg-[var(--color-surface-2)] p-4 clip-corner-tl border-l-4 border-[var(--color-accent)]">
                        <h3 className="font-bold text-white mb-2">Conversion Steps:</h3>
                        <ul className="text-sm space-y-1">
                          {conversions.map((conv, idx) => (
                            <li key={idx} className="text-[var(--color-accent)]">• {conv}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {waste === 0 && (
                      <div className="bg-green-900/20 border-l-4 border-green-500 clip-corner-tl p-4">
                        <h3 className="font-bold text-green-400">Perfect Solution!</h3>
                        <p className="text-sm text-green-300">No essence wasted.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                    Set your inventory to calculate optimal solution
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
          <h3 className="font-bold text-white mb-3">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-[var(--color-accent)] mb-2">Greedy Algorithm</h4>
              <p>Uses largest essence values first to minimize waste and conversions.</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-accent)] mb-2">Smart Conversion</h4>
              <p>Automatically suggests converting smaller essences when beneficial.</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-accent)] mb-2">Minimal Waste</h4>
              <p>Calculates the solution with the least excess essence spent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
