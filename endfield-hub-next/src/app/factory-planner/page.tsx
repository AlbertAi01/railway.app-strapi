'use client';

import { useState } from 'react';
import { RECIPES } from '@/lib/data';
import { Factory, Plus, Trash2, AlertCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FFE500] mb-8">Factory Planner</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Recipe */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Factory className="w-6 h-6 text-[#FFE500]" />
                Production Chain
              </h2>

              <div className="flex gap-3 mb-6">
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
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
                  className="px-6 py-3 bg-[#FFE500] text-black font-bold rounded-lg hover:bg-[#FFE500]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              {productionChain.length > 0 ? (
                <div className="space-y-3">
                  {productionChain.map(node => (
                    <div key={node.id} className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{node.recipe.Name}</h3>
                          <p className="text-sm text-gray-500">{node.recipe.Category}</p>
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
                          className="w-20 px-3 py-1 bg-[#111] border border-[#222] rounded focus:outline-none focus:border-[#FFE500] text-white"
                        />
                      </div>

                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="text-gray-500">Inputs:</span>
                          <div className="mt-1 space-y-1">
                            {node.recipe.Inputs.map((input, idx) => (
                              <div key={idx} className="text-white">
                                • {input.item} ×{input.quantity * node.quantity}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Output:</span>
                          <div className="text-[#FFE500] font-bold">
                            {node.recipe.Outputs[0]?.item} ×{(node.recipe.Outputs[0]?.quantity || 1) * node.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Add recipes to start planning your production chain
                </div>
              )}
            </div>
          </div>

          {/* Analysis */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Total Inputs Required</h2>
              {Object.keys(totalInputs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(totalInputs).map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded">
                      <span className="text-sm">{item}</span>
                      <span className="font-bold text-white">×{amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No inputs yet</p>
              )}
            </div>

            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Total Outputs Produced</h2>
              {Object.keys(totalOutputs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(totalOutputs).map(([item, amount]) => (
                    <div key={item} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded">
                      <span className="text-sm">{item}</span>
                      <span className="font-bold text-[#FFE500]">×{amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No outputs yet</p>
              )}
            </div>

            {bottlenecks.length > 0 && (
              <div className="bg-[#111] border border-[#222] rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Bottlenecks
                </h2>
                <div className="space-y-2">
                  {bottlenecks.map((bottleneck, idx) => (
                    <div key={idx} className="bg-red-900/20 border border-red-500/50 p-3 rounded text-sm text-red-300">
                      {bottleneck}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productionChain.length > 0 && bottlenecks.length === 0 && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
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
