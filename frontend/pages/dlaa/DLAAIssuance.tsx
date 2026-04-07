import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Search, Award, FileCheck, Clock, Printer, Eye, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ApprovedAgent {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  airport: string;
  fonction: string;
  approvedAt: string;
  licenseType: string;
  status: 'approved' | 'issued' | 'printed';
  license?: {
    id: string;
    number: string;
    validFrom: string;
    validUntil?: string;
  };
}

const statusLabels: Record<string, string> = {
  approved: 'A emettre',
  issued: 'Emise',
  printed: 'Imprimee',
};

const statusColors: Record<string, string> = {
  approved: 'bg-amber-100 text-amber-800',
  issued: 'bg-blue-100 text-blue-800',
  printed: 'bg-emerald-100 text-emerald-800',
};

const LICENSE_TYPES = [
  { value: 'AEROPORT', label: 'Licence Aeroportuaire Standard' },
  { value: 'SURETE', label: 'Licence Agent de Surete' },
  { value: 'TECHNIQUE', label: 'Licence Technique' },
  { value: 'SUPERVISION', label: 'Licence Supervision' },
];

export default function DLAAIssuance() {
  const [agents, setAgents] = useState<ApprovedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<ApprovedAgent | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const { toast } = useToast();

  const [issueFormData, setIssueFormData] = useState({
    licenseType: 'AEROPORT',
    notes: '',
  });

  useEffect(() => {
    fetchApprovedAgents();
  }, []);

  const fetchApprovedAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/licenses/pending');
      setAgents((response.data as { success: boolean; data: ApprovedAgent[] }).data ?? []);
    } catch (error) {
      // Mock data for demo
      setAgents([
        {
          id: '1',
          matricule: 'AGT-2024-002',
          firstName: 'Fatou',
          lastName: 'Sow',
          airport: 'DSS - Dakar',
          fonction: 'Agent de Surete',
          approvedAt: '2024-03-15',
          licenseType: 'SURETE',
          status: 'approved',
        },
        {
          id: '2',
          matricule: 'AGT-2024-005',
          firstName: 'Ousmane',
          lastName: 'Camara',
          airport: 'ABJ - Abidjan',
          fonction: 'Agent de Piste',
          approvedAt: '2024-03-14',
          licenseType: 'AEROPORT',
          status: 'issued',
          license: {
            id: 'lic-001',
            number: 'LIC-2024-ABJ-001',
            validFrom: '2024-03-14',
            validUntil: '2025-03-14',
          },
        },
        {
          id: '3',
          matricule: 'AGT-2024-008',
          firstName: 'Aissatou',
          lastName: 'Barry',
          airport: 'DLA - Douala',
          fonction: 'Agent Technique',
          approvedAt: '2024-03-13',
          licenseType: 'TECHNIQUE',
          status: 'printed',
          license: {
            id: 'lic-002',
            number: 'LIC-2024-DLA-002',
            validFrom: '2024-03-13',
            validUntil: '2025-03-13',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueLicense = async () => {
    if (!selectedAgent) return;
    try {
      await api.post('/licenses/issue', {
        agentId: selectedAgent.id,
        type: issueFormData.licenseType,
        notes: issueFormData.notes,
      });
      toast({
        title: 'Licence emise',
        description: `La licence a ete emise pour ${selectedAgent.firstName} ${selectedAgent.lastName}`,
      });
      setIssueModalOpen(false);
      setSelectedAgent(null);
      fetchApprovedAgents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'emission',
        variant: 'destructive',
      });
    }
  };

  const handlePrintLicense = async (agent: ApprovedAgent) => {
    if (!agent.license) return;
    try {
      await api.post(`/licenses/${agent.license.id}/print`);
      toast({
        title: 'Impression lancee',
        description: 'La licence a ete envoyee a l\'impression',
      });
      fetchApprovedAgents();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de l\'impression',
        variant: 'destructive',
      });
    }
  };

  const openIssueModal = (agent: ApprovedAgent) => {
    setSelectedAgent(agent);
    setIssueFormData({
      licenseType: agent.licenseType || 'AEROPORT',
      notes: '',
    });
    setIssueModalOpen(true);
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
    toIssue: agents.filter((a) => a.status === 'approved').length,
    issued: agents.filter((a) => a.status === 'issued').length,
    printed: agents.filter((a) => a.status === 'printed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Emission des Licences DLAA</h1>
        <p className="text-muted-foreground">Emettez et gerez les licences des agents approuves</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">A Emettre</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.toIssue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emises</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.issued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Imprimees</CardTitle>
            <Printer className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.printed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agents Approuves pour Licence</CardTitle>
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
                <SelectItem value="approved">A emettre</SelectItem>
                <SelectItem value="issued">Emises</SelectItem>
                <SelectItem value="printed">Imprimees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Aeroport</TableHead>
                <TableHead>Type Licence</TableHead>
                <TableHead>N Licence</TableHead>
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
                    Aucun dossier trouve
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
                    <TableCell>
                      {LICENSE_TYPES.find((t) => t.value === agent.licenseType)?.label || agent.licenseType}
                    </TableCell>
                    <TableCell className="font-mono">
                      {agent.license?.number || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[agent.status]}>
                        {statusLabels[agent.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {agent.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openIssueModal(agent)}
                          >
                            <Award className="mr-2 h-4 w-4" />
                            Emettre
                          </Button>
                        )}
                        {agent.status === 'issued' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintLicense(agent)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimer
                          </Button>
                        )}
                        {agent.status === 'printed' && (
                          <Button variant="ghost" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue License Dialog */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emettre une Licence</DialogTitle>
            <DialogDescription>
              Emission de licence pour {selectedAgent?.firstName} {selectedAgent?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Matricule:</span>
                <p className="font-mono font-medium">{selectedAgent?.matricule}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Aeroport:</span>
                <p className="font-medium">{selectedAgent?.airport}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseType">Type de Licence</Label>
                <Select
                  value={issueFormData.licenseType}
                  onValueChange={(value) => setIssueFormData({ ...issueFormData, licenseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                La licence reste active tant que les documents requis de l&apos;agent restent valides. La prochaine echeance sera donc pilotee par les pieces justificatives, pas par une duree fixe.
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Input
                  id="notes"
                  placeholder="Remarques ou observations..."
                  value={issueFormData.notes}
                  onChange={(e) => setIssueFormData({ ...issueFormData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleIssueLicense}>
              <Award className="mr-2 h-4 w-4" />
              Emettre la Licence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
