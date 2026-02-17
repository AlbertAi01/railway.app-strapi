'use client';

import { useState, useEffect } from 'react';
import { Search, ThumbsUp, Copy, Check, Plus, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { fetchBlueprints } from '@/lib/api';
import { SCRAPED_BLUEPRINTS, type BlueprintEntry } from '@/data/blueprints';

export default function Blueprints() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [blueprints, setBlueprints] = useState<BlueprintEntry[]>(SCRAPED_BLUEPRINTS);
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    fetchBlueprints()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: BlueprintEntry[] = data.map((item: Record<string, unknown>, idx: number) => {
            const attrs = (item as Record<string, unknown>).attributes || item;
            return {
              id: (item as Record<string, unknown>).id as number || idx + 1,
              Title: (attrs as Record<string, unknown>).Title as string || '',
              Description: (attrs as Record<string, unknown>).Description as string || '',
              ImportString: (attrs as Record<string, unknown>).ImportString as string || '',
              Upvotes: (attrs as Record<string, unknown>).Upvotes as number || 0,
              Region: (attrs as Record<string, unknown>).Region as string || 'NA / EU',
              Author: (attrs as Record<string, unknown>).Author as string || 'guest',
              Tags: ((attrs as Record<string, unknown>).Tags as string[]) || [],
            };
          });
          setBlueprints(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = blueprints.filter(bp => {
    if (search && !bp.Title.toLowerCase().includes(search.toLowerCase()) && !bp.Tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (regionFilter && bp.Region !== regionFilter) return false;
    return true;
  }).sort((a, b) => b.Upvotes - a.Upvotes);

  const copyImportString = (id: number, str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">BLUEPRINTS</h1>
          <p className="text-gray-500 text-sm">Community factory blueprints for Arknights: Endfield</p>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-[#FFE500] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFD700] transition-colors"
          >
            <Plus size={16} /> Submit Blueprint
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#333] text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#444] transition-colors no-underline"
          >
            <LogIn size={16} /> Login to Submit
          </Link>
        )}
      </div>

      {showCreate && isAuthenticated && (
        <div className="bg-[#111] border border-[#FFE500] rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">Submit a Blueprint</h3>
          <p className="text-gray-500 text-xs mb-3">Submitting as {user?.username}</p>
          <div className="space-y-3">
            <input placeholder="Blueprint Title" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFE500]" />
            <textarea placeholder="Description" rows={3} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFE500]" />
            <input placeholder="Import String (EFO code)" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#FFE500]" />
            <div className="flex gap-2">
              <select className="bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option>Asia</option>
                <option>NA / EU</option>
                <option>CN</option>
              </select>
              <button className="bg-[#FFE500] text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFD700]">Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search blueprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FFE500]"
          />
        </div>
        <div className="flex gap-2">
          {['Asia', 'NA / EU', 'CN'].map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(regionFilter === r ? null : r)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                regionFilter === r ? 'border-[#FFE500] text-[#FFE500] bg-[#FFE500]/10' : 'border-[#333] text-gray-400 hover:border-[#555]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(bp => (
          <div key={bp.id} className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-semibold">{bp.Title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">by {bp.Author} &middot; {bp.Region}</p>
              </div>
              <div className="flex items-center gap-1 text-[#FFE500]">
                <ThumbsUp size={14} />
                <span className="text-sm font-semibold">{bp.Upvotes}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-3 whitespace-pre-line">{bp.Description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {bp.Tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-[#1a1a1a] text-gray-400 px-2 py-0.5 rounded-full border border-[#333]">{tag}</span>
                ))}
              </div>
              {bp.ImportString.startsWith('EFO') && (
                <button
                  onClick={() => copyImportString(bp.id, bp.ImportString)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs text-gray-300 hover:border-[#FFE500] hover:text-[#FFE500] transition-colors"
                >
                  {copiedId === bp.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Import</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
