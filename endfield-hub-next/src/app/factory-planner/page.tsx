'use client';

import { useState } from 'react';
import { RECIPES } from '@/lib/data';
import { Factory, Plus, Trash2, AlertCircle, Download, Copy } from 'lucide-react';
import RIOSHeader from '@/components/ui/RIOSHeader';

interface ProductionNode {
  id: string;
  recipe: typeof RECIPES[0];
  quantity: number;
}

export default function FactoryPlannerPage() {
  const [productionChain, setProductionChain] = useState<ProductionNode[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');

  const addRecipe = () => {
    const recipe = RECIPES.find(r => r.Name === selectedRecipe);
    if (!recipe) return;

    const newNode: ProductionNode = {
      id: `${recipe.Name}-${Date.now()}`,
      recipe,
      quantity: 1
    };

    setProductionChain([...productionChain, newNode]);
    setSelectedRecipe('');
  };

  const removeRecipe = (id: string) => {
    setProductionChain(productionChain.filter(node => node.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setProductionChain(productionChain.map(node =>
      node.id === id ? { ...node, quantity } : node
    ));
  };

  const calculateTotalInputs = () => {
    const inputs: { [key: string]: number } = {};

    productionChain.forEach(node => {
      node.recipe.Inputs.forEach(input => {
        const key = input.item;
        inputs[key] = (inputs[key] || 0) + (input.quantity * node.quantity);
      });
    });

    return inputs;
  };

  const calculateTotalOutputs = () => {
    const outputs: { [key: string]: number } = {};

    productionChain.forEach(node => {
      const key = node.recipe.Outputs[0]?.item;
      const amount = node.recipe.Outputs[0]?.quantity || 1;
      outputs[key] = (outputs[key] || 0) + (amount * node.quantity);
    });

    return outputs;
  };

  const calculateBottlenecks = () => {
    const inputs = calculateTotalInputs();
    const outputs = calculateTotalOutputs();
    const bottlenecks: string[] = [];

    Object.keys(inputs).forEach(item => {
      const produced = outputs[item] || 0;
      const needed = inputs[item];

      if (produced < needed) {
        bottlenecks.push(`${item}: need ${needed}, produce ${produced} (deficit: ${needed - produced})`);
      }
    });

    return bottlenecks;
  };

  const totalInputs = calculateTotalInputs();
  const totalOutputs = calculateTotalOutputs();
  const bottlenecks = calculateBottlenecks();

  const exportLayoutJSON = () => {
    const layoutData = {
      productionChain,
      totalInputs,
      totalOutputs,
      bottlenecks,
      timestamp: new Date().toISOString()
    };
    const data = JSON.stringify(layoutData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerosanity-factory-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlanToClipboard = async () => {
    if (productionChain.length === 0) return;

    let plan = 'Factory Production Plan\n\n';

    plan += 'Production Chain:\n';
    productionChain.forEach((node, idx) => {
      plan += `${idx + 1}. ${node.recipe.Name} (×${node.quantity})\n`;
      plan += `   Inputs: ${node.recipe.Inputs.map(i => `${i.item} ×${i.quantity * node.quantity}`).join(', ')}\n`;
      plan += `   Output: ${node.recipe.Outputs[0]?.item} ×${(node.recipe.Outputs[0]?.quantity || 1) * node.quantity}\n\n`;
    });

    plan += '\nTotal Inputs Required:\n';
    Object.entries(totalInputs).forEach(([item, amount]) => {
      plan += `• ${item}: ×${amount}\n`;
    });

    plan += '\nTotal Outputs Produced:\n';
    Object.entries(totalOutputs).forEach(([item, amount]) => {
      plan += `• ${item}: ×${amount}\n`;
    });

    if (bottlenecks.length > 0) {
      plan += '\nBottlenecks:\n';
      bottlenecks.forEach(b => {
        plan += `• ${b}\n`;
      });
    }

    plan += '\nCreated with Zero Sanity Toolkit - zerosanity.app';

    try {
      await navigator.clipboard.writeText(plan);
      alert('Production plan copied to clipboard!');
    } catch (error) {
      alert('Failed to copy. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[var(--color-text-secondary)] p-6">
      <div className="max-w-7xl mx-auto">
        <RIOSHeader title="AIC Production Planner" category="LOGISTICS" code="RIOS-FAC-001" icon={<Factory size={28} />} />

        {/* Export/Share Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportLayoutJSON}
            disabled={productionChain.length === 0}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Layout (JSON)
          </button>
          <button
            onClick={copyPlanToClipboard}
            disabled={productionChain.length === 0}
            className="px-4 py-2 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy Plan
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Recipe */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Factory className="w-6 h-6 text-[var(--color-accent)]" />
                Production Chain
              </h2>

              <div className="flex gap-3 mb-6">
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                >
                  <option value="">Select a recipe to add...</option>
                  {RECIPES.map(recipe => (
                    <option key={recipe.Name} value={recipe.Name}>
                      {recipe.Name} ({recipe.Category})
                    </option>
                  ))}
                </select>
                <button
                  onClick={addRecipe}
                  disabled={!selectedRecipe}
                  className="px-6 py-3 bg-[var(--color-accent)] text-black font-bold clip-corner-tl hover:bg-[var(--color-accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              {productionChain.length > 0 ? (
                <div className="space-y-3">
                  {productionChain.map(node => (
                    <div key={node.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{node.recipe.Name}</h3>
                          <p className="text-sm text-[var(--color-text-tertiary)]">{node.recipe.Category}</p>
                        </div>
                        <button
                          onClick={() => removeRecipe(node.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm font-bold">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={node.quantity}
                          onChange={(e) => updateQuantity(node.id, Number(e.target.value))}
                          className="w-20 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)] text-white"
                        />
                      </div>

                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="text-[var(--color-text-tertiary)]">Inputs:</span>
                          <div className="mt-1 space-y-1">
                            {node.recipe.Inputs.map((input, idx) => (
                              <div key={idx} className="text-white">
                                • {input.item} ×{input.quantity * node.quantity}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-tertiary)]">Output:</span>
                          <div className="text-[var(--color-accent)] font-bold">
                            {node.recipe.Outputs[0]?.item} ×{(node.recipe.Outputs[0]?.quantity || 1) * node.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                  Add recipes to start planning your production chain
                </div>
              )}
            </div>
          </div>

          {/* Analysis */}
          <div className="space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Total Inputs Required</h2>
              {Object.keys(totalInputs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(totalInputs).map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] p-3 clip-corner-tl">
                      <span className="text-sm">{item}</span>
                      <span className="font-bold text-white">×{amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-tertiary)]">No inputs yet</p>
              )}
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Total Outputs Produced</h2>
              {Object.keys(totalOutputs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(totalOutputs).map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] p-3 clip-corner-tl">
                      <span className="text-sm">{item}</span>
                      <span className="font-bold text-[var(--color-accent)]">×{amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-tertiary)]">No outputs yet</p>
              )}
            </div>

            {bottlenecks.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Bottlenecks
                </h2>
                <div className="space-y-2">
                  {bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className="bg-red-900/20 border-l-4 border-l-red-500 border border-red-500/50 p-3 clip-corner-tl text-sm text-red-300">
                      {bottleneck}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productionChain.length > 0 && bottlenecks.length === 0 && (
              <div className="bg-green-900/20 border-l-4 border-l-green-500 border border-green-500/50 clip-corner-tl p-4">
                <h3 className="font-bold text-green-400 mb-2">Balanced Chain!</h3>
                <p className="text-sm text-green-300">
                  All required materials are produced within the chain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
