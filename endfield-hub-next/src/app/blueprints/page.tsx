'use client';

import { useState, useEffect } from 'react';
import { Search, ThumbsUp, Copy, Check, Plus, LogIn, LayoutGrid, ImageOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import { fetchBlueprints } from '@/lib/api';
import { SCRAPED_BLUEPRINTS, type BlueprintEntry } from '@/data/blueprints';
import RIOSHeader from '@/components/ui/RIOSHeader';

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
          // Merge user-submitted Strapi blueprints with scraped community blueprints.
          // Only add Strapi entries whose titles don't duplicate scraped ones.
          const scrapedTitles = new Set(SCRAPED_BLUEPRINTS.map(bp => bp.Title.toLowerCase()));
          const userSubmitted = mapped.filter(bp => !scrapedTitles.has(bp.Title.toLowerCase()));
          setBlueprints([...SCRAPED_BLUEPRINTS, ...userSubmitted]);
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
          <RIOSHeader title="Blueprint Registry" category="LOGISTICS" code="RIOS-BP-001" icon={<LayoutGrid size={28} />} />
          <p className="text-[var(--color-text-tertiary)] text-sm mt-2">Community factory blueprints for Arknights: Endfield</p>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-[var(--color-accent)] text-black px-4 py-2 clip-corner-tl text-sm font-semibold hover:bg-[var(--color-accent)]/90 transition-colors"
          >
            <Plus size={16} /> Submit Blueprint
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#333] text-[var(--color-text-secondary)] px-4 py-2 clip-corner-tl text-sm font-semibold hover:bg-[#444] transition-colors no-underline"
          >
            <LogIn size={16} /> Login to Submit
          </Link>
        )}
      </div>

      {showCreate && isAuthenticated && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent)] clip-corner-tl p-5 mb-6">
          <h3 className="text-white font-semibold mb-3">Submit a Blueprint</h3>
          <p className="text-[var(--color-text-tertiary)] text-xs mb-3">Submitting as {user?.username}</p>
          <div className="space-y-3">
            <input placeholder="Blueprint Title" className="w-full bg-[#0a0a0a] border border-[#333] clip-corner-tl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
            <textarea placeholder="Description" rows={3} className="w-full bg-[#0a0a0a] border border-[#333] clip-corner-tl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]" />
            <input placeholder="Import String (EFO code)" className="w-full bg-[#0a0a0a] border border-[#333] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]" />
            <div className="flex gap-2">
              <select className="bg-[#0a0a0a] border border-[#333] clip-corner-tl px-3 py-2 text-white text-sm focus:outline-none">
                <option>Asia</option>
                <option>NA / EU</option>
                <option>CN</option>
              </select>
              <button className="bg-[var(--color-accent)] text-black px-6 py-2 clip-corner-tl text-sm font-semibold hover:bg-[var(--color-accent)]/90">Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search blueprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[#333] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="flex gap-2">
          {['Asia', 'NA / EU', 'CN'].map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(regionFilter === r ? null : r)}
              className={`px-3 py-1 text-xs font-medium border ${
                regionFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[#333] text-[var(--color-text-secondary)] hover:border-[#555]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(bp => (
          <div key={bp.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-all overflow-hidden">
            <div className="flex">
              {/* Preview Image */}
              <div className="relative w-48 min-h-[140px] flex-shrink-0 bg-[#0a0a0a] border-r border-[var(--color-border)]">
                {bp.previewImage ? (
                  <Image
                    src={bp.previewImage}
                    alt={`${bp.Title} factory preview`}
                    fill
                    className="object-cover"
                    sizes="192px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-tertiary)]">
                    <ImageOff size={28} className="mb-1 opacity-40" />
                    <span className="text-[10px] uppercase tracking-wider opacity-40">No Preview</span>
                  </div>
                )}
                {/* Product icon overlay */}
                {bp.productIcon && (
                  <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#0a0a0a]/80 border border-[var(--color-border)] p-1 backdrop-blur-sm">
                    <Image
                      src={bp.productIcon}
                      alt={bp.productName || ''}
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold truncate">{bp.Title}</h3>
                      {bp.productName && (
                        <span className="flex-shrink-0 text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 clip-corner-tl border border-[var(--color-accent)]/30 font-mono uppercase">
                          {bp.productName}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--color-text-tertiary)] text-xs mt-0.5">by {bp.Author} &middot; {bp.Region}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FFE500] flex-shrink-0 ml-3">
                    <ThumbsUp size={14} />
                    <span className="text-sm font-semibold">{bp.Upvotes}</span>
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)] text-sm mb-3 whitespace-pre-line line-clamp-2">{bp.Description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {bp.Tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] px-2 py-0.5 border border-[#333]">{tag}</span>
                    ))}
                  </div>
                  {bp.ImportString.startsWith('EFO') && (
                    <button
                      onClick={() => copyImportString(bp.id, bp.ImportString)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-2)] border border-[#333] clip-corner-tl text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                    >
                      {copiedId === bp.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Import</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
