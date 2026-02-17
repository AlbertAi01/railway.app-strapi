'use client';

import { useState } from 'react';
import { Search, Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { RECIPES } from '@/lib/data';

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const types = ['All', ...Array.from(new Set(RECIPES.map(r => r.Category)))];

  const filteredRecipes = RECIPES.filter(recipe => {
    const matchesSearch = recipe.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.Outputs[0]?.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || recipe.Category === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleRecipe = (recipeName: string) => {
    setExpandedRecipe(expandedRecipe === recipeName ? null : recipeName);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-400 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#FFE500] mb-8">Recipe Database</h1>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg focus:outline-none focus:border-[#FFE500] text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type
                    ? 'bg-[#FFE500] text-black font-bold'
                    : 'bg-[#111] border border-[#222] hover:border-[#FFE500]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe List */}
        <div className="grid gap-4">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.Name}
              className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-[#FFE500] transition-colors"
            >
              <div
                onClick={() => toggleRecipe(recipe.Name)}
                className="p-6 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Beaker className="w-6 h-6 text-[#FFE500]" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{recipe.Name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 bg-[#222] rounded-full text-sm text-[#FFE500]">
                        {recipe.Category}
                      </span>
                      <span className="text-sm">
                        Produces: {recipe.Outputs[0]?.item} {recipe.Outputs[0]?.quantity && `(${recipe.Outputs[0]?.quantity})`}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedRecipe === recipe.Name ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>

              {expandedRecipe === recipe.Name && (
                <div className="px-6 pb-6 border-t border-[#222]">
                  <div className="mt-4">
                    <h3 className="font-bold text-white mb-3">Required Inputs:</h3>
                    <div className="grid gap-2">
                      {recipe.Inputs.map((input, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded">
                          <span>{input.item}</span>
                          <span className="text-[#FFE500] font-bold">×{input.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] p-3 rounded">
                      <span className="text-sm text-gray-500">Production Time</span>
                      <p className="text-white font-bold">{recipe.CraftingTime}s</p>
                    </div>
                    <div className="bg-[#0a0a0a] p-3 rounded">
                      <span className="text-sm text-gray-500">Building Required</span>
                      <p className="text-white font-bold">{recipe.FacilityRequired || 'Any Factory'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No recipes found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
