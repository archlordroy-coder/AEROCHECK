import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentsApi, documentsApi, statsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  FileSearch, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Users,
  Eye,
  CheckSquare
} from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, AGENT_STATUS_LABELS } from '@shared/types';
import type { Document } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function QIPDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [agents, setAgents] = useState<Array<{
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
  const [stats, setStats] = useState<{
    documentsEnAttente: number;
    totalDocuments: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, agentsRes, statsRes] = await Promise.all([
          documentsApi.list({ status: 'EN_ATTENTE', limit: 20 }),
          agentsApi.getWithDocStats(),
          statsApi.overview()
        ]);
        
        setDocuments(docsRes.data);
        if (agentsRes.success && agentsRes.data) {
          setAgents(agentsRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats({
            documentsEnAttente: statsRes.data.documentsEnAttente,
            totalDocuments: statsRes.data.totalDocuments || docsRes.total
          });
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
          Verification QIP
        </h1>
        <p className="text-muted-foreground">
          Verifiez et validez les documents des agents aeroportuaires
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.documentsEnAttente || documents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents a verifier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total traites</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDocuments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Documents au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents concernes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(documents.map(d => d.agentId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Dossiers en cours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Card with Document Stats */}
      {agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Agents et Documents Validés
            </CardTitle>
            <CardDescription>
              Liste des agents avec le nombre de documents validés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => {
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
                      <div className="flex gap-2 text-xs">
                        {agent.documentStats.pending > 0 && (
                          <Badge className="bg-yellow-500/10 text-yellow-600">
                            {agent.documentStats.pending} en attente
                          </Badge>
                        )}
                        {agent.documentStats.rejected > 0 && (
                          <Badge className="bg-red-500/10 text-red-600">
                            {agent.documentStats.rejected} rejetés
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents en attente de verification</CardTitle>
          <CardDescription>
            Cliquez sur un document pour le verifier
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
                        <Button asChild size="sm">
                          <Link to={`/qip/verify/${doc.id}`}>
                            Vérifier
                            <ArrowRight className="ml-2 h-4 w-4" />
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
