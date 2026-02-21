'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Check, Copy, MapPin, MessageSquare, ThumbsUp, ThumbsDown,
  Camera, Send, ChevronDown, ChevronUp, Reply, Flag, Clock,
  CheckCircle2, Image as ImageIcon, Trash2, Bold, Italic, Link2,
  Eye, CornerDownRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// ──── Types ────

export interface POI {
  id: string;
  type: string;
  cat: string;
  sub: string;
  px: number;
  py: number;
  zone: string;
  layer: number;
  name: string;
}

interface CommentReply {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: number;
  upvotes: number;
  userVote: 'up' | 'down' | null;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  screenshots: string[];
  replies: CommentReply[];
  isPinned?: boolean;
}

interface MapDetailPanelProps {
  poi: POI;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onClose: () => void;
  categoryConfig: Record<string, { label: string; color: string; icon: string }>;
  zoneNames: Record<string, string>;
  iconBase: string;
  getEntityIcon: (type: string) => string;
  mapRegion: string;
}

// ──── Utility ────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ──── Storage ────

const COMMENT_STORAGE_KEY = 'zerosanity-map-comments';

function loadLocalComments(): Record<string, Comment[]> {
  try {
    const raw = localStorage.getItem(COMMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocalComments(data: Record<string, Comment[]>) {
  try {
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(data));
  } catch { /* silent */ }
}

// ════════════════════════════════════════════
//  MAP DETAIL PANEL COMPONENT
// ════════════════════════════════════════════

export default function MapDetailPanel({
  poi, isCompleted, onToggleComplete, onClose,
  categoryConfig, zoneNames, iconBase, getEntityIcon, mapRegion,
}: MapDetailPanelProps) {
  const { user } = useAuthStore();

  // ── State ──
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showScreenshots, setShowScreenshots] = useState<Set<string>>(new Set());
  const [coordsCopied, setCoordsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // ── Load comments on POI change ──
  useEffect(() => {
    const local = loadLocalComments();
    setComments(local[poi.id] || []);
    setCommentText('');
    setReplyingTo(null);
    setReplyText('');
    setUploadedImages([]);
    setActiveTab('info');
    setCoordsCopied(false);
  }, [poi.id]);

  // ── Scroll to top on POI change ──
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [poi.id]);

  // ── Actions ──
  const copyCoords = useCallback(() => {
    const text = `${Math.round(poi.px)}, ${Math.round(poi.py)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    }).catch(() => {});
  }, [poi.px, poi.py]);

  const addComment = useCallback(() => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: generateId(),
      author: user?.username || 'Anonymous Doctor',
      text: commentText.trim(),
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      screenshots: [...uploadedImages],
      replies: [],
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');
    setUploadedImages([]);

    // Persist
    const local = loadLocalComments();
    local[poi.id] = [...(local[poi.id] || []), newComment];
    saveLocalComments(local);
  }, [commentText, comments, poi.id, user, uploadedImages]);

  const addReply = useCallback((commentId: string) => {
    if (!replyText.trim()) return;
    const newReply: CommentReply = {
      id: generateId(),
      author: user?.username || 'Anonymous Doctor',
      text: replyText.trim(),
      createdAt: Date.now(),
      upvotes: 0,
      userVote: null,
    };
    const updated = comments.map(c =>
      c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
    );
    setComments(updated);
    setReplyingTo(null);
    setReplyText('');
  }, [replyText, comments, user]);

  const voteComment = useCallback((commentId: string, direction: 'up' | 'down') => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const prevVote = c.userVote;
      if (prevVote === direction) {
        // Remove vote
        return {
          ...c,
          upvotes: direction === 'up' ? c.upvotes - 1 : c.upvotes,
          downvotes: direction === 'down' ? c.downvotes - 1 : c.downvotes,
          userVote: null,
        };
      }
      return {
        ...c,
        upvotes: direction === 'up' ? c.upvotes + 1 : (prevVote === 'up' ? c.upvotes - 1 : c.upvotes),
        downvotes: direction === 'down' ? c.downvotes + 1 : (prevVote === 'down' ? c.downvotes - 1 : c.downvotes),
        userVote: direction,
      };
    }));
  }, []);

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const toggleScreenshot = useCallback((commentId: string) => {
    setShowScreenshots(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const removeUploadedImage = useCallback((idx: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // ── Derived ──
  const cat = categoryConfig[poi.cat];
  const zoneName = zoneNames[poi.zone] || poi.zone;
  const commentCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <>
      {/* Panel */}
      <div
        className="absolute top-0 right-0 z-50 h-full w-[380px] max-w-[90vw] flex flex-col bg-[var(--color-surface)]/[0.97] border-l border-[var(--color-border)] backdrop-blur-sm shadow-[-8px_0_32px_rgba(0,0,0,0.6)] animate-slide-in-right"
        style={{ '--slide-distance': '380px' } as React.CSSProperties}
      >
        {/* ── Header ── */}
        <div className="shrink-0 border-b border-[var(--color-border)]">
          {/* Classification bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-surface-2)]">
            <div className="flex items-center gap-2">
              <div className="diamond-sm" style={{ background: cat?.color || '#888' }} />
              <span className="terminal-text-sm" style={{ color: cat?.color || '#888' }}>
                {poi.cat.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                // {mapRegion.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* POI Info */}
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div
                className="w-12 h-12 shrink-0 flex items-center justify-center rounded-sm border-2"
                style={{ borderColor: cat?.color || '#888', backgroundColor: `${cat?.color || '#888'}20` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${iconBase}/${getEntityIcon(poi.type)}.png`}
                  alt={poi.type}
                  className="w-10 h-10 object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-[15px] font-tactical leading-tight truncate">
                  {poi.name || poi.sub || poi.type}
                </h3>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase mt-0.5">
                  {poi.cat}{poi.sub ? ` / ${poi.sub}` : ''}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={11} className="text-[var(--color-text-muted)]" />
                  <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{zoneName}</span>
                </div>
              </div>
            </div>

            {/* Coordinates + Actions Row */}
            <div className="flex items-center gap-2 mt-3">
              {/* Coordinates */}
              <button
                onClick={copyCoords}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
              >
                {coordsCopied ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Copy size={12} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]" />
                )}
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)]">
                  {coordsCopied ? 'Copied!' : `${Math.round(poi.px)}, ${Math.round(poi.py)}`}
                </span>
              </button>

              <div className="flex-1" />

              {/* Complete Toggle */}
              <button
                onClick={() => onToggleComplete(poi.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider border transition-all ${
                  isCompleted
                    ? 'bg-green-900/30 border-green-600 text-green-400 hover:bg-green-900/50'
                    : 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={13} /> : <Check size={13} />}
                <span>{isCompleted ? 'Done' : 'Complete'}</span>
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-t border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'info'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Eye size={13} />
              Details
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'comments'
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <MessageSquare size={13} />
              Comments
              {commentCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0 text-[10px] bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-sm">
                  {commentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div ref={panelRef} className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
          {activeTab === 'info' ? (
            /* ═══ INFO TAB ═══ */
            <div className="p-4 space-y-4">
              {/* Object Properties */}
              <div className="space-y-2">
                <h4 className="terminal-text-sm text-[var(--color-text-muted)]">Object Data</h4>
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] clip-corner-tl">
                  <div className="grid grid-cols-[100px_1fr] text-[12px]">
                    <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                      Type
                    </div>
                    <div className="px-3 py-2 text-[var(--color-text-secondary)] font-mono border-b border-[var(--color-border)]">
                      {poi.type}
                    </div>

                    <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                      Category
                    </div>
                    <div className="px-3 py-2 border-b border-[var(--color-border)]">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                        style={{ color: cat?.color || '#888', backgroundColor: `${cat?.color || '#888'}15` }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#888' }} />
                        {cat?.label || poi.cat}
                      </span>
                    </div>

                    {poi.sub && (
                      <>
                        <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                          Sub-Type
                        </div>
                        <div className="px-3 py-2 text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                          {poi.sub}
                        </div>
                      </>
                    )}

                    <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                      Zone
                    </div>
                    <div className="px-3 py-2 text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                      {zoneName}
                    </div>

                    <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                      Coords
                    </div>
                    <div className="px-3 py-2 text-[var(--color-text-secondary)] font-mono border-b border-[var(--color-border)]">
                      X: {Math.round(poi.px)} &nbsp; Y: {Math.round(poi.py)}
                    </div>

                    <div className="px-3 py-2 text-[var(--color-text-muted)] font-mono uppercase bg-[var(--color-surface)]/50">
                      Layer
                    </div>
                    <div className="px-3 py-2 text-[var(--color-text-secondary)]">
                      {poi.layer === 0 ? 'Surface' : `Underground (${poi.layer})`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <h4 className="terminal-text-sm text-[var(--color-text-muted)]">Status</h4>
                <div className={`flex items-center gap-3 p-3 border clip-corner-tl ${
                  isCompleted
                    ? 'bg-green-900/10 border-green-800/50'
                    : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center border ${
                    isCompleted
                      ? 'border-green-600 bg-green-900/30 text-green-400'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-3 h-3 border border-[var(--color-text-muted)]" />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-[var(--color-text-secondary)]'}`}>
                      {isCompleted ? 'Collected' : 'Not Collected'}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      {isCompleted ? 'This object has been marked as complete' : 'Click the button above to mark as complete'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="space-y-2">
                <h4 className="terminal-text-sm text-[var(--color-text-muted)]">Community Notes</h4>
                <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3 clip-corner-tl">
                  {comments.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                        {comments[0].text}
                      </div>
                      <button
                        onClick={() => setActiveTab('comments')}
                        className="text-[11px] text-[var(--color-accent)] hover:underline font-mono uppercase"
                      >
                        View all {commentCount} comments &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="text-[12px] text-[var(--color-text-muted)] italic">
                      No community notes yet. Be the first to share tips about this location.
                    </div>
                  )}
                </div>
              </div>

              {/* ID reference */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] select-all break-all">
                  OBJECT_ID: {poi.id}
                </span>
              </div>
            </div>
          ) : (
            /* ═══ COMMENTS TAB ═══ */
            <div className="flex flex-col h-full">
              {/* Comment Composer */}
              <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                <div className="relative">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment();
                    }}
                    placeholder={user ? 'Share a tip about this location...' : 'Log in to leave a comment'}
                    disabled={!user}
                    rows={3}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none px-3 py-2 text-[13px] text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] resize-none transition-colors disabled:opacity-50"
                  />
                  {/* Formatting toolbar */}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        className="w-6 h-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                        title="Bold"
                        onClick={() => setCommentText(prev => prev + '**text**')}
                      >
                        <Bold size={12} />
                      </button>
                      <button
                        className="w-6 h-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                        title="Italic"
                        onClick={() => setCommentText(prev => prev + '*text*')}
                      >
                        <Italic size={12} />
                      </button>
                      <div className="w-px h-4 bg-[var(--color-border)] mx-0.5" />
                      <button
                        className="w-6 h-6 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                        title="Attach screenshot"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={12} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    <button
                      onClick={addComment}
                      disabled={!commentText.trim() || !user}
                      className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Send size={11} />
                      Post
                    </button>
                  </div>

                  {/* Uploaded image previews */}
                  {uploadedImages.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-[var(--color-border)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Uploaded photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeUploadedImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!user && (
                  <div className="mt-2 text-[11px] text-[var(--color-text-muted)] italic">
                    <a href="/login" className="text-[var(--color-accent)] hover:underline">Log in</a> to post comments and upload screenshots
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {comments.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
                    <div className="text-[13px] text-[var(--color-text-muted)]">No comments yet</div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                      Be the first to share tips about this location
                    </div>
                  </div>
                ) : (
                  <div>
                    {comments.map(comment => (
                      <div key={comment.id} className="border-b border-[var(--color-border)] last:border-b-0">
                        <div className="p-3">
                          {/* Pinned badge */}
                          {comment.isPinned && (
                            <div className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] font-mono uppercase mb-1.5">
                              <MapPin size={10} />
                              Pinned
                            </div>
                          )}

                          {/* Author & Time */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
                              {comment.author[0]}
                            </div>
                            <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">
                              {comment.author}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-mono flex items-center gap-1">
                              <Clock size={9} />
                              {timeAgo(comment.createdAt)}
                            </span>
                          </div>

                          {/* Comment Text */}
                          <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed pl-8">
                            {comment.text}
                          </div>

                          {/* Screenshots */}
                          {comment.screenshots.length > 0 && (
                            <div className="pl-8 mt-2">
                              <button
                                onClick={() => toggleScreenshot(comment.id)}
                                className="flex items-center gap-1 text-[11px] text-[var(--color-accent)] hover:underline font-mono"
                              >
                                <ImageIcon size={11} />
                                {comment.screenshots.length} screenshot{comment.screenshots.length > 1 ? 's' : ''}
                                {showScreenshots.has(comment.id) ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              </button>
                              {showScreenshots.has(comment.id) && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {comment.screenshots.map((src, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setScreenshotPreview(src)}
                                      className="w-24 h-24 border border-[var(--color-border)] hover:border-[var(--color-accent)] overflow-hidden transition-colors"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={src} alt={`Community screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions Row */}
                          <div className="flex items-center gap-3 pl-8 mt-2">
                            {/* Upvote */}
                            <button
                              onClick={() => voteComment(comment.id, 'up')}
                              className={`flex items-center gap-1 text-[11px] transition-colors ${
                                comment.userVote === 'up'
                                  ? 'text-green-400'
                                  : 'text-[var(--color-text-muted)] hover:text-green-400'
                              }`}
                            >
                              <ThumbsUp size={12} />
                              <span>{comment.upvotes}</span>
                            </button>

                            {/* Downvote */}
                            <button
                              onClick={() => voteComment(comment.id, 'down')}
                              className={`flex items-center gap-1 text-[11px] transition-colors ${
                                comment.userVote === 'down'
                                  ? 'text-red-400'
                                  : 'text-[var(--color-text-muted)] hover:text-red-400'
                              }`}
                            >
                              <ThumbsDown size={12} />
                              <span>{comment.downvotes}</span>
                            </button>

                            {/* Reply */}
                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                            >
                              <Reply size={12} />
                              Reply
                            </button>

                            {/* Report */}
                            <button className="ml-auto text-[var(--color-text-muted)] hover:text-red-400 transition-colors">
                              <Flag size={11} />
                            </button>
                          </div>

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <div className="pl-8 mt-2">
                              <div className="flex gap-2 items-end">
                                <div className="flex-1 relative">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addReply(comment.id);
                                    }}
                                    placeholder="Write a reply..."
                                    rows={2}
                                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none px-2.5 py-1.5 text-[12px] text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] resize-none transition-colors"
                                    autoFocus
                                  />
                                </div>
                                <button
                                  onClick={() => addReply(comment.id)}
                                  disabled={!replyText.trim()}
                                  className="shrink-0 w-7 h-7 flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/20 transition-colors disabled:opacity-30"
                                >
                                  <Send size={12} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <div className="pl-8 mt-2">
                              <button
                                onClick={() => toggleReplies(comment.id)}
                                className="flex items-center gap-1 text-[11px] text-[var(--color-accent)] hover:underline font-mono"
                              >
                                <CornerDownRight size={11} />
                                {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                                {expandedReplies.has(comment.id) ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                              </button>

                              {expandedReplies.has(comment.id) && (
                                <div className="mt-2 space-y-2 border-l-2 border-[var(--color-border)] pl-3">
                                  {comment.replies.map(reply => (
                                    <div key={reply.id} className="py-1.5">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="w-5 h-5 bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-center text-[9px] font-bold text-[var(--color-text-secondary)] uppercase">
                                          {reply.author[0]}
                                        </div>
                                        <span className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                                          {reply.author}
                                        </span>
                                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                                          {timeAgo(reply.createdAt)}
                                        </span>
                                      </div>
                                      <div className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed pl-[26px]">
                                        {reply.text}
                                      </div>
                                      <div className="flex items-center gap-2 pl-[26px] mt-1">
                                        <button className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-green-400 transition-colors">
                                          <ThumbsUp size={10} />
                                          <span>{reply.upvotes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {screenshotPreview && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setScreenshotPreview(null)}
        >
          <div className="relative max-w-3xl max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotPreview} alt="Screenshot preview" className="max-w-full max-h-[80vh] object-contain border-2 border-[var(--color-border)]" />
            <button
              onClick={() => setScreenshotPreview(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 border border-[var(--color-border)] flex items-center justify-center text-white hover:border-[var(--color-accent)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
