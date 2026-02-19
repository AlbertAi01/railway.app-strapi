'use client';

import { useState, useEffect } from 'react';
import { Search, ThumbsUp, Copy, Check, Plus, LogIn, LayoutGrid, ImageOff, Filter, Zap, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';
import { fetchBlueprints } from '@/lib/api';
import { SCRAPED_BLUEPRINTS, type BlueprintEntry, type Category, type Complexity } from '@/data/blueprints';
import RIOSHeader from '@/components/ui/RIOSHeader';

export default function Blueprints() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [complexityFilter, setComplexityFilter] = useState<Complexity | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [blueprints, setBlueprints] = useState<BlueprintEntry[]>(SCRAPED_BLUEPRINTS);
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  // Blueprint submission form state
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitImport, setSubmitImport] = useState('');
  const [submitRegion, setSubmitRegion] = useState('NA / EU');
  const [submitCategory, setSubmitCategory] = useState<Category>('Production');
  const [submitComplexity, setSubmitComplexity] = useState<Complexity>('Beginner');
  const [submitTags, setSubmitTags] = useState('');
  const [submitOperators, setSubmitOperators] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmitBlueprint = async () => {
    if (!submitTitle.trim() || !submitImport.trim()) return;
    setSubmitStatus('submitting');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi.zerosanity.app';
      const res = await fetch(`${apiUrl}/api/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            Title: submitTitle.trim(),
            Description: submitDesc.trim(),
            ImportString: submitImport.trim(),
            Region: submitRegion,
            Author: user?.username || 'anonymous',
            Tags: submitTags.split(',').map(t => t.trim()).filter(Boolean),
            Operators: submitOperators.split(',').map(t => t.trim()).filter(Boolean),
          },
        }),
      });
      if (res.ok) {
        const newBp: BlueprintEntry = {
          id: Date.now(),
          Title: submitTitle.trim(),
          Description: submitDesc.trim(),
          ImportString: submitImport.trim(),
          Upvotes: 0,
          Region: submitRegion,
          Author: user?.username || 'anonymous',
          Tags: submitTags.split(',').map(t => t.trim()).filter(Boolean),
          operators: submitOperators.split(',').map(t => t.trim()).filter(Boolean),
          category: submitCategory,
          complexity: submitComplexity,
          slug: submitTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          detailDescription: submitDesc.trim() || 'User-submitted blueprint.',
          outputsPerMin: [],
          importCodes: [{ region: submitRegion, code: submitImport.trim() }],
        };
        setBlueprints(prev => [newBp, ...prev]);
        setSubmitTitle(''); setSubmitDesc(''); setSubmitImport(''); setSubmitTags(''); setSubmitOperators('');
        setSubmitStatus('success');
        setTimeout(() => { setSubmitStatus('idle'); setShowCreate(false); }, 2000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    fetchBlueprints()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: BlueprintEntry[] = data.map((item: Record<string, unknown>, idx: number) => {
            const attrs = (item as Record<string, unknown>).attributes || item;
            const title = ((attrs as Record<string, unknown>).Title as string) || '';
            return {
              id: (item as Record<string, unknown>).id as number || idx + 1,
              Title: title,
              Description: ((attrs as Record<string, unknown>).Description as string) || '',
              ImportString: ((attrs as Record<string, unknown>).ImportString as string) || '',
              Upvotes: ((attrs as Record<string, unknown>).Upvotes as number) || 0,
              Region: ((attrs as Record<string, unknown>).Region as string) || 'NA / EU',
              Author: ((attrs as Record<string, unknown>).Author as string) || 'guest',
              Tags: Array.isArray((attrs as Record<string, unknown>).Tags) ? ((attrs as Record<string, unknown>).Tags as string[]) : [],
              operators: Array.isArray((attrs as Record<string, unknown>).Operators) ? ((attrs as Record<string, unknown>).Operators as string[]) : [],
              slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              detailDescription: ((attrs as Record<string, unknown>).Description as string) || 'User-submitted blueprint.',
              outputsPerMin: [],
              importCodes: [],
              complexity: 'Intermediate' as Complexity,
              category: 'Production' as Category,
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
    const tags = bp.Tags || [];
    if (search && !bp.Title.toLowerCase().includes(search.toLowerCase()) && !tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (regionFilter && bp.Region !== regionFilter) return false;
    if (categoryFilter && bp.category !== categoryFilter) return false;
    if (complexityFilter && bp.complexity !== complexityFilter) return false;
    return true;
  }).sort((a, b) => b.Upvotes - a.Upvotes);

  const categories: Category[] = ['Production', 'Processing', 'Power', 'Complete Chain', 'Compact'];
  const complexities: Complexity[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const copyImportString = (id: number, str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <RIOSHeader title="Blueprint Registry" category="LOGISTICS" code="RIOS-BP-001" icon={<LayoutGrid size={32} />} />
          <p className="text-[var(--color-text-muted)] text-base mt-2">Community factory blueprints for Arknights: Endfield</p>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-[var(--color-accent)] text-black px-5 py-2.5 clip-corner-tl text-sm font-semibold hover:bg-[var(--color-accent)]/90 transition-colors shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
          >
            <Plus size={18} /> Submit Blueprint
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-secondary)] px-5 py-2.5 clip-corner-tl text-sm font-semibold hover:bg-[var(--color-surface-2)] transition-colors no-underline border border-[var(--color-border)]"
          >
            <LogIn size={18} /> Login to Submit
          </Link>
        )}
      </div>

      {showCreate && isAuthenticated && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent)] clip-corner-tl p-6 mb-8 space-y-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold font-mono text-sm uppercase tracking-wider">Submit a Blueprint</h3>
            <span className="text-[9px] font-mono text-[var(--color-text-muted)]">Submitting as {user?.username}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Blueprint Title *</label>
              <input
                placeholder="e.g. Efficient Carbon Fiber 2x"
                value={submitTitle} onChange={e => setSubmitTitle(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Description</label>
              <textarea
                placeholder="Describe your blueprint layout, production rates, power usage..."
                rows={3} value={submitDesc} onChange={e => setSubmitDesc(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Import String (EFO Code) *</label>
              <input
                placeholder="Paste your blueprint import string here"
                value={submitImport} onChange={e => setSubmitImport(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Tags (comma separated)</label>
              <input
                placeholder="e.g. efficient, compact, carbon fiber"
                value={submitTags} onChange={e => setSubmitTags(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Related Operators (comma separated)</label>
              <input
                placeholder="e.g. Laevatain, Akekuri, Ardelia"
                value={submitOperators} onChange={e => setSubmitOperators(e.target.value)}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="text-[9px] text-[var(--color-text-muted)] mt-1">This blueprint will appear on tagged operator pages under &quot;Community Builds&quot;</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Region</label>
                <select
                  value={submitRegion} onChange={e => setSubmitRegion(e.target.value)}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option>NA / EU</option>
                  <option>Asia</option>
                  <option>CN</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Category</label>
                <select
                  value={submitCategory} onChange={e => setSubmitCategory(e.target.value as Category)}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-[var(--color-accent)] uppercase font-bold mb-1 block">Complexity</label>
                <select
                  value={submitComplexity} onChange={e => setSubmitComplexity(e.target.value as Complexity)}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[var(--color-accent)]"
                >
                  {complexities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmitBlueprint}
                disabled={!submitTitle.trim() || !submitImport.trim() || submitStatus === 'submitting'}
                className="bg-[var(--color-accent)] text-black px-6 py-2 clip-corner-tl text-sm font-mono font-bold hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitStatus === 'submitting' ? 'Submitting...' : submitStatus === 'success' ? 'Submitted!' : 'Submit Blueprint'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              {submitStatus === 'error' && (
                <span className="text-xs font-mono text-red-400">Failed to submit. Blueprint saved locally.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search blueprints by name or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[#333] clip-corner-tl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border clip-corner-tl shadow-[var(--shadow-card)] ${
              showFilters || categoryFilter || complexityFilter
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] bg-[var(--color-surface)]'
            }`}
          >
            <Filter size={18} />
            Filters
            {(categoryFilter || complexityFilter) && (
              <span className="bg-[var(--color-accent)] text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {(categoryFilter ? 1 : 0) + (complexityFilter ? 1 : 0)}
              </span>
            )}
          </button>
          <div className="flex gap-2">
            {['Asia', 'NA / EU', 'CN'].map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(regionFilter === r ? null : r)}
                className={`px-4 py-2 text-sm font-medium border ${
                  regionFilter === r ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/30 clip-corner-tl p-5 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Filter */}
              <div>
                <label className="text-sm text-[var(--color-text-muted)] mb-2 block uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                      className={`px-4 py-2 text-sm font-medium border clip-corner-tl ${
                        categoryFilter === cat
                          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity Filter */}
              <div>
                <label className="text-sm text-[var(--color-text-muted)] mb-2 block uppercase tracking-wider">Complexity</label>
                <div className="flex flex-wrap gap-2">
                  {complexities.map(comp => (
                    <button
                      key={comp}
                      onClick={() => setComplexityFilter(complexityFilter === comp ? null : comp)}
                      className={`px-4 py-2 text-sm font-medium border clip-corner-tl ${
                        complexityFilter === comp
                          ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(categoryFilter || complexityFilter) && (
              <button
                onClick={() => {
                  setCategoryFilter(null);
                  setComplexityFilter(null);
                }}
                className="mt-3 text-xs text-[var(--color-accent)] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-[var(--color-text-muted)]">
          Showing <span className="text-[var(--color-accent)] font-semibold">{filtered.length}</span> of{' '}
          <span className="text-white font-semibold">{blueprints.length}</span> blueprints
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(bp => (
          <Link
            key={bp.id}
            href={`/blueprints/${bp.slug}`}
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl hover:border-[var(--color-accent)] transition-all overflow-hidden group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
          >
            <div className="flex">
              {/* Preview Image */}
              <div className="relative w-48 min-h-[140px] flex-shrink-0 bg-[#0a0a0a] border-r border-[var(--color-border)]">
                {bp.previewImage ? (
                  <Image
                    src={bp.previewImage}
                    alt={`${bp.Title} factory preview`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="192px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
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
              <div className="flex-1 p-6 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-base truncate group-hover:text-[var(--color-accent)] transition-colors">{bp.Title}</h3>
                      {bp.productName && (
                        <span className="flex-shrink-0 text-[11px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-0.5 clip-corner-tl border border-[var(--color-accent)]/30 font-mono uppercase">
                          {bp.productName}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--color-text-muted)] text-sm mt-0.5">by {bp.Author} &middot; {bp.Region}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FFE500] flex-shrink-0 ml-3">
                    <ThumbsUp size={16} />
                    <span className="text-base font-semibold">{bp.Upvotes}</span>
                  </div>
                </div>

                {/* Production Rates */}
                {(bp.outputsPerMin?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {bp.outputsPerMin.slice(0, 3).map((output, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-1.5 clip-corner-tl">
                        <Package size={14} className="text-[var(--color-accent)]" />
                        <span className="text-sm text-white font-mono">{output.rate}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">/min</span>
                        <span className="text-sm text-[var(--color-text-secondary)] truncate max-w-[100px]">{output.name}</span>
                      </div>
                    ))}
                    {bp.outputsPerMin.length > 3 && (
                      <div className="flex items-center px-3 py-1.5 text-sm text-[var(--color-text-muted)]">
                        +{bp.outputsPerMin.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-4 mb-4">
                  {bp.netPower !== undefined && (
                    <div className={`flex items-center gap-1.5 text-sm ${
                      bp.netPower > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <Zap size={16} />
                      <span className="font-mono font-semibold">
                        {bp.netPower > 0 ? '+' : ''}{bp.netPower} kW
                      </span>
                    </div>
                  )}
                  {bp.buildingCount && (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                      <Package size={16} />
                      <span>{bp.buildingCount} buildings</span>
                    </div>
                  )}
                  {bp.complexity && (
                    <span className={`text-[11px] px-2 py-0.5 font-mono border ${
                      bp.complexity === 'Beginner' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                      bp.complexity === 'Intermediate' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                      bp.complexity === 'Advanced' ? 'text-purple-400 border-purple-400/30 bg-purple-400/10' :
                      'text-red-400 border-red-400/30 bg-red-400/10'
                    }`}>
                      {bp.complexity}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {(bp.Tags || []).slice(0, 4).map(tag => (
                      <span key={tag} className="text-[11px] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] px-2 py-1 border border-[var(--color-border)]">{tag}</span>
                    ))}
                  </div>
                  {bp.ImportString.startsWith('EFO') && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyImportString(bp.id, bp.ImportString);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                    >
                      {copiedId === bp.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Import</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
