'use client';

import { useEffect, useState, useCallback } from 'react';
import { FeedCard } from '@/components/feed/feed-card';
import { MiniLeaderboard } from '@/components/gamification/mini-leaderboard';
import { RecentAchievementsFeed } from '@/components/gamification/recent-achievements-feed';
import { Loader2 } from 'lucide-react';
import { CallWithDetails, LeaderboardEntry, Achievement, User } from '@/types';

interface LeaderboardData {
  topByXP: LeaderboardEntry[];
  recentAchievements: {
    user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
    achievement: Achievement;
    unlocked_at: string;
  }[];
}

export default function FeedPage() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadCalls = useCallback(async (pageNum: number, append: boolean = false) => {
    console.log('[Feed Client] Starting feed load...', { page: pageNum, append });
    try {
      const res = await fetch(`/api/feed?page=${pageNum}`);
      console.log('[Feed Client] API response status:', res.status);

      const data = await res.json();
      console.log('[Feed Client] API response data:', {
        callCount: data.calls?.length ?? 0,
        total: data.total,
        hasMore: data.has_more,
        firstCall: data.calls?.[0] ? { id: data.calls[0].id, ended_at: data.calls[0].ended_at } : null,
        error: data.error
      });

      if (data.error) {
        console.error('[Feed Client] API returned error:', data.error);
        return;
      }

      if (append) {
        setCalls((prev) => [...prev, ...data.calls]);
      } else {
        setCalls(data.calls || []);
      }

      setHasMore(data.has_more);
    } catch (err) {
      console.error('[Feed Client] Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls(1);

    // Fetch leaderboard data and current user for sidebar
    const fetchSidebarData = async () => {
      try {
        const [leaderboardRes, userRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/auth/me'),
        ]);

        if (leaderboardRes.ok) {
          const data = await leaderboardRes.json();
          setLeaderboardData(data);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    };

    fetchSidebarData();
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
    <div className="flex gap-6 py-8 px-4">
      {/* Main Feed */}
      <div className="flex-1">
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

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-80 shrink-0 space-y-4">
        {leaderboardData?.topByXP && leaderboardData.topByXP.length > 0 && (
          <MiniLeaderboard
            entries={leaderboardData.topByXP}
            currentUserId={currentUserId || undefined}
          />
        )}

        {leaderboardData?.recentAchievements && leaderboardData.recentAchievements.length > 0 && (
          <RecentAchievementsFeed
            achievements={leaderboardData.recentAchievements}
          />
        )}
      </aside>
    </div>
  );
}
