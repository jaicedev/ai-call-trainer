'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, Loader2, Shuffle, Users, Sparkles } from 'lucide-react';
import { useCallStore, Persona } from '@/stores/call-store';
import { generateDynamicPersona } from '@/lib/dynamic-persona';

interface StartCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartCallModal({
  open,
  onOpenChange,
}: StartCallModalProps) {
  const [starting, setStarting] = useState(false);

  const { startDialing } = useCallStore();

  const handleStartCall = async () => {
    setStarting(true);
    try {
      // Generate a dynamic persona
      const dynamicPersona = generateDynamicPersona();

      const res = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dynamicPersona: true,
          personaName: dynamicPersona.name,
          personaDescription: dynamicPersona.description,
          difficulty: dynamicPersona.difficulty_level
        }),
      });

      const data = await res.json();

      if (data.callId) {
        // Convert dynamic persona to the Persona format for the store
        const persona: Persona = {
          id: dynamicPersona.id,
          name: dynamicPersona.name,
          description: dynamicPersona.description,
          personality_prompt: dynamicPersona.personality_prompt,
          difficulty_level: dynamicPersona.difficulty_level,
          voice: dynamicPersona.voice,
          isDynamic: true,
        };
        startDialing(data.callId, persona, dynamicPersona);
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Failed to start call:', err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Practice Call</DialogTitle>
          <DialogDescription>
            Practice your sales pitch with a dynamically generated prospect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dynamic Persona Info */}
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              <Shuffle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Dynamic Prospect Generation
            </h3>
            <p className="text-sm text-zinc-600 mb-4">
              Each call features a unique AI-generated prospect with randomized:
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/60 p-3">
                <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <span className="text-xs text-zinc-600">Personality</span>
              </div>
              <div className="rounded-lg bg-white/60 p-3">
                <Sparkles className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs text-zinc-600">Voice</span>
              </div>
              <div className="rounded-lg bg-white/60 p-3">
                <Phone className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <span className="text-xs text-zinc-600">Business</span>
              </div>
            </div>
          </div>

          {/* Mystery element */}
          <div className="text-center text-sm text-zinc-500">
            The prospect&apos;s personality will be revealed after the call ends
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartCall}
              disabled={starting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
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
      </DialogContent>
    </Dialog>
  );
}
