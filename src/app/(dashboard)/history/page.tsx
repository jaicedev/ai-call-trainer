'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Play, ChevronDown, ChevronUp, Building2, MapPin, Phone, Mail, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CallWithDetails } from '@/types';
import { AudioPlayer } from '@/components/ui/audio-player';

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

export default function HistoryPage() {
  const [calls, setCalls] = useState<CallWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'date' | 'score' | 'duration'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    console.log('[History Client] Starting call history load...');
    try {
      const res = await fetch('/api/calls/history');
      console.log('[History Client] API response status:', res.status);

      const data = await res.json();
      console.log('[History Client] API response data:', {
        callCount: data.calls?.length ?? 0,
        firstCall: data.calls?.[0] ? { id: data.calls[0].id, ended_at: data.calls[0].ended_at } : null,
        error: data.error
      });

      if (data.error) {
        console.error('[History Client] API returned error:', data.error);
      }

      setCalls(data.calls || []);
    } catch (err) {
      console.error('[History Client] Failed to load history:', err);
    } finally {
      setLoading(false);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedCalls = [...calls].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'score':
        comparison = (a.score?.overall_score || 0) - (b.score?.overall_score || 0);
        break;
      case 'duration':
        comparison = a.duration_seconds - b.duration_seconds;
        break;
    }
    return sortDir === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'date' | 'score' | 'duration') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Call History</h1>
        <p className="text-muted-foreground">Review your past practice calls</p>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No calls yet. Start a practice call to see your history!
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort('date')}
                >
                  Date{' '}
                  {sortField === 'date' &&
                    (sortDir === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Business</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort('score')}
                >
                  Score{' '}
                  {sortField === 'score' &&
                    (sortDir === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort('duration')}
                >
                  Duration{' '}
                  {sortField === 'duration' &&
                    (sortDir === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCalls.map((call) => (
                <>
                  <TableRow
                    key={call.id}
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === call.id ? null : call.id)
                    }
                  >
                    <TableCell>{formatDate(call.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {call.persona?.name || call.dynamic_persona_name || 'Unknown'}
                        <Badge
                          className={cn(
                            'text-xs',
                            difficultyColors[(call.persona?.difficulty_level || call.dynamic_persona_difficulty || 1) as keyof typeof difficultyColors]
                          )}
                        >
                          L{call.persona?.difficulty_level || call.dynamic_persona_difficulty || 1}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {call.mock_business_name ? (
                        <div className="max-w-[200px]">
                          <div className="font-medium text-sm truncate">{call.mock_business_name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {call.mock_business_state && call.mock_business_industry
                              ? `${call.mock_business_industry} • ${call.mock_business_state}`
                              : call.mock_business_state || call.mock_business_industry || ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.score ? (
                        <span
                          className={cn(
                            'font-bold',
                            getScoreColor(call.score.overall_score)
                          )}
                        >
                          {call.score.overall_score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        {expandedId === call.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === call.id && (call.score || call.recording_url) && (
                    <TableRow key={`${call.id}-details`}>
                      <TableCell colSpan={6} className="bg-zinc-50">
                        <div className="p-4 space-y-4">
                          {/* Mock Business Details */}
                          {call.mock_business_name && (
                            <div className="rounded-lg border bg-white p-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-zinc-500" />
                                Business Details
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground block text-xs mb-1">Business Name</span>
                                  <span className="font-medium">{call.mock_business_name}</span>
                                </div>
                                {call.mock_business_industry && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Industry</span>
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                                      {call.mock_business_industry}
                                    </span>
                                  </div>
                                )}
                                {call.mock_business_state && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs mb-1">State</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                      {call.mock_business_state}
                                    </span>
                                  </div>
                                )}
                                {call.mock_business_phone && (
                                  <div>
                                    <span className="text-muted-foreground block text-xs mb-1">Phone</span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                      {call.mock_business_phone}
                                    </span>
                                  </div>
                                )}
                                {call.mock_business_email && (
                                  <div className="col-span-2">
                                    <span className="text-muted-foreground block text-xs mb-1">Email</span>
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                      {call.mock_business_email}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Audio Player */}
                          {call.recording_url && (
                            <div>
                              <h4 className="font-medium mb-2">Recording</h4>
                              <AudioPlayer src={call.recording_url} />
                            </div>
                          )}

                          {/* Score Breakdown */}
                          {call.score && (
                            <>
                              <div className="grid grid-cols-5 gap-4">
                                <ScoreBox
                                  label="Tone"
                                  score={call.score.tone_score}
                                />
                                <ScoreBox
                                  label="Product Knowledge"
                                  score={call.score.product_knowledge_score}
                                />
                                <ScoreBox
                                  label="Objection Handling"
                                  score={call.score.objection_handling_score}
                                />
                                <ScoreBox
                                  label="Rapport Building"
                                  score={call.score.rapport_building_score}
                                />
                                <ScoreBox
                                  label="Closing"
                                  score={call.score.closing_technique_score}
                                />
                              </div>

                              {/* AI Feedback */}
                              {call.score.ai_feedback && (
                                <div>
                                  <h4 className="font-medium mb-1">AI Feedback</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {call.score.ai_feedback}
                                  </p>
                                </div>
                              )}

                              {/* Strengths & Improvements */}
                              <div className="grid grid-cols-2 gap-4">
                                {call.score.strengths.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-green-600 mb-1">
                                      Strengths
                                    </h4>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {call.score.strengths.map((s, i) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {call.score.improvements.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-orange-600 mb-1">
                                      Areas to Improve
                                    </h4>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                                      {call.score.improvements.map((s, i) => (
                                        <li key={i}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Call Notes */}
                          {call.call_notes && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <h4 className="font-medium text-amber-800 mb-1">Call Notes</h4>
                              <p className="text-sm text-amber-900 whitespace-pre-wrap">{call.call_notes}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ScoreBox({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (s >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  return (
    <div className={cn('rounded-lg border p-3 text-center', getColor(score))}>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
