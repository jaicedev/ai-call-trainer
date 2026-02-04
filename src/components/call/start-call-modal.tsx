'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Persona {
  id: string;
  name: string;
  description: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
}

interface StartCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const difficultyColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-lime-100 text-lime-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  1: 'Easy',
  2: 'Moderate',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert',
};

export function StartCallModal({
  open,
  onOpenChange,
  userId,
}: StartCallModalProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (open) {
      loadPersonas();
    }
  }, [open]);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/personas');
      const data = await res.json();
      setPersonas(data.personas || []);
    } catch (err) {
      console.error('Failed to load personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!selectedPersona) return;

    setStarting(true);
    try {
      const res = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: selectedPersona }),
      });

      const data = await res.json();

      if (data.callId) {
        // Navigate to call page or open call interface
        window.location.href = `/call/${data.callId}`;
      }
    } catch (err) {
      console.error('Failed to start call:', err);
    } finally {
      setStarting(false);
    }
  };

  const selected = personas.find((p) => p.id === selectedPersona);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start a Practice Call</DialogTitle>
          <DialogDescription>
            Select a prospect persona to practice your pitch with
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors',
                    selectedPersona === persona.id
                      ? 'border-zinc-900 bg-zinc-50'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">{persona.name}</span>
                    <Badge
                      className={cn(
                        'text-xs',
                        difficultyColors[persona.difficulty_level]
                      )}
                    >
                      {difficultyLabels[persona.difficulty_level]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {persona.description}
                  </p>
                </button>
              ))}
            </div>

            {selected && (
              <div className="rounded-lg bg-zinc-50 p-4">
                <h4 className="font-medium mb-2">Selected: {selected.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selected.description}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartCall}
                disabled={!selectedPersona || starting}
              >
                {starting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Call
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
