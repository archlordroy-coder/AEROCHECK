import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentsApi, licensesApi, statsApi, referencesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Award, 
  CheckCircle, 
  CreditCard,
  ArrowRight,
  Users,
  CheckSquare,
  FileCheck,
  Filter,
  Clock,
  FileText,
  XCircle
} from 'lucide-react';
import { AGENT_STATUS_LABELS, LICENSE_STATUS_LABELS } from '@shared/types';
import type { Agent, License } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Pays {
  id: string;
  code: string;
  nom: string;
  nomFr: string;
}

interface Aeroport {
  id: string;
  code: string;
  nom: string;
  ville: string;
  paysId: string;
}

export default function DLAADashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsWithStats, setAgentsWithStats] = useState<Array<{
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email: string;
    aeroport: string;
    status: string;
    documentStats: {
      total: number;
      validated: number;
      pending: number;
      rejected: number;
    };
  }>>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [pendingLicenses, setPendingLicenses] = useState<License[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [aeroports, setAeroports] = useState<Aeroport[]>([]);
  const [selectedPays, setSelectedPays] = useState<string>('');
  const [selectedAeroport, setSelectedAeroport] = useState<string>('');
  const [stats, setStats] = useState<{
    qipValides: number;
    licencesActives: number;
    licencesExpirees: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, agentsStatsRes, licensesRes, statsRes, paysRes, aeroportsRes] = await Promise.all([
          agentsApi.list({ status: 'QIP_VALIDE', limit: 20 }),
          agentsApi.getWithDocStats(),
          licensesApi.list({ limit: 10 }),
          statsApi.overview(),
          referencesApi.pays(),
          referencesApi.aeroports()
        ]);
        
        setAgents(agentsRes.data);
        if (agentsStatsRes.success && agentsStatsRes.data) {
          setAgentsWithStats(agentsStatsRes.data);
        }
        setLicenses(licensesRes.data);
        if (statsRes.success && statsRes.data) {
          setStats({
            qipValides: statsRes.data.agentsParStatus?.QIP_VALIDE || agentsRes.total,
            licencesActives: statsRes.data.licencesActives,
            licencesExpirees: statsRes.data.licencesExpirees || 0
          });
        }
        if (paysRes.success && paysRes.data) {
          setPays(paysRes.data);
        }
        if (aeroportsRes.success && aeroportsRes.data) {
          setAeroports(aeroportsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Emission DLAA
        </h1>
        <p className="text-muted-foreground">
          Emettez les licences pour les agents valides QIP
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QIP Valides</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.qipValides || agents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prets pour emission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licences Actives</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.licencesActives || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Actuellement valides
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total emises</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Licences delivrees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres par zone geographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pays</Label>
              <Select value={selectedPays || "all"} onValueChange={(v) => setSelectedPays(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {pays.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nomFr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Aeroport</Label>
              <Select 
                value={selectedAeroport || "all"} 
                onValueChange={(v) => setSelectedAeroport(v === "all" ? "" : v)}
                disabled={!selectedPays}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedPays ? "Tous les aeroports" : "Selectionnez d'abord un pays"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les aeroports</SelectItem>
                  {aeroports
                    .filter(a => !selectedPays || a.paysId === selectedPays)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nom} ({a.ville})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Licenses */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            En attente d&apos;emission ({agents.length})
          </TabsTrigger>
          <TabsTrigger value="issued">
            <Award className="h-4 w-4 mr-2" />
            Licences emises ({licenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-6">
          {/* Agents Card with Document Stats */}
          {agentsWithStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Agents et Documents Validés
                </CardTitle>
                <CardDescription>
                  Liste des agents avec le nombre de documents validés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {agentsWithStats.map((agent) => {
                    const progress = agent.documentStats.total > 0 
                      ? (agent.documentStats.validated / agent.documentStats.total) * 100 
                      : 0;
                    return (
                      <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {agent.firstName} {agent.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {agent.matricule}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Documents</span>
                            <span className="font-medium">
                              {agent.documentStats.validated}/{agent.documentStats.total} validés
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agents ready for license */}
          <Card>
            <CardHeader>
              <CardTitle>Agents prets pour emission de licence</CardTitle>
              <CardDescription>
                Ces agents ont passe la verification QIP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Aucun agent en attente</h3>
                  <p className="text-sm text-muted-foreground">
                    Tous les agents QIP valides ont recu leur licence
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Aeroport</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {agent.user?.firstName} {agent.user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {agent.fonction}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {agent.matricule}
                        </TableCell>
                        <TableCell>
                          {agent.aeroport?.nom || agent.aeroportId}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm">
                            <Link to={`/dlaa/issue/${agent.id}`}>
                              Emettre licence
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issued" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Licences emises</CardTitle>
              <CardDescription>
                Historique des licences delivrees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Aucune licence emise</h3>
                  <p className="text-sm text-muted-foreground">
                    Les licences emises apparaitront ici
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Date emission</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono text-sm">
                          {license.numero}
                        </TableCell>
                        <TableCell>
                          {license.agent?.user?.firstName} {license.agent?.user?.lastName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(license.dateEmission), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(license.dateExpiration), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            license.status === 'ACTIVE' 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : license.status === 'EXPIREE'
                              ? 'bg-red-500/10 text-red-600 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                          }>
                            {LICENSE_STATUS_LABELS[license.status as keyof typeof LICENSE_STATUS_LABELS] || license.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
