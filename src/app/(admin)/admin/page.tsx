'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, Users, TrendingUp, Award, BarChart3, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DifficultyItem {
  level: number;
  label: string;
  count: number;
  percentage: number;
}

interface IndustryItem {
  industry: string;
  count: number;
  percentage: number;
}

interface Analytics {
  total_calls_this_week: number;
  total_calls_this_month: number;
  average_score: number;
  total_users: number;
  active_users_this_week: number;
  top_performers: {
    name: string;
    email: string;
    average_score: number;
    call_count: number;
  }[];
  total_dynamic_calls: number;
  difficulty_distribution: DifficultyItem[];
  industry_distribution: IndustryItem[];
}

const difficultyColors: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-lime-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of training activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calls This Week
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.total_calls_this_week}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calls This Month
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.total_calls_this_month}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.average_score.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.active_users_this_week} / {analytics.total_users}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers - Full Width */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.top_performers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {analytics.top_performers.map((user, i) => (
                <div key={user.email} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.call_count} calls
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {user.average_score.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-8">
        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.difficulty_distribution.every(d => d.count === 0) ? (
              <p className="text-sm text-muted-foreground">No calls yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.difficulty_distribution.map((item) => (
                  <div key={item.level} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        Level {item.level} - {item.label}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', difficultyColors[item.level])}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.industry_distribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calls yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.industry_distribution.map((item) => (
                  <div key={item.industry} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]">
                        {item.industry}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
