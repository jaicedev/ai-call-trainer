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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface UserWithStats {
  id: string;
  email: string;
  name: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
  role: UserRole;
  created_at: string;
  total_calls: number;
  average_score: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        throw new Error('Failed to update user role');
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole, is_admin: newRole === 'admin' }
            : u
        )
      );

      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Calls</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : user.email[0].toUpperCase();

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile_picture_url || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || (user.is_admin ? 'admin' : 'advisor')}
                      onValueChange={(value: UserRole) =>
                        updateUserRole(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <Badge>Admin</Badge>
                        </SelectItem>
                        <SelectItem value="advisor">
                          <Badge variant="secondary">Advisor</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.total_calls}</TableCell>
                  <TableCell>
                    {user.average_score > 0
                      ? user.average_score.toFixed(1)
                      : '-'}
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
