'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Persona } from '@/types';

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

export default function AdminPersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const res = await fetch('/api/admin/personas');
      const data = await res.json();
      setPersonas(data.personas || []);
    } catch (err) {
      console.error('Failed to load personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPersona(null);
    setName('');
    setDescription('');
    setPersonalityPrompt('');
    setDifficultyLevel(3);
    setIsActive(true);
    setShowDialog(true);
  };

  const openEditDialog = (persona: Persona) => {
    setEditingPersona(persona);
    setName(persona.name);
    setDescription(persona.description);
    setPersonalityPrompt(persona.personality_prompt);
    setDifficultyLevel(persona.difficulty_level);
    setIsActive(persona.is_active);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!name || !description || !personalityPrompt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const endpoint = editingPersona
        ? `/api/admin/personas/${editingPersona.id}`
        : '/api/admin/personas';

      const method = editingPersona ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          personality_prompt: personalityPrompt,
          difficulty_level: difficultyLevel,
          is_active: isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      if (editingPersona) {
        setPersonas((prev) =>
          prev.map((p) => (p.id === data.persona.id ? data.persona : p))
        );
        toast.success('Persona updated');
      } else {
        setPersonas((prev) => [data.persona, ...prev]);
        toast.success('Persona created');
      }

      setShowDialog(false);
    } catch {
      toast.error('Failed to save persona');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (persona: Persona) => {
    try {
      const res = await fetch(`/api/admin/personas/${persona.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !persona.is_active }),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      setPersonas((prev) =>
        prev.map((p) =>
          p.id === persona.id ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast.success(persona.is_active ? 'Persona deactivated' : 'Persona activated');
    } catch {
      toast.error('Failed to update persona');
    }
  };

  const deletePersona = async (persona: Persona) => {
    if (!confirm(`Are you sure you want to delete "${persona.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/personas/${persona.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      setPersonas((prev) => prev.filter((p) => p.id !== persona.id));
      toast.success('Persona deleted');
    } catch {
      toast.error('Failed to delete persona');
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Personas</h1>
          <p className="text-muted-foreground">
            Manage AI prospect personas for training
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPersona ? 'Edit Persona' : 'Create Persona'}
              </DialogTitle>
              <DialogDescription>
                Define a prospect persona for sales training
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Skeptical Steve"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description shown to users"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Personality Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={personalityPrompt}
                  onChange={(e) => setPersonalityPrompt(e.target.value)}
                  placeholder="Detailed instructions for the AI..."
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt defines how the AI will behave during calls
                </p>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={difficultyLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficultyLevel(level)}
                    >
                      {level} - {difficultyLabels[level]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <Label htmlFor="active">Active (visible to users)</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingPersona ? (
                    'Update'
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {personas.map((persona) => (
          <Card
            key={persona.id}
            className={cn(!persona.is_active && 'opacity-60')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {persona.name}
                    <Badge
                      className={cn(
                        'text-xs',
                        difficultyColors[persona.difficulty_level]
                      )}
                    >
                      {difficultyLabels[persona.difficulty_level]}
                    </Badge>
                    {!persona.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{persona.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(persona)}
                    title={persona.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {persona.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(persona)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePersona(persona)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-3">{persona.personality_prompt}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
