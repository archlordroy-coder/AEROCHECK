import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { agentsApi, referencesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  Search, 
  Filter, 
  FileDown, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Plane,
  Globe,
  MapPin
} from 'lucide-react';
import { AGENT_STATUS_LABELS, COUNTRY_LABELS, type User } from '@shared/types';
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AgentExtended {
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
  nextExpiry?: string;
}

export default function MonitoringDashboard() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentExtended[]>([]);
  const [aeroports, setAeroports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAeroport, setSelectedAeroport] = useState('all');
  const [daysFilter, setDaysFilter] = useState([365]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, aeroportsRes] = await Promise.all([
          agentsApi.getWithDocStats(),
          referencesApi.aeroports((user as any)?.paysId)
        ]);
        
        if (agentsRes.success && agentsRes.data) {
          setAgents(agentsRes.data as any);
        }
        if (aeroportsRes.success && aeroportsRes.data) {
          setAeroports(aeroportsRes.data);
        }
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = 
        agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAirport = selectedAeroport === 'all' || agent.aeroport === selectedAeroport;
      
      let matchesDays = true;
      if (agent.nextExpiry) {
        const daysLeft = differenceInDays(parseISO(agent.nextExpiry), new Date());
        matchesDays = daysLeft <= daysFilter[0];
      } else if (daysFilter[0] < 365) {
        matchesDays = false;
      }

      return matchesSearch && matchesAirport && matchesDays;
    });
  }, [agents, searchTerm, selectedAeroport, daysFilter]);

  const exportToExcel = () => {
    const data = filteredAgents.map(a => ({
      Matricule: a.matricule,
      Nom: a.lastName,
      Prenom: a.firstName,
      Aeroport: a.aeroport,
      Pays: a.pays,
      Statut: AGENT_STATUS_LABELS[a.status as keyof typeof AGENT_STATUS_LABELS] || a.status,
      'Documents Valides': `${a.documentStats.validated}/${a.documentStats.total}`,
      'Prochaine Expiration': a.nextExpiry ? format(parseISO(a.nextExpiry), 'dd/MM/yyyy') : 'N/A'
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Agents");
    writeFile(wb, `Monitoring_Agents_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Rapport de Monitoring AEROCHECK - ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 14, 15);
    
    const tableData = filteredAgents.map(a => [
      a.matricule,
      `${a.lastName} ${a.firstName}`,
      a.aeroport,
      `${a.documentStats.validated}/${a.documentStats.total}`,
      a.nextExpiry ? format(parseISO(a.nextExpiry), 'dd/MM/yyyy') : 'N/A'
    ]);

    (doc as any).autoTable({
      head: [['Matricule', 'Nom Complet', 'Aéroport', 'Docs Validés', 'Expiration']],
      body: tableData,
      startY: 25,
    });

    doc.save(`Rapport_Monitoring_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const dashboardInfo = useMemo(() => {
    if (user?.role === 'ENA') return { title: 'Monitoring Aéroport', icon: Plane, scope: (user as any).aeroport };
    if (user?.role === 'SUP_REP') return { title: 'Monitoring Pays', icon: Globe, scope: COUNTRY_LABELS[(user as any).paysId || ''] || (user as any).pays };
    return { title: 'Centre de Surveillance', icon: BarChart3, scope: 'Global' };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse font-medium">Chargement des données de surveillance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <dashboardInfo.icon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-black tracking-tight">{dashboardInfo.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{dashboardInfo.scope}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <FileDown className="h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-blue-500">Total Agents</CardDescription>
            <CardTitle className="text-3xl font-black">{agents.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 shadow-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-amber-500">Alertes Expiration</CardDescription>
            <CardTitle className="text-3xl font-black">
              {agents.filter(a => a.nextExpiry && differenceInDays(parseISO(a.nextExpiry), new Date()) < 30).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-green-500">Dossiers Complets</CardDescription>
            <CardTitle className="text-3xl font-black">
              {agents.filter(a => a.documentStats.validated >= 3).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-panel">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-red-500">Action Requise</CardDescription>
            <CardTitle className="text-3xl font-black">
              {agents.filter(a => a.documentStats.pending > 0 || a.documentStats.rejected > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-panel border-none bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="grid flex-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="search"
                    placeholder="Nom, matricule..." 
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {user?.role === 'SUPER_ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="airport" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aéroport</Label>
                  <Select value={selectedAeroport} onValueChange={setSelectedAeroport}>
                    <SelectTrigger id="airport" className="bg-white">
                      <SelectValue placeholder="Tous les aéroports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les aéroports</SelectItem>
                      {aeroports.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 md:col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Validité restante: <span className="text-primary">{daysFilter[0]} jours</span>
                  </Label>
                </div>
                <Slider 
                  value={daysFilter} 
                  onValueChange={setDaysFilter} 
                  max={365} 
                  step={1} 
                  className="py-2"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredAgents.length} agents affichés</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Agent</TableHead>
                  <TableHead className="font-bold">Localité</TableHead>
                  <TableHead className="font-bold">Conformité</TableHead>
                  <TableHead className="font-bold">Prochaine Échéance</TableHead>
                  <TableHead className="font-bold">Statut Licence</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Aucun agent ne correspond aux critères de surveillance.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => {
                    const daysRemaining = agent.nextExpiry ? differenceInDays(parseISO(agent.nextExpiry), new Date()) : 999;
                    const isUrgent = daysRemaining < 30;
                    
                    return (
                      <TableRow key={agent.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {agent.lastName[0]}{agent.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{agent.lastName} {agent.firstName}</p>
                              <p className="text-xs text-muted-foreground">{agent.matricule}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{agent.aeroport}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{agent.pays}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  agent.documentStats.validated >= 3 ? "bg-green-500" : "bg-amber-500"
                                )}
                                style={{ width: `${(agent.documentStats.validated / 3) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{agent.documentStats.validated}/3</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {agent.nextExpiry ? (
                              <>
                                {isUrgent ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                                <div className="flex flex-col">
                                  <span className={cn("text-sm font-bold", isUrgent ? "text-destructive" : "text-foreground")}>
                                    {format(parseISO(agent.nextExpiry), 'dd MMM yyyy', { locale: fr })}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground italic">
                                    {daysRemaining} jours restants
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Aucun document valide</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "font-bold uppercase tracking-tighter text-[10px]",
                            agent.status === 'LICENCE_ACTIVE' ? "bg-green-50 text-green-700 border-green-200" :
                            agent.status === 'LICENCE_EXPIREE' ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary rounded-full px-4">
                            <Link to={`/app/profile?id=${agent.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm font-medium text-primary shadow-sm">
          <CheckCircle2 className="h-4 w-4" />
          Toutes les données sont synchronisées en temps réel avec le serveur central ASECNA
        </div>
      </div>
    </div>
  );
}
