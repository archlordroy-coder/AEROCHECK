import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentsApi, documentsApi, statsApi, referencesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DocumentPreview } from '@/components/ui/document-preview';
import { useAuth } from '@/context/AuthContext';
import { 
  FileSearch, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Users,
  Eye,
  CheckSquare,
  Filter,
  MapPin,
  FileText,
  Award,
  Shield,
  User
} from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, AGENT_STATUS_LABELS, DOC_STATUS_LABELS } from '@shared/types';
import type { Document, Agent } from '@shared/types';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function QIPDashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [agents, setAgents] = useState<Array<{
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
  const [pays, setPays] = useState<Pays[]>([]);
  const [aeroports, setAeroports] = useState<Aeroport[]>([]);
  const [selectedPays, setSelectedPays] = useState<string>('');
  const [selectedAeroport, setSelectedAeroport] = useState<string>('');
  const [stats, setStats] = useState<{
    documentsEnAttente: number;
    totalDocuments: number;
    documentsValides: number;
    documentsRejetes: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [filterDays, setFilterDays] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, agentsRes, statsRes, paysRes, aeroportsRes] = await Promise.all([
          documentsApi.list({ status: 'EN_ATTENTE', limit: 20 }),
          agentsApi.getWithDocStats(),
          statsApi.overview(),
          referencesApi.pays(),
          referencesApi.aeroports()
        ]);
        
        setDocuments(docsRes.data);
        setAllDocuments(docsRes.data);
        if (agentsRes.success && agentsRes.data) {
          setAgents(agentsRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats({
            documentsEnAttente: statsRes.data.documentsEnAttente,
            totalDocuments: statsRes.data.totalDocuments || docsRes.total,
            documentsValides: statsRes.data.qipValides || 0,
            documentsRejetes: 0
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
    const dataToExport = agents.map(agent => ({
      Matricule: agent.matricule,
      Nom: `${agent.firstName} ${agent.lastName}`,
      Email: agent.email,
      Aeroport: agent.aeroport,
      Statut: AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status,
      DocumentsValides: agent.documentStats.validated,
      DocumentsEnAttente: agent.documentStats.pending,
      DocumentsRejetes: agent.documentStats.rejected
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agents");
    XLSX.writeFile(wb, `Agents_Pays_${user?.pays || 'Export'}.xlsx`);
    toast.success('Liste exportée en Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Liste des Agents - Pays: ${user?.pays || 'Inconnu'}`, 14, 15);
    
    const tableData = agents.map(agent => [
      agent.matricule,
      `${agent.firstName} ${agent.lastName}`,
      agent.aeroport,
      AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status,
      `${agent.documentStats.validated}/${agent.documentStats.total}`
    ]);

    doc.autoTable({
      head: [['Matricule', 'Nom', 'Aeroport', 'Statut', 'Docs Validés']],
      body: tableData,
      startY: 20,
    });

    doc.save(`Agents_Pays_${user?.pays || 'Export'}.pdf`);
    toast.success('Liste exportée en PDF');
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = `${agent.firstName} ${agent.lastName} ${agent.matricule}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAeroport = !selectedAeroport || agent.aeroport === selectedAeroport;
    
    return matchesSearch && matchesAeroport;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header QIP Spécifique */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Espace QIP - Verification
          </h1>
          <p className="text-muted-foreground">
            Verification premiere niveau des documents agents
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
            <Button asChild variant="outline" size="sm">
              <Link to="/app/profile">
                <User className="mr-2 h-4 w-4" />
                Mon Profil Agent
              </Link>
            </Button>
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
            <CardTitle className="text-sm font-medium">En attente QIP</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.documentsEnAttente || documents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents a verifier par QIP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valides QIP</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.documentsValides || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents valides niveau QIP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetes QIP</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.documentsRejetes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents refuses niveau QIP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents QIP Card with Document Stats */}
      {agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Agents sous ma responsabilite QIP
            </CardTitle>
            <CardDescription>
              Liste des agents avec etat de leurs documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => {
                const progress = agent.documentStats.total > 0 
                  ? (agent.documentStats.validated / agent.documentStats.total) * 100 
                  : 0;
                return (
                  <div key={agent.id} className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          {agent.firstName} {agent.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {agent.matricule} • {agent.aeroport}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progression QIP</span>
                        <span className="font-medium">
                          {agent.documentStats.validated}/{agent.documentStats.total} valides
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex flex-wrap gap-2 text-xs">
                        {agent.documentStats.pending > 0 && (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-none">
                            {agent.documentStats.pending} en attente
                          </Badge>
                        )}
                        {agent.documentStats.rejected > 0 && (
                          <Badge className="bg-red-500/10 text-red-600 border-none">
                            {agent.documentStats.rejected} rejetés
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="w-full mt-2 text-xs">
                       <Link to={`/app/profile?agentId=${agent.id}`}>
                         Voir profil complet
                       </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
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
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Rechercher</Label>
              <Input 
                placeholder="Nom, prenom ou matricule..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Validité (jours restants)</Label>
              <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les validites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les validites</SelectItem>
                  <SelectItem value="expiring-90">Expire dans moins de 90j</SelectItem>
                  <SelectItem value="expiring-30">Expire dans moins de 30j</SelectItem>
                  <SelectItem value="expired">Déjà expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Documents */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            En attente ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="validated">
            <CheckCircle className="h-4 w-4 mr-2" />
            Validés
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4 mr-2" />
            Rejetés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                Documents en attente de verification QIP
              </CardTitle>
              <CardDescription>
                Cliquez sur un document pour examiner et valider/rejeter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
                  <h3 className="text-lg font-medium">Aucun document en attente</h3>
                  <p className="text-sm text-muted-foreground">
                    Tous les documents ont ete traites
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Type de document</TableHead>
                      <TableHead>Date de soumission</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {doc.agent?.user?.firstName} {doc.agent?.user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doc.agent?.matricule}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS]}
                        </TableCell>
                        <TableCell>
                          {format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            En attente
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Aperçu
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link to={`/app/qip/verify/${doc.id}`}>
                                <Shield className="mr-1 h-3 w-3" />
                                Verifier QIP
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validated" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Documents valides par QIP
              </CardTitle>
              <CardDescription>
                Documents verifies et approuves niveau QIP - En attente de DLAA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-green-600" />
                <h3 className="text-lg font-medium">Historique des validations</h3>
                <p className="text-sm text-muted-foreground">
                  Les documents validés apparaissent ici
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Documents rejetes par QIP
              </CardTitle>
              <CardDescription>
                Documents refuses avec motif - Agent doit resoumettre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="mb-4 h-12 w-12 text-red-600" />
                <h3 className="text-lg font-medium">Historique des rejets</h3>
                <p className="text-sm text-muted-foreground">
                  Les documents rejetes apparaissent ici
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Preview Modal */}
      <DocumentPreview
        document={selectedDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDoc(null);
        }}
      />
    </div>
  );
}
