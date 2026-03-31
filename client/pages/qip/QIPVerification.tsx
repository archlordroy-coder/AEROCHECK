import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { api, DocumentStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface PendingAgent {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  airport: string;
  fonction: string;
  submittedAt: string;
  documentCount: number;
  verifiedCount: number;
  status: 'pending' | 'in_progress' | 'ready';
}

interface DocumentDetail {
  id: string;
  type: string;
  fileName: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  comment?: string;
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  ready: 'Pret pour licence',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  ready: 'bg-emerald-100 text-emerald-800',
};

const docStatusColors: Record<DocumentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export default function QIPVerification() {
  const [agents, setAgents] = useState<PendingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<PendingAgent | null>(null);
  const [agentDocuments, setAgentDocuments] = useState<DocumentDetail[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingAgents();
  }, []);

  const fetchPendingAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents/pending');
      setAgents(response.data);
    } catch (error) {
      // Mock data for demo
      setAgents([
        {
          id: '1',
          matricule: 'AGT-2024-001',
          firstName: 'Amadou',
          lastName: 'Diallo',
          airport: 'DSS - Dakar',
          fonction: 'Agent de Piste',
          submittedAt: '2024-03-15',
          documentCount: 5,
          verifiedCount: 3,
          status: 'in_progress',
        },
        {
          id: '2',
          matricule: 'AGT-2024-002',
          firstName: 'Fatou',
          lastName: 'Sow',
          airport: 'DSS - Dakar',
          fonction: 'Agent de Surete',
          submittedAt: '2024-03-14',
          documentCount: 5,
          verifiedCount: 5,
          status: 'ready',
        },
        {
          id: '3',
          matricule: 'AGT-2024-003',
          firstName: 'Moussa',
          lastName: 'Ndiaye',
          airport: 'ABJ - Abidjan',
          fonction: 'Agent Technique',
          submittedAt: '2024-03-13',
          documentCount: 5,
          verifiedCount: 0,
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDocuments = async (agentId: string) => {
    try {
      const response = await api.get(`/documents/agent/${agentId}`);
      setAgentDocuments(response.data);
    } catch (error) {
      // Mock data for demo
      setAgentDocuments([
        {
          id: '1',
          type: 'CNI',
          fileName: 'cni_amadou_diallo.pdf',
          status: 'VERIFIED',
          uploadedAt: '2024-03-10',
          verifiedAt: '2024-03-12',
          verifiedBy: 'Ibrahima Ba',
        },
        {
          id: '2',
          type: 'Certificat Medical',
          fileName: 'certificat_medical.pdf',
          status: 'VERIFIED',
          uploadedAt: '2024-03-10',
          verifiedAt: '2024-03-12',
          verifiedBy: 'Ibrahima Ba',
        },
        {
          id: '3',
          type: 'Casier Judiciaire',
          fileName: 'casier_judiciaire.pdf',
          status: 'VERIFIED',
          uploadedAt: '2024-03-10',
          verifiedAt: '2024-03-13',
          verifiedBy: 'Ibrahima Ba',
        },
        {
          id: '4',
          type: 'Diplome/Formation',
          fileName: 'diplome_formation.pdf',
          status: 'PENDING',
          uploadedAt: '2024-03-11',
        },
        {
          id: '5',
          type: 'Photo d\'identite',
          fileName: 'photo_identite.jpg',
          status: 'PENDING',
          uploadedAt: '2024-03-11',
        },
      ]);
    }
  };

  const handleVerifyDocument = async (docId: string, approve: boolean) => {
    try {
      await api.post(`/documents/${docId}/verify`, {
        status: approve ? 'VERIFIED' : 'REJECTED',
        comment: approve ? 'Document valide' : 'Document non conforme',
      });
      toast({
        title: approve ? 'Document verifie' : 'Document rejete',
        description: approve
          ? 'Le document a ete valide avec succes'
          : 'Le document a ete rejete',
        variant: approve ? 'default' : 'destructive',
      });
      // Update local state
      setAgentDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? { ...doc, status: approve ? 'VERIFIED' : 'REJECTED' }
            : doc
        )
      );
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la verification',
        variant: 'destructive',
      });
    }
  };

  const openAgentDetails = (agent: PendingAgent) => {
    setSelectedAgent(agent);
    fetchAgentDocuments(agent.id);
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: agents.length,
    pending: agents.filter((a) => a.status === 'pending').length,
    inProgress: agents.filter((a) => a.status === 'in_progress').length,
    ready: agents.filter((a) => a.status === 'ready').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verification QIP</h1>
        <p className="text-muted-foreground">Verifiez les documents des agents en attente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prets</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.ready}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dossiers en Attente de Verification</CardTitle>
          <CardDescription>
            {filteredAgents.length} dossier(s) trouve(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par matricule ou nom..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="ready">Prets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Aeroport</TableHead>
                <TableHead>Fonction</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun dossier en attente
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-mono font-medium">{agent.matricule}</TableCell>
                    <TableCell>
                      {agent.firstName} {agent.lastName}
                    </TableCell>
                    <TableCell>{agent.airport}</TableCell>
                    <TableCell>{agent.fonction}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {agent.verifiedCount}/{agent.documentCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[agent.status]}>
                        {statusLabels[agent.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAgentDetails(agent)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Verifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Verification Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verification des Documents</DialogTitle>
            <DialogDescription>
              {selectedAgent?.firstName} {selectedAgent?.lastName} - {selectedAgent?.matricule}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Aeroport:</span>{' '}
                <span className="font-medium">{selectedAgent?.airport}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fonction:</span>{' '}
                <span className="font-medium">{selectedAgent?.fonction}</span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Fichier</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.fileName}
                    </TableCell>
                    <TableCell>
                      <Badge className={docStatusColors[doc.status]}>
                        {doc.status === 'VERIFIED'
                          ? 'Verifie'
                          : doc.status === 'REJECTED'
                          ? 'Rejete'
                          : doc.status === 'EXPIRED'
                          ? 'Expire'
                          : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {doc.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleVerifyDocument(doc.id, true)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleVerifyDocument(doc.id, false)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {doc.status === 'VERIFIED' && (
                        <span className="text-xs text-muted-foreground">
                          Par {doc.verifiedBy}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAgent(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
