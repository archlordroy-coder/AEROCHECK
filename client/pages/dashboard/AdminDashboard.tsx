import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  CreditCard,
  Settings,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';
import { ROLE_LABELS, type Role } from '@shared/types';
import type { DashboardStats, User } from '@shared/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<{
    totalUsers: number;
    usersParRole: Record<string, number>;
    recentUsers: User[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, usersRes] = await Promise.all([
          statsApi.overview(),
          statsApi.users()
        ]);
        
        if (overviewRes.success && overviewRes.data) {
          setStats(overviewRes.data);
        }
        if (usersRes.success && usersRes.data) {
          setUserStats(usersRes.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Gestion du systeme et des utilisateurs
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Gerer les utilisateurs
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Comptes actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Profils agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.documentsEnAttente || 0}</div>
            <p className="text-xs text-muted-foreground">
              En attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licences</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.licencesActives || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users by role */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs par role</CardTitle>
          <CardDescription>Repartition des comptes utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {userStats?.usersParRole && Object.entries(userStats.usersParRole).map(([role, count]) => (
              <div 
                key={role}
                className="flex flex-col items-center justify-center rounded-lg border p-4 text-center"
              >
                <div className="text-3xl font-bold text-primary">{count}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ROLE_LABELS[role as Role] || role}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion Utilisateurs
            </CardTitle>
            <CardDescription>
              Creer, modifier ou supprimer des comptes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/users">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Supervision
            </CardTitle>
            <CardDescription>
              Voir les statistiques detaillees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/supervision">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Verification QIP
            </CardTitle>
            <CardDescription>
              Verifier les documents en attente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/qip">
                Acceder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs recents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userStats?.recentUsers?.slice(0, 5).map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline">
                  {ROLE_LABELS[user.role]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
