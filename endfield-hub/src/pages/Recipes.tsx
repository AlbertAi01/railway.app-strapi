import { useState } from 'react';
import { Search, ArrowRight, Clock, Zap } from 'lucide-react';
import { RECIPES } from '../lib/data';

export default function Recipes() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = [...new Set(RECIPES.map(r => r.Category))];

  const filtered = RECIPES.filter(r => {
    if (search && !r.Name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && r.Category !== categoryFilter) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">RECIPES</h1>
      <p className="text-gray-500 text-sm mb-6">Factory and crafting recipes database</p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              categoryFilter === cat ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10' : 'border-[#333] text-gray-400 hover:border-[#555]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(recipe => (
          <div key={recipe.id} className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">{recipe.Name}</h3>
                <span className="text-gray-500 text-xs">{recipe.Category}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {recipe.CraftingTime && (
                  <span className="flex items-center gap-1"><Clock size={12} /> {recipe.CraftingTime}s</span>
                )}
                {recipe.ThroughputPerMin && (
                  <span className="flex items-center gap-1"><Zap size={12} /> {recipe.ThroughputPerMin}/min</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-gray-600 text-[10px] font-semibold mb-1">INPUTS</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.Inputs.map((inp, i) => (
                    <span key={i} className="text-xs bg-[#1a1a1a] text-gray-300 px-2 py-1 rounded border border-[#333]">
                      {inp.quantity}x {inp.item}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight size={18} className="text-[#FFE500] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-600 text-[10px] font-semibold mb-1">OUTPUTS</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.Outputs.map((out, i) => (
                    <span key={i} className="text-xs bg-[#FFE500]/10 text-[#FFE500] px-2 py-1 rounded border border-[#FFE500]/30">
                      {out.quantity}x {out.item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {recipe.FacilityRequired && (
              <div className="mt-3 pt-3 border-t border-[#222] flex gap-4 text-xs text-gray-500">
                <span>Facility: {recipe.FacilityRequired} (Lv. {recipe.FacilityLevel})</span>
                {recipe.EnergyConsumption && <span>Energy: {recipe.EnergyConsumption} kW</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
