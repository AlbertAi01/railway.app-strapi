import { useState, useEffect } from 'react';
import { Plus, Trash2, Factory, ArrowRight, Info, Save, Upload } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  inputs: { [resource: string]: number };
  outputs: { [resource: string]: number };
  time: number;
  facility: string;
}

interface ProductionNode {
  id: string;
  recipeId: string;
  quantity: number;
  x: number;
  y: number;
}

interface ProductionChain {
  nodes: ProductionNode[];
  targetOutputs: { [resource: string]: number };
}

const recipes: Recipe[] = [
  {
    id: 'iron_ingot',
    name: 'Iron Ingot',
    inputs: { 'Iron Ore': 2 },
    outputs: { 'Iron Ingot': 1 },
    time: 10,
    facility: 'Smelter',
  },
  {
    id: 'steel_plate',
    name: 'Steel Plate',
    inputs: { 'Iron Ingot': 3, 'Coal': 1 },
    outputs: { 'Steel Plate': 1 },
    time: 20,
    facility: 'Forge',
  },
  {
    id: 'copper_wire',
    name: 'Copper Wire',
    inputs: { 'Copper Ore': 1 },
    outputs: { 'Copper Wire': 2 },
    time: 5,
    facility: 'Workshop',
  },
  {
    id: 'circuit_board',
    name: 'Circuit Board',
    inputs: { 'Copper Wire': 3, 'Silicon': 2 },
    outputs: { 'Circuit Board': 1 },
    time: 15,
    facility: 'Electronics Lab',
  },
  {
    id: 'advanced_component',
    name: 'Advanced Component',
    inputs: { 'Steel Plate': 2, 'Circuit Board': 1 },
    outputs: { 'Advanced Component': 1 },
    time: 30,
    facility: 'Assembly Line',
  },
  {
    id: 'polymer',
    name: 'Polymer',
    inputs: { 'Oil': 3 },
    outputs: { 'Polymer': 2 },
    time: 12,
    facility: 'Chemical Plant',
  },
  {
    id: 'plastic',
    name: 'Plastic',
    inputs: { 'Polymer': 1, 'Coal': 1 },
    outputs: { 'Plastic': 3 },
    time: 8,
    facility: 'Chemical Plant',
  },
  {
    id: 'battery',
    name: 'Battery',
    inputs: { 'Copper Wire': 2, 'Plastic': 2, 'Acid': 1 },
    outputs: { 'Battery': 1 },
    time: 18,
    facility: 'Electronics Lab',
  },
  {
    id: 'motor',
    name: 'Motor',
    inputs: { 'Iron Ingot': 2, 'Copper Wire': 3 },
    outputs: { 'Motor': 1 },
    time: 22,
    facility: 'Assembly Line',
  },
  {
    id: 'computer',
    name: 'Computer',
    inputs: { 'Circuit Board': 3, 'Plastic': 2, 'Steel Plate': 1 },
    outputs: { 'Computer': 1 },
    time: 40,
    facility: 'Assembly Line',
  },
  {
    id: 'concrete',
    name: 'Concrete',
    inputs: { 'Stone': 3, 'Water': 1 },
    outputs: { 'Concrete': 2 },
    time: 6,
    facility: 'Mixer',
  },
  {
    id: 'glass',
    name: 'Glass',
    inputs: { 'Sand': 2 },
    outputs: { 'Glass': 1 },
    time: 8,
    facility: 'Smelter',
  },
];

const rawResources = [
  'Iron Ore',
  'Copper Ore',
  'Coal',
  'Oil',
  'Silicon',
  'Stone',
  'Sand',
  'Water',
  'Acid',
];

const facilityColors: { [key: string]: string } = {
  'Smelter': '#ef4444',
  'Forge': '#f97316',
  'Workshop': '#eab308',
  'Electronics Lab': '#3b82f6',
  'Assembly Line': '#8b5cf6',
  'Chemical Plant': '#10b981',
  'Mixer': '#6b7280',
};

export default function FactoryPlanner() {
  const [chain, setChain] = useState<ProductionChain>({
    nodes: [],
    targetOutputs: {},
  });
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [targetResource, setTargetResource] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<number>(10);
  const [showAddNode, setShowAddNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('factoryPlanner');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.chain) setChain(data.chain);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('factoryPlanner', JSON.stringify({ chain }));
  }, [chain]);

  const addNode = () => {
    if (!selectedRecipe) return;

    const newNode: ProductionNode = {
      id: `node_${Date.now()}`,
      recipeId: selectedRecipe,
      quantity: 1,
      x: 50 + (chain.nodes.length % 5) * 200,
      y: 50 + Math.floor(chain.nodes.length / 5) * 150,
    };

    setChain(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setSelectedRecipe('');
    setShowAddNode(false);
  };

  const removeNode = (nodeId: string) => {
    setChain(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
    }));
  };

  const updateNodeQuantity = (nodeId: string, quantity: number) => {
    setChain(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === nodeId ? { ...n, quantity: Math.max(1, quantity) } : n
      ),
    }));
  };

  const addTargetOutput = () => {
    if (!targetResource || targetAmount <= 0) return;

    setChain(prev => ({
      ...prev,
      targetOutputs: {
        ...prev.targetOutputs,
        [targetResource]: targetAmount,
      },
    }));
    setTargetResource('');
    setTargetAmount(10);
  };

  const removeTargetOutput = (resource: string) => {
    setChain(prev => {
      const newOutputs = { ...prev.targetOutputs };
      delete newOutputs[resource];
      return { ...prev, targetOutputs: newOutputs };
    });
  };

  const calculateProduction = (): {
    inputs: { [resource: string]: number };
    outputs: { [resource: string]: number };
    facilities: { [facility: string]: number };
  } => {
    const inputs: { [resource: string]: number } = {};
    const outputs: { [resource: string]: number } = {};
    const facilities: { [facility: string]: number } = {};

    chain.nodes.forEach(node => {
      const recipe = recipes.find(r => r.id === node.recipeId);
      if (!recipe) return;

      facilities[recipe.facility] = (facilities[recipe.facility] || 0) + node.quantity;

      Object.entries(recipe.inputs).forEach(([resource, amount]) => {
        inputs[resource] = (inputs[resource] || 0) + (amount * node.quantity);
      });

      Object.entries(recipe.outputs).forEach(([resource, amount]) => {
        outputs[resource] = (outputs[resource] || 0) + (amount * node.quantity);
      });
    });

    return { inputs, outputs, facilities };
  };

  const calculateProductionRates = (): {
    inputRates: { [resource: string]: number };
    outputRates: { [resource: string]: number };
  } => {
    const inputRates: { [resource: string]: number } = {};
    const outputRates: { [resource: string]: number } = {};

    chain.nodes.forEach(node => {
      const recipe = recipes.find(r => r.id === node.recipeId);
      if (!recipe) return;

      const cyclesPerMinute = 60 / recipe.time;

      Object.entries(recipe.inputs).forEach(([resource, amount]) => {
        inputRates[resource] = (inputRates[resource] || 0) + (amount * node.quantity * cyclesPerMinute);
      });

      Object.entries(recipe.outputs).forEach(([resource, amount]) => {
        outputRates[resource] = (outputRates[resource] || 0) + (amount * node.quantity * cyclesPerMinute);
      });
    });

    return { inputRates, outputRates };
  };

  const autoOptimize = () => {
    const newNodes: ProductionNode[] = [];
    let nodeCounter = 0;

    const processResource = (resource: string, amount: number, depth: number = 0): void => {
      if (depth > 10) return;

      const recipe = recipes.find(r => r.outputs[resource]);
      if (!recipe) return;

      const outputAmount = recipe.outputs[resource];
      const facilitiesNeeded = Math.ceil(amount / outputAmount);

      newNodes.push({
        id: `auto_node_${nodeCounter++}`,
        recipeId: recipe.id,
        quantity: facilitiesNeeded,
        x: 50 + (depth * 250),
        y: 50 + (nodeCounter % 4) * 150,
      });

      Object.entries(recipe.inputs).forEach(([inputResource, inputAmount]) => {
        const totalNeeded = inputAmount * facilitiesNeeded;
        if (!rawResources.includes(inputResource)) {
          processResource(inputResource, totalNeeded, depth + 1);
        }
      });
    };

    Object.entries(chain.targetOutputs).forEach(([resource, amount]) => {
      processResource(resource, amount);
    });

    if (newNodes.length > 0) {
      setChain(prev => ({
        ...prev,
        nodes: newNodes,
      }));
    }
  };

  const clearChain = () => {
    if (confirm('Clear all production nodes?')) {
      setChain({ nodes: [], targetOutputs: {} });
    }
  };

  const exportChain = () => {
    const dataStr = JSON.stringify(chain, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'factory_plan.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const { inputs, outputs, facilities } = calculateProduction();
  const { inputRates, outputRates } = calculateProductionRates();

  const allOutputs = [...new Set([
    ...recipes.flatMap(r => Object.keys(r.outputs)),
    ...Object.keys(chain.targetOutputs),
  ])].sort();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFE500' }}>
              Factory Planner
            </h1>
            <p className="text-gray-400">
              Design and optimize AIC production chains
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>

        {showInfo && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 border-l-4" style={{ borderColor: '#FFE500' }}>
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Add production nodes manually or set target outputs for auto-optimization</li>
              <li>Adjust facility quantities to scale production</li>
              <li>Monitor input requirements and production rates per minute</li>
              <li>Export your production plan for later use</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" style={{ color: '#FFE500' }} />
              Add Production Node
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Recipe
                </label>
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
                >
                  <option value="">Select recipe</option>
                  {recipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.facility})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addNode}
                disabled={!selectedRecipe}
                className="w-full px-4 py-2 rounded font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedRecipe ? '#FFE500' : '#374151',
                  color: selectedRecipe ? '#000' : '#9ca3af',
                }}
              >
                Add Node
              </button>

              {selectedRecipe && (
                <div className="bg-gray-700 rounded p-3 text-sm">
                  <div className="font-semibold mb-2">
                    {recipes.find(r => r.id === selectedRecipe)?.name}
                  </div>
                  <div className="space-y-1 text-xs text-gray-300">
                    <div>
                      Inputs:{' '}
                      {Object.entries(recipes.find(r => r.id === selectedRecipe)?.inputs || {})
                        .map(([k, v]) => `${v}x ${k}`)
                        .join(', ')}
                    </div>
                    <div>
                      Outputs:{' '}
                      {Object.entries(recipes.find(r => r.id === selectedRecipe)?.outputs || {})
                        .map(([k, v]) => `${v}x ${k}`)
                        .join(', ')}
                    </div>
                    <div>Time: {recipes.find(r => r.id === selectedRecipe)?.time}s</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Target Outputs</h2>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Resource
                </label>
                <select
                  value={targetResource}
                  onChange={(e) => setTargetResource(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
                >
                  <option value="">Select resource</option>
                  {allOutputs.map(resource => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Amount per minute
                </label>
                <input
                  type="number"
                  min={1}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 hover:bg-gray-650 transition-colors"
                />
              </div>

              <button
                onClick={addTargetOutput}
                disabled={!targetResource}
                className="w-full px-4 py-2 rounded font-semibold transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: targetResource ? '#FFE500' : '#374151',
                  color: targetResource ? '#000' : '#9ca3af',
                }}
              >
                Add Target
              </button>
            </div>

            {Object.keys(chain.targetOutputs).length > 0 && (
              <div className="space-y-2">
                {Object.entries(chain.targetOutputs).map(([resource, amount]) => (
                  <div
                    key={resource}
                    className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                  >
                    <span className="text-sm">
                      {resource}: {amount}/min
                    </span>
                    <button
                      onClick={() => removeTargetOutput(resource)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={autoOptimize}
                disabled={Object.keys(chain.targetOutputs).length === 0}
                className="w-full px-4 py-2 rounded font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <Factory className="w-5 h-5" />
                  Auto-Optimize Chain
                </div>
              </button>

              <button
                onClick={exportChain}
                disabled={chain.nodes.length === 0}
                className="w-full px-4 py-2 rounded font-semibold transition-colors disabled:opacity-40 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Export Plan
                </div>
              </button>

              <button
                onClick={clearChain}
                disabled={chain.nodes.length === 0}
                className="w-full px-4 py-2 rounded font-semibold transition-colors disabled:opacity-40 bg-red-600 hover:bg-red-700 text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </div>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 space-y-1">
                <div>Active Nodes: {chain.nodes.length}</div>
                <div>Target Outputs: {Object.keys(chain.targetOutputs).length}</div>
                <div>Facilities Used: {Object.keys(facilities).length}</div>
              </div>
            </div>
          </div>
        </div>

        {chain.nodes.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Production Nodes</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {chain.nodes.map(node => {
                  const recipe = recipes.find(r => r.id === node.recipeId);
                  if (!recipe) return null;

                  const cyclesPerMinute = (60 / recipe.time) * node.quantity;

                  return (
                    <div
                      key={node.id}
                      className="bg-gray-700 rounded-lg p-4 border-l-4"
                      style={{ borderColor: facilityColors[recipe.facility] || '#6b7280' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold">{recipe.name}</div>
                          <div className="text-xs text-gray-400">{recipe.facility}</div>
                        </div>
                        <button
                          onClick={() => removeNode(node.id)}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="block text-xs text-gray-400 mb-1">
                          Facilities
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={node.quantity}
                          onChange={(e) => updateNodeQuantity(node.id, Number(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-1 text-sm"
                        />
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Inputs/min:</div>
                          {Object.entries(recipe.inputs).map(([resource, amount]) => (
                            <div key={resource} className="flex justify-between text-xs">
                              <span>{resource}</span>
                              <span className="font-mono">
                                {(amount * cyclesPerMinute).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Outputs/min:</div>
                          {Object.entries(recipe.outputs).map(([resource, amount]) => (
                            <div key={resource} className="flex justify-between text-xs">
                              <span>{resource}</span>
                              <span className="font-mono" style={{ color: '#FFE500' }}>
                                {(amount * cyclesPerMinute).toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Required Inputs</h2>
                <div className="space-y-2">
                  {Object.entries(inputs).map(([resource, amount]) => (
                    <div
                      key={resource}
                      className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                    >
                      <span className="text-sm">{resource}</span>
                      <div className="text-right">
                        <div className="font-mono text-sm">{amount}</div>
                        <div className="text-xs text-gray-400">
                          {inputRates[resource]?.toFixed(1)}/min
                        </div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(inputs).length === 0 && (
                    <p className="text-gray-400 text-sm">No inputs required</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Total Outputs</h2>
                <div className="space-y-2">
                  {Object.entries(outputs).map(([resource, amount]) => (
                    <div
                      key={resource}
                      className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                    >
                      <span className="text-sm">{resource}</span>
                      <div className="text-right">
                        <div className="font-mono text-sm" style={{ color: '#FFE500' }}>
                          {amount}
                        </div>
                        <div className="text-xs text-gray-400">
                          {outputRates[resource]?.toFixed(1)}/min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Facility Requirements</h2>
                <div className="space-y-2">
                  {Object.entries(facilities).map(([facility, count]) => (
                    <div
                      key={facility}
                      className="flex items-center justify-between bg-gray-700 rounded px-3 py-2 border-l-4"
                      style={{ borderColor: facilityColors[facility] || '#6b7280' }}
                    >
                      <span className="text-sm">{facility}</span>
                      <span className="font-mono text-sm font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {chain.nodes.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Factory className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">
              Start building your production chain
            </p>
            <p className="text-gray-500 text-sm">
              Add production nodes or set target outputs for auto-optimization
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
