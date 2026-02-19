'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ThumbsUp, Copy, Check, Zap, Grid3X3, Package, TrendingUp, Download } from 'lucide-react';
import { SCRAPED_BLUEPRINTS, type BlueprintEntry } from '@/data/blueprints';
import RIOSHeader from '@/components/ui/RIOSHeader';

export default function BlueprintDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [countUp, setCountUp] = useState<Record<string, number>>({});

  const blueprint = useMemo(() => {
    return SCRAPED_BLUEPRINTS.find(bp => bp.slug === slug);
  }, [slug]);

  const relatedBlueprints = useMemo(() => {
    if (!blueprint) return [];

    // Find blueprints with similar tags or products
    const related = SCRAPED_BLUEPRINTS
      .filter(bp => bp.id !== blueprint.id)
      .map(bp => {
        let score = 0;
        // Same category
        if (bp.category === blueprint.category) score += 3;
        // Shared tags
        const sharedTags = bp.Tags.filter(tag => blueprint.Tags.includes(tag));
        score += sharedTags.length;
        // Same product
        if (bp.productName === blueprint.productName) score += 5;
        return { blueprint: bp, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.blueprint);

    return related;
  }, [blueprint]);

  // Animated counter effect for production rates
  useEffect(() => {
    if (!blueprint) return;

    const intervals: NodeJS.Timeout[] = [];

    blueprint.outputsPerMin.forEach((output, idx) => {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const stepValue = output.rate / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setCountUp(prev => ({ ...prev, [output.name]: output.rate }));
          clearInterval(interval);
        } else {
          setCountUp(prev => ({ ...prev, [output.name]: currentStep * stepValue }));
        }
      }, duration / steps);

      intervals.push(interval);
    });

    return () => intervals.forEach(i => clearInterval(i));
  }, [blueprint]);

  const copyCode = (region: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(region);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Blueprint Not Found</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">The blueprint you're looking for doesn't exist.</p>
          <Link
            href="/blueprints"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-black px-6 py-3 clip-corner-tl font-semibold hover:bg-[var(--color-accent)]/90 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blueprints
          </Link>
        </div>
      </div>
    );
  }

  const complexityColors = {
    Beginner: 'text-green-400 border-green-400/30 bg-green-400/10',
    Intermediate: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    Advanced: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    Expert: 'text-red-400 border-red-400/30 bg-red-400/10',
  };

  const categoryIcons = {
    Production: Package,
    Processing: TrendingUp,
    Power: Zap,
    'Complete Chain': Grid3X3,
    Compact: Package,
  };

  const CategoryIcon = categoryIcons[blueprint.category];

  return (
    <div className="pb-16">
      {/* Back Navigation */}
      <Link
        href="/blueprints"
        className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Blueprints</span>
      </Link>

      {/* Hero Section */}
      <div className="relative mb-8">
        {blueprint.previewImage && (
          <div className="relative h-[400px] w-full overflow-hidden clip-corner-tl border border-[var(--color-border)] mb-6">
            <Image
              src={blueprint.previewImage}
              alt={blueprint.Title}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white font-tactical mb-2">{blueprint.Title}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[var(--color-text-secondary)]">by {blueprint.Author}</span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className="text-[var(--color-text-secondary)]">{blueprint.Region}</span>
                    <span className="text-[var(--color-border)]">|</span>
                    <span className={`px-2 py-0.5 text-xs font-mono border ${complexityColors[blueprint.complexity]}`}>
                      {blueprint.complexity}
                    </span>
                  </div>
                </div>

                {/* Upvote Button */}
                <button className="flex items-center gap-2 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] px-4 py-3 clip-corner-tl hover:border-[var(--color-accent)] transition-colors">
                  <ThumbsUp size={20} className="text-[#FFE500]" />
                  <span className="text-white font-semibold text-lg">{blueprint.Upvotes}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!blueprint.previewImage && (
          <div className="mb-6">
            <RIOSHeader
              title={blueprint.Title}
              subtitle={`by ${blueprint.Author} • ${blueprint.Region}`}
              category="FACTORY"
              code={`BP-${blueprint.id.toString().padStart(3, '0')}`}
              icon={<CategoryIcon size={28} />}
            />
          </div>
        )}
      </div>

      {/* Production Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Output Cards */}
        {blueprint.outputsPerMin.map((output, idx) => (
          <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between mb-3">
              {blueprint.productIcon && idx === 0 && (
                <div className="w-12 h-12 bg-[#0a0a0a] border border-[var(--color-border)] p-1.5">
                  <Image
                    src={blueprint.productIcon}
                    alt={output.name}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <TrendingUp size={16} className="text-[var(--color-accent)] opacity-60" />
            </div>
            <h3 className="text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Production</h3>
            <p className="text-white font-semibold mb-1 truncate">{output.name}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--color-accent)] font-mono">
                {(countUp[output.name] || 0).toFixed(1)}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">/min</span>
            </div>
          </div>
        ))}

        {/* Net Power Card */}
        {blueprint.netPower !== undefined && (
          <div className={`bg-[var(--color-surface)] border clip-corner-tl p-5 hover:border-opacity-100 transition-all ${
            blueprint.netPower > 0 ? 'border-green-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <Zap size={24} className={blueprint.netPower > 0 ? 'text-green-400' : 'text-red-400'} />
              <div className={`text-xs px-2 py-0.5 ${blueprint.netPower > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {blueprint.netPower > 0 ? 'GENERATING' : 'CONSUMING'}
              </div>
            </div>
            <h3 className="text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Net Power</h3>
            <p className="text-white font-semibold mb-1">Power Grid</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${blueprint.netPower > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {blueprint.netPower > 0 ? '+' : ''}{Math.abs(blueprint.netPower)}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">kW</span>
            </div>
          </div>
        )}

        {/* Building Count Card */}
        {blueprint.buildingCount && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between mb-3">
              <Package size={24} className="text-[var(--color-accent)]" />
            </div>
            <h3 className="text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Buildings</h3>
            <p className="text-white font-semibold mb-1">Total Count</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{blueprint.buildingCount}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">units</span>
            </div>
          </div>
        )}

        {/* Grid Size Card */}
        {blueprint.gridSize && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between mb-3">
              <Grid3X3 size={24} className="text-[var(--color-accent)]" />
            </div>
            <h3 className="text-xs text-[var(--color-text-tertiary)] mb-1 uppercase tracking-wider">Grid Size</h3>
            <p className="text-white font-semibold mb-1">Footprint</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{blueprint.gridSize}</span>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
            <h2 className="text-2xl font-bold text-white font-tactical mb-4 flex items-center gap-3">
              <span className="diamond diamond-sm" />
              FACTORY ANALYSIS
            </h2>
            <div className="terminal-text text-[var(--color-text-secondary)] leading-relaxed space-y-4 whitespace-pre-line">
              {blueprint.detailDescription}
            </div>
          </div>

          {/* Import Codes Section */}
          {blueprint.importCodes.length > 0 && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <h2 className="text-2xl font-bold text-white font-tactical mb-4 flex items-center gap-3">
                <span className="diamond diamond-sm" />
                IMPORT CODES
              </h2>
              <div className="space-y-3">
                {blueprint.importCodes.map((ic, idx) => (
                  <div key={idx} className="bg-[var(--color-surface-2)] border border-[#333] clip-corner-tl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[var(--color-accent)] mb-1 uppercase tracking-wider">{ic.region}</div>
                        <code className="text-white font-mono text-sm break-all">{ic.code}</code>
                      </div>
                      <button
                        onClick={() => copyCode(ic.region, ic.code)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[#333] clip-corner-tl text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                      >
                        {copiedCode === ic.region ? (
                          <>
                            <Check size={14} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category & Tags */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5">
            <h3 className="text-sm text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider">Category</h3>
            <div className="flex items-center gap-2 mb-5 text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-3 py-2 clip-corner-tl">
              <CategoryIcon size={16} />
              <span className="text-sm font-semibold">{blueprint.category}</span>
            </div>

            <h3 className="text-sm text-[var(--color-text-tertiary)] mb-3 uppercase tracking-wider">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.Tags.map(tag => (
                <span key={tag} className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] px-2 py-1 border border-[#333]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Copy Button */}
          {blueprint.ImportString && blueprint.ImportString.startsWith('EFO') && (
            <button
              onClick={() => copyCode('default', blueprint.ImportString)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-black px-6 py-4 clip-corner-tl text-sm font-bold hover:bg-[var(--color-accent)]/90 transition-colors"
            >
              {copiedCode === 'default' ? (
                <>
                  <Check size={18} />
                  Code Copied!
                </>
              ) : (
                <>
                  <Download size={18} />
                  Copy Primary Import Code
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Related Blueprints */}
      {relatedBlueprints.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white font-tactical mb-6 flex items-center gap-3">
            <span className="diamond diamond-sm" />
            RELATED BLUEPRINTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedBlueprints.map(rb => (
              <Link
                key={rb.id}
                href={`/blueprints/${rb.slug}`}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all group"
              >
                {rb.previewImage && (
                  <div className="relative h-32 w-full bg-[#0a0a0a]">
                    <Image
                      src={rb.previewImage}
                      alt={rb.Title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="300px"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {rb.Title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-2">by {rb.Author}</p>
                  {rb.outputsPerMin.length > 0 && (
                    <div className="text-xs text-[var(--color-accent)] font-mono">
                      {rb.outputsPerMin[0].rate}/min
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
