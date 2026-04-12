import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentsApi, licensesApi, statsApi, referencesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { 
  Award, 
  CreditCard,
  Users,
  FileCheck,
  Filter,
  Clock,
  Shield,
  MapPin,
  ClipboardCheck,
  AlertTriangle
} from 'lucide-react';
import { AGENT_STATUS_LABELS, LICENSE_STATUS_LABELS } from '@shared/types';
import type { Agent, License } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { filterLicenseDocuments, getRequiredLicenseDocumentTypes } from '@/lib/priority-documents';
import { getLicenseMonitoringDate } from '@/lib/license-validity';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsWithStats, setAgentsWithStats] = useState<Array<{
    id: string;
    matricule: string;
    firstName: string;
    lastName: string;
    email: string;
    aeroport: string;
    pays: string;
    status: string;
    documentStats: {
      total: number;
      validated: number;
      pending: number;
      rejected: number;
    };
  }>>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDays, setFilterDays] = useState('all');

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

  const exportToExcel = () => {
    const dataToExport = agentsWithStats.map(agent => ({
      Matricule: agent.matricule,
      Nom: `${agent.firstName} ${agent.lastName}`,
      Email: agent.email,
      Aeroport: agent.aeroport,
      Statut: AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status,
      DocsValides: agent.documentStats.validated
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dossiers");
    XLSX.writeFile(wb, `DLAA_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Registre exporté avec succès');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Registre de Délivrance DLAA - ${user?.pays || ''}`, 14, 15);
    
    const tableData = agentsWithStats.map(agent => [
      agent.matricule,
      `${agent.firstName} ${agent.lastName}`,
      agent.aeroport,
      AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status
    ]);

    doc.autoTable({
      head: [['Matricule', 'Nom', 'Aeroport', 'Statut']],
      body: tableData,
      startY: 20,
    });

    doc.save(`DLAA_Registre_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Registre exporté en PDF');
  };

  const filteredAgents = agentsWithStats.filter(agent => {
    const matchesSearch = `${agent.firstName} ${agent.lastName} ${agent.matricule}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAeroport = !selectedAeroport || agent.aeroport === selectedAeroport || agent.id === selectedAeroport;
    return matchesSearch && matchesAeroport;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const readyAgents = agents.filter((agent) => {
    const requiredTypes = getRequiredLicenseDocumentTypes(agent);
    const documents = filterLicenseDocuments(agent.documents ?? []);
    return requiredTypes.every((type) =>
      documents.some((document) => document.type === type && document.status === 'VALIDE' && (!document.expiresAt || new Date(document.expiresAt) >= new Date()))
    );
  });

  const expiringLicenses = licenses.filter((license) => {
    const expiration = getLicenseMonitoringDate(license.agent, license)?.getTime();
    if (!expiration) {
      return false;
    }
    const now = Date.now();
    const horizon = now + 60 * 24 * 60 * 60 * 1000;
    return expiration >= now && expiration <= horizon;
  });

  return (
    <div className="space-y-6">
      {/* Header DLAA Specifique */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Espace DLAA - Delivrance
          </h1>
          <p className="text-muted-foreground">
            Delivrance finale des licences aux agents valides QIP
          </p>
        </div>
        {user?.pays && (
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                Export PDF
              </Button>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {user.pays}
            </Badge>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attente DLAA</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.qipValides || agents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Agents QIP valides en attente
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
              Licences DLAA en cours de validite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total delivrees</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Licences DLAA emises
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Pipeline de delivrance DLAA
          </CardTitle>
          <CardDescription>
            Vue orientee décision finale, différente du backlog de verification QIP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Dossiers recevables</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{readyAgents.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">Agents dont le dossier est complet, valide et non expiré.</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Licences à surveiller</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{expiringLicenses.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">Licences arrivant à expiration dans les 60 prochains jours.</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted-foreground">Historique DLAA</p>
              <p className="mt-2 text-3xl font-bold text-primary">{licenses.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">Licences déjà émises et disponibles pour consultation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                File de delivrance
              </CardTitle>
              <CardDescription>
                Le DLAA pilote une décision finale par dossier, pas une verification document par document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
                        .filter((a) => !selectedPays || a.paysId === selectedPays)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.nom} ({a.ville})</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Rechercher</Label>
                  <Input 
                    placeholder="Matricule ou nom..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Aucun agent à traiter</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucun dossier QIP valide n&apos;attend une décision finale DLAA.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead>Aeroport</TableHead>
                      <TableHead>Recevabilite</TableHead>
                      <TableHead className="text-right">Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => {
                      const requiredTypes = getRequiredLicenseDocumentTypes(agent);
                      const docs = filterLicenseDocuments(agent.documents ?? []);
                      const isReady = requiredTypes.every((type) =>
                        docs.some((document) => document.type === type && document.status === 'VALIDE' && (!document.expiresAt || new Date(document.expiresAt) >= new Date()))
                      );

                      return (
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
                          <TableCell className="font-mono">{agent.matricule}</TableCell>
                          <TableCell>{agent.aeroport?.nom || agent.aeroportId}</TableCell>
                          <TableCell>
                            <Badge className={isReady ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'}>
                              {isReady ? 'Pret pour emission' : 'Controle requis'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/app/dlaa/review/${agent.id}`}>
                                <ClipboardCheck className="mr-1 h-3 w-3" />
                                Ouvrir dossier DLAA
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Award className="h-5 w-5" />
                Registre des licences DLAA
              </CardTitle>
              <CardDescription>
                Historique d&apos;émission et statuts des licences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Aucune licence emise</h3>
                  <p className="text-sm text-muted-foreground">
                    Les licences émises apparaîtront ici.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Date emission</TableHead>
                      <TableHead>Prochaine echeance</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => {
                      const monitoringDate = getLicenseMonitoringDate(license.agent, license);

                      return (
                        <TableRow key={license.id}>
                          <TableCell className="font-mono text-sm">{license.numero}</TableCell>
                          <TableCell>{license.agent?.user?.firstName} {license.agent?.user?.lastName}</TableCell>
                          <TableCell>{format(new Date(license.dateEmission), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                          <TableCell>{monitoringDate ? format(monitoringDate, 'dd/MM/yyyy', { locale: fr }) : 'Selon les documents'}</TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Expirations à surveiller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiringLicenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun dossier licence n&apos;a d&apos;echeance documentaire dans les 60 prochains jours.
                </p>
              ) : (
                expiringLicenses.map((license) => {
                  const monitoringDate = getLicenseMonitoringDate(license.agent, license);

                  return (
                    <div key={license.id} className="rounded-lg border p-3">
                      <p className="font-medium">{license.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {license.agent?.user?.firstName} {license.agent?.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Echeance documentaire le {monitoringDate ? format(monitoringDate, 'dd MMM yyyy', { locale: fr }) : 'a confirmer'}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {agentsWithStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Vision consolidée dossiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAgents.slice(0, 8).map((agent) => {
                  const progress = agent.documentStats.total > 0
                    ? (agent.documentStats.validated / agent.documentStats.total) * 100
                    : 0;
                  return (
                    <div key={agent.id} className="rounded-lg border p-3 bg-card hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{agent.firstName} {agent.lastName}</p>
                          <p className="text-[10px] text-muted-foreground">{agent.matricule} • {agent.aeroport}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}</Badge>
                      </div>
                      <Progress value={progress} className="mt-3 h-1.5" />
                      <Button asChild variant="ghost" size="sm" className="w-full mt-2 h-7 text-[10px]">
                        <Link to={`/app/profile?agentId=${agent.id}`}>
                          Consulter profile complet
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
