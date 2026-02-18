import { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, BookOpen, Users, Grid3x3, TrendingUp, Zap, AlertCircle, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Factory Planner - Zero Sanity',
  description: 'Design and optimize your AIC (Automated Industry Complex) factory layouts with an interactive grid-based planner',
};

export default function FactoryPlannerLandingPage() {
  return (
    <div className="min-h-screen text-[var(--color-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-5xl font-bold text-white font-rajdhani">Factory Planner</h1>
            <span className="px-3 py-1 bg-[var(--color-accent)] text-black text-sm font-bold font-rajdhani flex items-center gap-1">
              <Zap size={14} />
              BETA
            </span>
          </div>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-3xl">
            Design and optimize your AIC (Automated Industry Complex) factory layouts with an interactive grid-based planner
          </p>
        </div>

        {/* Three Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Factory Planner Card */}
          <Link
            href="/factory-planner/planner"
            className="group relative h-64 bg-gradient-to-tr from-[#1a3a4a] to-[#2a6a7a] clip-corner-tl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <Wrench size={48} className="mb-4 text-[#4ac3d9]" />
              <h2 className="text-2xl font-bold text-white mb-2 font-rajdhani">Factory Planner</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Design & Build</p>
            </div>
          </Link>

          {/* Recipe Browser Card */}
          <Link
            href="/recipes"
            className="group relative h-64 bg-gradient-to-tr from-[#1a2a4a] to-[#3a4a7a] clip-corner-tl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <BookOpen size={48} className="mb-4 text-[#5a7adb]" />
              <h2 className="text-2xl font-bold text-white mb-2 font-rajdhani">Recipe Browser</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Browse All Recipes</p>
            </div>
          </Link>

          {/* Community Blueprints Card */}
          <Link
            href="/blueprints"
            className="group relative h-64 bg-gradient-to-tr from-[#2a1a4a] to-[#5a3a7a] clip-corner-tl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <Users size={48} className="mb-4 text-[#8a5adb]" />
              <h2 className="text-2xl font-bold text-white mb-2 font-rajdhani">Community Blueprints</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Share & Discover</p>
            </div>
          </Link>
        </div>

        {/* Work In Progress Notice */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="text-[var(--color-accent)] shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2 font-rajdhani">Work in Progress</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                This tool is still in active development. Please report any issues or share your ideas in our Discord community!
              </p>
            </div>
          </div>
        </div>

        {/* Discord Link */}
        <div className="mb-12">
          <a
            href="https://discord.gg/your-discord-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[var(--color-surface)] border-l-4 border-l-[var(--color-accent)] border-y border-r border-[var(--color-border)] px-6 py-4 hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <MessageSquare size={20} className="text-[var(--color-accent)]" />
            <span className="text-white font-bold">Report Issues & Ideas</span>
          </a>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 font-rajdhani">Features</h2>
            <p className="text-[var(--color-text-secondary)]">Everything you need to plan your perfect AIC factory</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Interactive Grid Feature */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="mb-4">
                <Grid3x3 size={36} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-rajdhani">Interactive Grid</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Place buildings and conveyors on a customizable grid with zoom support
              </p>
            </div>

            {/* Building Library Feature */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="mb-4">
                <TrendingUp size={36} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-rajdhani">Building Library</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Access all factory buildings with detailed stats and recipes
              </p>
            </div>

            {/* Smart Conveyors Feature */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] clip-corner-tl p-6">
              <div className="mb-4">
                <Zap size={36} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-rajdhani">Smart Conveyors</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Connect buildings with intelligent conveyor routing that detects errors and suggests fixes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
