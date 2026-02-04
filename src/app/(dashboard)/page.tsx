'use client';

import { useEffect, useState, useCallback } from 'react';
import { FeedCard } from '@/components/feed/feed-card';
import { Loader2 } from 'lucide-react';
import { CallWithDetails } from '@/types';

export default function FeedPage() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCalls = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const res = await fetch(`/api/feed?page=${pageNum}`);
      const data = await res.json();

      if (append) {
        setCalls((prev) => [...prev, ...data.calls]);
      } else {
        setCalls(data.calls);
      }

      setHasMore(data.has_more);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls(1);
  }, [loadCalls]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCalls(nextPage, true);
  };

  const handleReactionToggle = async (
    callId: string,
    reactionType: 'fire' | 'clap' | 'lightbulb' | 'star'
  ) => {
    try {
      const res = await fetch('/api/feed/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, reactionType }),
      });

      const data = await res.json();

      // Update local state
      setCalls((prev) =>
        prev.map((call) => {
          if (call.id !== callId) return call;

          const existingReaction = call.reactions.find(
            (r) => r.type === reactionType
          );

          if (existingReaction) {
            return {
              ...call,
              reactions: call.reactions.map((r) =>
                r.type === reactionType
                  ? {
                      ...r,
                      count: data.added ? r.count + 1 : r.count - 1,
                      user_reacted: data.added,
                    }
                  : r
              ),
            };
          } else if (data.added) {
            return {
              ...call,
              reactions: [
                ...call.reactions,
                { type: reactionType, count: 1, user_reacted: true },
              ],
            };
          }

          return call;
        })
      );
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Team Activity</h1>
        <p className="text-muted-foreground">
          See how your team is doing with their practice calls
        </p>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No calls yet. Be the first to start a practice call!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <FeedCard
              key={call.id}
              call={call}
              onReactionToggle={handleReactionToggle}
            />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
