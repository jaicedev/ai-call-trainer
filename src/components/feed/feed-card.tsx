'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Flame,
  Hand,
  Lightbulb,
  Star,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CallWithDetails, ReactionType } from '@/types';
import { FeedComments } from './feed-comments';
import { AudioPlayer } from '@/components/ui/audio-player';

interface FeedCardProps {
  call: CallWithDetails;
  onReactionToggle: (callId: string, reactionType: ReactionType) => void;
}

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

const scoreColors = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
};

const reactionIcons = {
  fire: Flame,
  clap: Hand,
  lightbulb: Lightbulb,
  star: Star,
};

const reactionLabels = {
  fire: 'Fire',
  clap: 'Applause',
  lightbulb: 'Insightful',
  star: 'Star',
};

export function FeedCard({ call, onReactionToggle }: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return scoreColors.high;
    if (score >= 60) return scoreColors.medium;
    return scoreColors.low;
  };

  const initials = call.user.name
    ? call.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={call.user.profile_picture_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{call.user.name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">
                practiced with{' '}
                <span className="font-medium">{call.persona?.name || call.dynamic_persona_name || 'Dynamic Persona'}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              className={cn(
                'text-xs',
                difficultyColors[(call.persona?.difficulty_level || call.dynamic_persona_difficulty || 1) as keyof typeof difficultyColors]
              )}
            >
              Level {call.persona?.difficulty_level || call.dynamic_persona_difficulty || 1}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(call.created_at)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score and Duration */}
        <div className="flex items-center gap-4">
          {call.score && (
            <div>
              <span
                className={cn(
                  'text-3xl font-bold',
                  getScoreColor(call.score.overall_score)
                )}
              >
                {call.score.overall_score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {formatDuration(call.duration_seconds)}
          </div>
        </div>

        {/* Audio Player */}
        {call.recording_url && (
          <AudioPlayer src={call.recording_url} compact />
        )}

        {/* Expanded Score Details */}
        {expanded && call.score && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ScoreItem label="Tone" score={call.score.tone_score} />
              <ScoreItem
                label="Product Knowledge"
                score={call.score.product_knowledge_score}
              />
              <ScoreItem
                label="Objection Handling"
                score={call.score.objection_handling_score}
              />
              <ScoreItem
                label="Rapport Building"
                score={call.score.rapport_building_score}
              />
              <ScoreItem
                label="Closing Technique"
                score={call.score.closing_technique_score}
              />
            </div>

            {call.score.ai_feedback && (
              <div className="mt-3 p-3 bg-zinc-50 rounded-lg text-sm">
                <p className="font-medium mb-1">AI Feedback</p>
                <p className="text-muted-foreground">{call.score.ai_feedback}</p>
              </div>
            )}

            {call.score.strengths.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-green-600 mb-1">Strengths:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {call.score.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {call.score.improvements.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-orange-600 mb-1">
                  Areas to Improve:
                </p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {call.score.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        {call.score && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show Details
              </>
            )}
          </Button>
        )}

        {/* Admin Review Feedback */}
        {call.review && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-full">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                    <Award className="h-3 w-3 mr-1" />
                    Admin Review
                  </Badge>
                  {call.review.rating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                          key={num}
                          className={cn(
                            'h-3 w-3',
                            num <= call.review!.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-purple-900">{call.review.feedback}</p>
                {call.review.reviewer && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-purple-600">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={call.review.reviewer.profile_picture_url || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {call.review.reviewer.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      Reviewed by {call.review.reviewer.name || 'Admin'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {(['fire', 'clap', 'lightbulb', 'star'] as ReactionType[]).map(
            (type) => {
              const Icon = reactionIcons[type];
              const reaction = call.reactions.find((r) => r.type === type);
              const count = reaction?.count || 0;
              const userReacted = reaction?.user_reacted || false;

              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => onReactionToggle(call.id, type)}
                  className={cn(
                    'gap-1',
                    userReacted && 'text-primary bg-primary/10'
                  )}
                  title={reactionLabels[type]}
                >
                  <Icon className="h-4 w-4" />
                  {count > 0 && <span className="text-xs">{count}</span>}
                </Button>
              );
            }
          )}

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            {call.comments_count > 0 && (
              <span className="text-xs">{call.comments_count}</span>
            )}
          </Button>
        </div>

        {/* Comments */}
        {showComments && <FeedComments callId={call.id} />}
      </CardContent>
    </Card>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
