import { useEffect, useState } from 'react';
import { statsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DashboardStats } from '@shared/types';

export default function SuperviseurDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workflowStats, setWorkflowStats] = useState<{
    workflow: Record<string, number>;
    monthlyData: Record<string, { agents: number; licenses: number }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, workflowRes] = await Promise.all([
          statsApi.overview(),
          statsApi.workflow()
        ]);
        
        if (overviewRes.success && overviewRes.data) {
          setStats(overviewRes.data);
        }
        if (workflowRes.success && workflowRes.data) {
          setWorkflowStats(workflowRes.data);
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

  const workflowData = workflowStats?.workflow ? [
    { name: 'En attente', value: workflowStats.workflow.enAttente || 0, color: '#f59e0b' },
    { name: 'Docs soumis', value: workflowStats.workflow.documentsSoumis || 0, color: '#3b82f6' },
    { name: 'QIP valides', value: workflowStats.workflow.qipValides || 0, color: '#22c55e' },
    { name: 'QIP rejetes', value: workflowStats.workflow.qipRejetes || 0, color: '#ef4444' },
    { name: 'Licences actives', value: workflowStats.workflow.licencesActives || 0, color: '#10b981' },
  ] : [];

  const monthlyDataArray = workflowStats?.monthlyData 
    ? Object.entries(workflowStats.monthlyData).map(([month, data]) => ({
        month: month.slice(5),
        agents: data.agents,
        licenses: data.licenses
      })).slice(-6)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Supervision
        </h1>
        <p className="text-muted-foreground">
          Vue globale du workflow et des statistiques
        </p>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Agents enregistres
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
              En attente de verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licences Actives</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.licencesActives || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Actuellement valides
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licences Expirees</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.licencesExpirees || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              A renouveler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workflow status */}
        <Card>
          <CardHeader>
            <CardTitle>Etat du workflow</CardTitle>
            <CardDescription>Repartition des agents par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workflowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {workflowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {workflowData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly trend */}
        <Card>
          <CardHeader>
            <CardTitle>Evolution mensuelle</CardTitle>
            <CardDescription>Nouveaux agents et licences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDataArray}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="agents" fill="#3b82f6" name="Agents" />
                  <Bar dataKey="licenses" fill="#22c55e" name="Licences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Repartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats?.agentsParStatus && Object.entries(stats.agentsParStatus).map(([status, count]) => (
              <div 
                key={status}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {status.includes('VALIDE') || status.includes('ACTIVE') ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : status.includes('REJETE') || status.includes('SUSPENDUE') ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
