'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AudioPlayer } from '@/components/ui/audio-player';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Send,
  User,
  Target,
  Clock,
  BarChart3,
  MessageSquare,
  Star,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { CallForReview, CallScore } from '@/types';
import { cn } from '@/lib/utils';

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

function ReviewWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callIdParam = searchParams.get('callId');

  const [call, setCall] = useState<CallForReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [postToFeed, setPostToFeed] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  const loadCall = useCallback(async () => {
    setLoading(true);
    try {
      const url = callIdParam
        ? `/api/admin/review-queue/${callIdParam}`
        : '/api/admin/review-queue/next';
      const res = await fetch(url);
      const data = await res.json();

      if (data.call) {
        setCall(data.call);
        // Reset form
        setFeedback('');
        setNotes('');
        setRating(null);
        setPostToFeed(true);
      } else {
        setCall(null);
      }
    } catch (err) {
      console.error('Failed to load call:', err);
      setCall(null);
    } finally {
      setLoading(false);
    }
  }, [callIdParam]);

  useEffect(() => {
    loadCall();
  }, [loadCall]);

  const handleSubmit = async () => {
    if (!call || !feedback.trim()) {
      toast.error('Please provide feedback');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/review-queue/${call.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          notes: notes.trim() || undefined,
          rating: rating || undefined,
          postToFeed,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      toast.success('Review submitted successfully');

      // Load next call or go back to queue
      if (callIdParam) {
        router.push('/admin/review-queue');
      } else {
        loadCall();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    loadCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground mb-4">
              There are no more calls to review at the moment.
            </p>
            <Button onClick={() => router.push('/admin/review-queue')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = call.user?.name
    ? call.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const difficulty = call.persona?.difficulty_level || call.dynamic_persona_difficulty || 1;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/review-queue')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Queue
        </Button>
        {!callIdParam && (
          <Button variant="outline" onClick={handleSkip}>
            Skip
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Call Details */}
        <div className="space-y-6">
          {/* Advisor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={call.user?.profile_picture_url || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">{call.user?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    Call on {formatDate(call.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Persona Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Persona / Fake Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-lg">
                  {call.persona?.name || call.dynamic_persona_name || 'Dynamic Persona'}
                </span>
                <Badge
                  className={
                    difficultyColors[difficulty as keyof typeof difficultyColors]
                  }
                >
                  Difficulty {difficulty}
                </Badge>
              </div>
              {(call.persona?.description || call.dynamic_persona_description) && (
                <p className="text-muted-foreground">
                  {call.persona?.description || call.dynamic_persona_description}
                </p>
              )}
              {call.persona?.personality_prompt && (
                <div className="mt-2 p-3 bg-zinc-50 rounded-lg text-sm">
                  <p className="font-medium mb-1">Personality Prompt</p>
                  <p className="text-muted-foreground text-xs">
                    {call.persona.personality_prompt}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Call Stats & AI Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(call.duration_seconds)}</span>
                </div>
                {call.score && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Score:</span>
                    <span
                      className={cn(
                        'text-xl font-bold',
                        call.score.overall_score >= 80
                          ? 'text-green-600'
                          : call.score.overall_score >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      )}
                    >
                      {call.score.overall_score}/100
                    </span>
                  </div>
                )}
              </div>

              {call.score && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <ScoreBar label="Tone" score={call.score.tone_score} />
                    <ScoreBar label="Product Knowledge" score={call.score.product_knowledge_score} />
                    <ScoreBar label="Objection Handling" score={call.score.objection_handling_score} />
                    <ScoreBar label="Rapport Building" score={call.score.rapport_building_score} />
                    <ScoreBar label="Closing Technique" score={call.score.closing_technique_score} />
                  </div>

                  {call.score.ai_feedback && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800 mb-1">AI Feedback</p>
                      <p className="text-sm text-blue-700">{call.score.ai_feedback}</p>
                    </div>
                  )}

                  {call.score.strengths && call.score.strengths.length > 0 && (
                    <div>
                      <p className="font-medium text-green-700 mb-1">Strengths</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {call.score.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {call.score.improvements && call.score.improvements.length > 0 && (
                    <div>
                      <p className="font-medium text-orange-700 mb-1">Areas to Improve</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {call.score.improvements.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recording */}
          {call.recording_url && (
            <Card>
              <CardHeader>
                <CardTitle>Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <AudioPlayer src={call.recording_url} />
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          {call.transcript && call.transcript.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Transcript
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTranscript(!showTranscript)}
                  >
                    {showTranscript ? 'Hide' : 'Show'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showTranscript && (
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {call.transcript.map((entry, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-lg',
                          entry.role === 'user'
                            ? 'bg-blue-50 ml-4'
                            : 'bg-zinc-50 mr-4'
                        )}
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {entry.role === 'user' ? 'Advisor' : 'Persona'}
                        </p>
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Review Form */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Submit Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="mb-2 block">Rating (Optional)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={rating === num ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setRating(rating === num ? null : num)}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          rating && num <= rating ? 'fill-current' : ''
                        )}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <Label htmlFor="feedback" className="mb-2 block">
                  Feedback <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide constructive feedback for the advisor..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This feedback will be shared with the advisor
                  {postToFeed && ' and posted to the team feed'}.
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Private Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Internal notes for admin reference only..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These notes are only visible to admins.
                </p>
              </div>

              {/* Post to Feed Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="postToFeed"
                  checked={postToFeed}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setPostToFeed(checked === true)}
                />
                <Label htmlFor="postToFeed" className="text-sm">
                  Post feedback as a comment on the team feed
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !feedback.trim()}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Review & Continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between mb-1 text-sm">
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

export default function ReviewWorkflowPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ReviewWorkflowContent />
    </Suspense>
  );
}
