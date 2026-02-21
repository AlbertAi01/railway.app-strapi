'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ThumbsUp, Copy, Check, Zap, Grid3X3, Package, TrendingUp, Download, Share2, MessageSquare, Play, Heart } from 'lucide-react';
import { SCRAPED_BLUEPRINTS, getUserBlueprints, isBlueprintUpvoted, toggleUpvoteBlueprint, getBlueprintUpvoteCount, type BlueprintEntry, type OutputRate, type Category } from '@/data/blueprints';
import { fetchBlueprintBySlug } from '@/lib/api';
import RIOSHeader from '@/components/ui/RIOSHeader';
import { useAuthStore } from '@/store/authStore';

// Building type for factory grid visualization
interface Building {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'production' | 'processing' | 'power' | 'storage' | 'logistics';
  label: string;
}

// Comment type for blueprint comments
interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
}

// Factory Grid Preview Component
function FactoryGridPreview({
  gridSize,
  buildingCount,
  category,
  outputsPerMin,
}: {
  gridSize: string;
  buildingCount: number;
  category: Category;
  outputsPerMin: OutputRate[];
}) {
  // Parse grid dimensions
  const [width, height] = gridSize.split('x').map(n => parseInt(n));
  const cellSize = 8; // pixels per grid cell
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;

  // Generate representative building layout based on category and building count
  const generateBuildings = (): Building[] => {
    const buildings: Building[] = [];
    const totalCells = width * height;
    const occupancyRatio = Math.min(0.4, (buildingCount * 12) / totalCells); // ~40% max occupancy

    // Determine building type distribution based on category
    let distribution = { production: 0.4, processing: 0.4, power: 0.1, storage: 0.05, logistics: 0.05 };

    switch (category) {
      case 'Production':
        distribution = { production: 0.6, processing: 0.2, power: 0.1, storage: 0.05, logistics: 0.05 };
        break;
      case 'Processing':
        distribution = { production: 0.2, processing: 0.6, power: 0.1, storage: 0.05, logistics: 0.05 };
        break;
      case 'Power':
        distribution = { production: 0.1, processing: 0.1, power: 0.6, storage: 0.15, logistics: 0.05 };
        break;
      case 'Complete Chain':
        distribution = { production: 0.3, processing: 0.3, power: 0.15, storage: 0.15, logistics: 0.1 };
        break;
      case 'Compact':
        distribution = { production: 0.45, processing: 0.35, power: 0.1, storage: 0.05, logistics: 0.05 };
        break;
    }

    const types: Array<'production' | 'processing' | 'power' | 'storage' | 'logistics'> = [
      'production', 'processing', 'power', 'storage', 'logistics'
    ];

    // Create a grid to track occupied cells
    const occupied = new Set<string>();

    // Generate buildings in a flow pattern (left to right, with some vertical distribution)
    const buildingsToPlace = Math.min(buildingCount, Math.floor(totalCells * occupancyRatio / 12));

    for (let i = 0; i < buildingsToPlace; i++) {
      // Determine building type based on distribution
      let typeIndex = 0;
      const rand = Math.random();
      let cumulative = 0;
      for (let t = 0; t < types.length; t++) {
        cumulative += distribution[types[t]];
        if (rand < cumulative) {
          typeIndex = t;
          break;
        }
      }
      const type = types[typeIndex];

      // Building size (varied by type)
      let bWidth = 3, bHeight = 3;
      if (type === 'processing') {
        bWidth = Math.random() > 0.5 ? 4 : 3;
        bHeight = Math.random() > 0.5 ? 4 : 3;
      } else if (type === 'power') {
        bWidth = 5;
        bHeight = 4;
      } else if (type === 'storage') {
        bWidth = 3;
        bHeight = 3;
      } else if (type === 'logistics') {
        bWidth = 2;
        bHeight = 2;
      }

      // Place building in a flow pattern (inputs left, outputs right)
      const flowProgress = i / buildingsToPlace;
      const baseX = Math.floor(flowProgress * (width - bWidth - 4)) + 2;
      const baseY = Math.floor((Math.sin(flowProgress * Math.PI * 3) * 0.3 + 0.5) * (height - bHeight - 4)) + 2;

      // Find nearest unoccupied position
      let placed = false;
      for (let dy = 0; dy < 5 && !placed; dy++) {
        for (let dx = 0; dx < 5 && !placed; dx++) {
          const x = baseX + dx;
          const y = baseY + dy;

          if (x + bWidth >= width || y + bHeight >= height) continue;

          // Check if this position is free
          let isFree = true;
          for (let cx = x; cx < x + bWidth + 1; cx++) {
            for (let cy = y; cy < y + bHeight + 1; cy++) {
              if (occupied.has(`${cx},${cy}`)) {
                isFree = false;
                break;
              }
            }
            if (!isFree) break;
          }

          if (isFree) {
            // Mark cells as occupied
            for (let cx = x; cx < x + bWidth; cx++) {
              for (let cy = y; cy < y + bHeight; cy++) {
                occupied.add(`${cx},${cy}`);
              }
            }

            buildings.push({
              x,
              y,
              width: bWidth,
              height: bHeight,
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1)
            });
            placed = true;
          }
        }
      }
    }

    return buildings;
  };

  const buildings = useMemo(() => generateBuildings(), [gridSize, buildingCount, category]);

  // Color scheme for building types (dark theme)
  const buildingColors = {
    production: { fill: '#3b82f6', stroke: '#60a5fa', label: 'Production' },
    processing: { fill: '#f97316', stroke: '#fb923c', label: 'Processing' },
    power: { fill: '#ef4444', stroke: '#f87171', label: 'Power' },
    storage: { fill: '#10b981', stroke: '#34d399', label: 'Storage' },
    logistics: { fill: '#6b7280', stroke: '#9ca3af', label: 'Logistics' }
  };

  // Input/Output ports
  const inputPorts = useMemo(() => {
    const ports = [];
    const numPorts = Math.min(3, Math.max(1, Math.floor(buildingCount / 15)));
    for (let i = 0; i < numPorts; i++) {
      ports.push({
        x: 0,
        y: Math.floor((i + 1) * height / (numPorts + 1))
      });
    }
    return ports;
  }, [height, buildingCount]);

  const outputPorts = useMemo(() => {
    const ports = [];
    const numPorts = outputsPerMin.length;
    for (let i = 0; i < numPorts; i++) {
      ports.push({
        x: width - 1,
        y: Math.floor((i + 1) * height / (numPorts + 1)),
        label: outputsPerMin[i].name
      });
    }
    return ports;
  }, [width, height, outputsPerMin]);

  return (
    <div className="w-full">
      {/* SVG Grid */}
      <div className="relative w-full overflow-auto rounded border border-[#1a1e2a] bg-[#0d1117]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ minHeight: '400px', maxHeight: '600px' }}
        >
          {/* Background */}
          <rect width={svgWidth} height={svgHeight} fill="#0d1117" />

          {/* Grid lines */}
          {Array.from({ length: width + 1 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={svgHeight}
              stroke="#1a1e2a"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: height + 1 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * cellSize}
              x2={svgWidth}
              y2={i * cellSize}
              stroke="#1a1e2a"
              strokeWidth="0.5"
            />
          ))}

          {/* Input ports */}
          {inputPorts.map((port, i) => (
            <g key={`input-${i}`}>
              <circle
                cx={port.x * cellSize + cellSize / 2}
                cy={port.y * cellSize}
                r={cellSize / 2}
                fill="#10b981"
                stroke="#34d399"
                strokeWidth="1"
              />
              <line
                x1={port.x * cellSize + cellSize / 2}
                y1={port.y * cellSize}
                x2={port.x * cellSize + cellSize * 3}
                y2={port.y * cellSize}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
            </g>
          ))}

          {/* Output ports */}
          {outputPorts.map((port, i) => (
            <g key={`output-${i}`}>
              <circle
                cx={port.x * cellSize + cellSize / 2}
                cy={port.y * cellSize}
                r={cellSize / 2}
                fill="#10b981"
                stroke="#34d399"
                strokeWidth="1"
              />
              <line
                x1={port.x * cellSize - cellSize * 3}
                y1={port.y * cellSize}
                x2={port.x * cellSize + cellSize / 2}
                y2={port.y * cellSize}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
            </g>
          ))}

          {/* Buildings */}
          {buildings.map((building, i) => {
            const colors = buildingColors[building.type];
            const bx = building.x * cellSize;
            const by = building.y * cellSize;
            const bw = building.width * cellSize;
            const bh = building.height * cellSize;

            return (
              <g key={i}>
                {/* Building rectangle */}
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                  opacity="0.8"
                />

                {/* Conveyor connections (arrows to next buildings) */}
                {i < buildings.length - 1 && (
                  <line
                    x1={bx + bw}
                    y1={by + bh / 2}
                    x2={buildings[i + 1].x * cellSize}
                    y2={buildings[i + 1].y * cellSize + (buildings[i + 1].height * cellSize) / 2}
                    stroke="#4b5563"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.4"
                    markerEnd="url(#arrowhead)"
                  />
                )}
              </g>
            );
          })}

          {/* Arrow marker for conveyor lines */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#4b5563" opacity="0.4" />
            </marker>
          </defs>

          {/* Grid dimension label */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 5}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
            fontFamily="monospace"
          >
            {gridSize}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        {Object.entries(buildingColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-4 h-4 border"
              style={{
                backgroundColor: colors.fill,
                borderColor: colors.stroke,
              }}
            />
            <span className="text-[var(--color-text-secondary)]">{colors.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#10b981] border border-[#34d399]" />
          <span className="text-[var(--color-text-secondary)]">I/O Ports</span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 text-xs text-[var(--color-text-muted)] text-center italic">
        Schematic representation based on blueprint metadata. Actual layout may vary.
      </div>
    </div>
  );
}

export default function BlueprintDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [countUp, setCountUp] = useState<Record<string, number>>({});
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [strapiBp, setStrapiBp] = useState<BlueprintEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const user = useAuthStore((state) => state.user);

  // First check static data
  const staticBlueprint = useMemo(() => {
    return SCRAPED_BLUEPRINTS.find(bp => bp.slug === slug);
  }, [slug]);

  // Also check localStorage submissions
  const localBlueprint = useMemo(() => {
    if (staticBlueprint) return null;
    return getUserBlueprints().find(bp => bp.slug === slug);
  }, [slug, staticBlueprint]);

  // If not found locally, try Strapi
  useEffect(() => {
    if (staticBlueprint || localBlueprint) return;
    setLoading(true);
    fetchBlueprintBySlug(slug).then(data => {
      if (data) {
        const attrs = data.attributes || data;
        const title = attrs.Title || '';
        const mapped: BlueprintEntry = {
          id: data.id || 0,
          Title: title,
          Description: attrs.Description || '',
          ImportString: attrs.ImportString || '',
          Upvotes: attrs.Upvotes || 0,
          Region: attrs.Region || 'NA / EU',
          Author: attrs.Author || 'Anonymous',
          Tags: Array.isArray(attrs.Tags) ? attrs.Tags : [],
          operators: Array.isArray(attrs.Operators) ? attrs.Operators : [],
          slug: attrs.Slug || slug,
          detailDescription: attrs.DetailDescription || attrs.Description || '',
          outputsPerMin: Array.isArray(attrs.OutputsData) ? attrs.OutputsData : [],
          importCodes: Array.isArray(attrs.ImportCodes) ? attrs.ImportCodes : attrs.ImportString ? [{ region: attrs.Region || 'NA / EU', code: attrs.ImportString }] : [],
          complexity: attrs.Complexity || 'Beginner',
          category: attrs.Category || 'Production',
          previewImage: attrs.PreviewImage || undefined,
          productName: attrs.ProductName || undefined,
          buildingCount: attrs.BuildingCount || undefined,
          gridSize: attrs.GridSize || undefined,
          netPower: attrs.NetPower || undefined,
          status: 'approved',
        };
        setStrapiBp(mapped);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, staticBlueprint, localBlueprint]);

  const blueprint = staticBlueprint || localBlueprint || strapiBp;

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

  // Initialize upvote state
  useEffect(() => {
    if (!blueprint) return;
    setUpvoted(isBlueprintUpvoted(blueprint.id));
    setUpvoteCount(getBlueprintUpvoteCount(blueprint.id));
  }, [blueprint]);

  // Load comments from localStorage
  useEffect(() => {
    if (!slug) return;
    const commentsKey = `endfield-bp-comments-${slug}`;
    try {
      const stored = localStorage.getItem(commentsKey);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch {
      setComments([]);
    }
  }, [slug]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    const commentsKey = `endfield-bp-comments-${slug}`;
    localStorage.setItem(commentsKey, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const handleUpvote = () => {
    if (!blueprint) return;
    const result = toggleUpvoteBlueprint(blueprint.id);
    setUpvoted(result.upvoted);
    setUpvoteCount(result.count);
  };

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

  const handleShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareMessage('URL copied to clipboard!');
    setTimeout(() => setShareMessage(''), 2000);
  };

  const handleSubmitComment = () => {
    if (!user || !newComment.trim()) return;

    const comment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: user.username,
      text: newComment.trim(),
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    if (!user) return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const hasLiked = comment.likedBy.includes(user.username);
        return {
          ...comment,
          likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
          likedBy: hasLiked
            ? comment.likedBy.filter(u => u !== user.username)
            : [...comment.likedBy, user.username],
        };
      }
      return comment;
    });

    saveComments(updatedComments);
  };

  const handleSimulateInPlanner = () => {
    if (!blueprint) return;

    // Encode blueprint data for factory planner
    const blueprintData = {
      title: blueprint.Title,
      importCode: blueprint.ImportString,
      buildingCount: blueprint.buildingCount,
      gridSize: blueprint.gridSize,
      outputs: blueprint.outputsPerMin,
    };

    const encodedData = btoa(JSON.stringify(blueprintData));
    window.location.href = `/factory-planner/planner?bp=${encodedData}`;
  };

  if (!blueprint) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="diamond-spinner mx-auto mb-4" />
            <p className="terminal-text text-[var(--color-accent)]">LOADING BLUEPRINT DATA...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Blueprint Not Found</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">The blueprint you're looking for doesn't exist or hasn't been approved yet.</p>
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.zerosanity.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Factory Blueprints',
        item: 'https://www.zerosanity.app/blueprints',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: blueprint.Title,
        item: `https://www.zerosanity.app/blueprints/${blueprint.slug}`,
      },
    ],
  };

  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: blueprint.Title,
    description: blueprint.Description,
    author: {
      '@type': 'Person',
      name: blueprint.Author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zero Sanity',
      url: 'https://www.zerosanity.app',
    },
    url: `https://www.zerosanity.app/blueprints/${blueprint.slug}`,
    ...(blueprint.previewImage && { image: blueprint.previewImage }),
    keywords: blueprint.Tags.join(', '),
    genre: 'Gaming Guide',
    about: {
      '@type': 'VideoGame',
      name: 'Arknights: Endfield',
    },
  };

  return (
    <div className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }} />
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
              priority
              placeholder="empty"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Output Cards */}
        {blueprint.outputsPerMin.map((output, idx) => (
          <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 hover:border-[var(--color-accent)] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
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
                    loading="lazy"
                  />
                </div>
              )}
              <TrendingUp size={18} className="text-[var(--color-accent)] opacity-60" />
            </div>
            <h3 className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Production</h3>
            <p className="text-white font-semibold text-base mb-1 truncate">{output.name}</p>
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
          <div className={`bg-[var(--color-surface)] border clip-corner-tl p-6 hover:border-opacity-100 transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 ${
            blueprint.netPower > 0 ? 'border-green-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <Zap size={28} className={blueprint.netPower > 0 ? 'text-green-400' : 'text-red-400'} />
              <div className={`text-sm px-2 py-0.5 ${blueprint.netPower > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {blueprint.netPower > 0 ? 'GENERATING' : 'CONSUMING'}
              </div>
            </div>
            <h3 className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Net Power</h3>
            <p className="text-white font-semibold text-base mb-1">Power Grid</p>
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
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 hover:border-[var(--color-accent)] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <Package size={28} className="text-[var(--color-accent)]" />
            </div>
            <h3 className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Buildings</h3>
            <p className="text-white font-semibold text-base mb-1">Total Count</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white font-mono">{blueprint.buildingCount}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">units</span>
            </div>
          </div>
        )}

        {/* Grid Size Card */}
        {blueprint.gridSize && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 hover:border-[var(--color-accent)] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <Grid3X3 size={28} className="text-[var(--color-accent)]" />
            </div>
            <h3 className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Grid Size</h3>
            <p className="text-white font-semibold text-base mb-1">Footprint</p>
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
          {/* Factory Grid Preview */}
          {blueprint.gridSize && blueprint.buildingCount && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-bold text-white font-tactical mb-4 flex items-center gap-3">
                <span className="diamond diamond-sm" />
                FACTORY LAYOUT
              </h2>
              <FactoryGridPreview
                gridSize={blueprint.gridSize}
                buildingCount={blueprint.buildingCount}
                category={blueprint.category}
                outputsPerMin={blueprint.outputsPerMin}
              />
            </div>
          )}

          {/* Description Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
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
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-2xl font-bold text-white font-tactical mb-4 flex items-center gap-3">
                <span className="diamond diamond-sm" />
                IMPORT CODES
              </h2>
              <div className="space-y-4">
                {blueprint.importCodes.map((ic, idx) => (
                  <div key={idx} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--color-accent)] mb-1 uppercase tracking-wider">{ic.region}</div>
                        <code className="text-white font-mono text-base break-all">{ic.code}</code>
                      </div>
                      <button
                        onClick={() => copyCode(ic.region, ic.code)}
                        className="ml-4 flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
                      >
                        {copiedCode === ic.region ? (
                          <>
                            <Check size={16} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
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
          {/* Voting & Actions Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-sm text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Actions</h3>

            {/* Upvote Button - Prominent */}
            <button
              onClick={handleUpvote}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 clip-corner-tl text-base font-bold transition-all mb-3 ${
                upvoted
                  ? 'bg-[#FFE500] text-black border-2 border-[#FFE500]'
                  : 'bg-[var(--color-surface)] text-white border-2 border-[var(--color-border)] hover:border-[#FFE500]'
              }`}
              title={upvoted ? 'Remove upvote' : 'Upvote this blueprint'}
            >
              <ThumbsUp size={24} className={upvoted ? 'fill-current' : ''} />
              <div className="flex flex-col items-start">
                <span className="text-xs opacity-75">Upvotes</span>
                <span className="text-2xl font-bold">{upvoteCount}</span>
              </div>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareUrl}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-4 py-3 clip-corner-tl hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors mb-2"
            >
              {shareMessage ? (
                <>
                  <Check size={18} />
                  <span className="text-sm font-medium">{shareMessage}</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share Blueprint</span>
                </>
              )}
            </button>
          </div>

          {/* Category & Tags */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-sm text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Category</h3>
            <div className="flex items-center gap-2 mb-5 text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-3 py-2 clip-corner-tl">
              <CategoryIcon size={16} />
              <span className="text-sm font-semibold">{blueprint.category}</span>
            </div>

            <h3 className="text-sm text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.Tags.map(tag => (
                <span key={tag} className="text-sm bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] px-3 py-1.5 border border-[var(--color-border)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Simulate in Factory Planner */}
          {blueprint.ImportString && (
            <button
              onClick={handleSimulateInPlanner}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-black px-6 py-4 clip-corner-tl text-base font-bold hover:bg-[var(--color-accent)]/90 transition-colors shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
            >
              <Play size={20} />
              Simulate in Factory Planner
            </button>
          )}

          {/* Quick Copy Button */}
          {blueprint.ImportString && blueprint.ImportString.startsWith('EFO') && (
            <button
              onClick={() => copyCode('default', blueprint.ImportString)}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-black px-6 py-4 clip-corner-tl text-base font-bold hover:bg-[var(--color-accent)]/90 transition-colors shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]"
            >
              {copiedCode === 'default' ? (
                <>
                  <Check size={20} />
                  Code Copied!
                </>
              ) : (
                <>
                  <Download size={20} />
                  Copy Primary Import Code
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-2xl font-bold text-white font-tactical mb-6 flex items-center gap-3">
            <MessageSquare size={24} className="text-[var(--color-accent)]" />
            COMMUNITY DISCUSSION
          </h2>

          {/* Comment Input */}
          {user ? (
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts, tips, or modifications..."
                className="w-full min-h-[100px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white p-4 font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-y"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {newComment.length}/500 characters
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 bg-[var(--color-accent)] text-black px-6 py-2.5 clip-corner-tl font-semibold hover:bg-[var(--color-accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare size={16} />
                  Post Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-6 text-center">
              <p className="text-[var(--color-text-secondary)] mb-3">
                Join the conversation! Log in to share your thoughts.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-black px-6 py-3 clip-corner-tl font-semibold hover:bg-[var(--color-accent)]/90 transition-colors"
              >
                Log in to comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)] border border-[var(--color-border)] border-dashed clip-corner-tl">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[var(--color-accent)] font-semibold">
                        {comment.author}
                      </span>
                      <span className="text-[var(--color-text-muted)] text-xs ml-3">
                        {new Date(comment.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {user && (
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 clip-corner-tl border transition-colors ${
                          comment.likedBy.includes(user.username)
                            ? 'bg-red-500/20 border-red-500/50 text-red-400'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-red-500/50'
                        }`}
                      >
                        <Heart
                          size={14}
                          className={comment.likedBy.includes(user.username) ? 'fill-current' : ''}
                        />
                        <span className="text-xs font-semibold">{comment.likes}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Blueprints */}
      {relatedBlueprints.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white font-tactical mb-6 flex items-center gap-3">
            <span className="diamond diamond-sm" />
            RELATED BLUEPRINTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedBlueprints.map(rb => (
              <Link
                key={rb.id}
                href={`/blueprints/${rb.slug}`}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl overflow-hidden hover:border-[var(--color-accent)] transition-all group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
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
                      loading="lazy"
                      placeholder="empty"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {rb.Title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">by {rb.Author}</p>
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
