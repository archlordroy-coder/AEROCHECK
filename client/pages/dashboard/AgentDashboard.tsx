import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { agentsApi, documentsApi, licensesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  CreditCard, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { AGENT_STATUS_LABELS, DOC_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@shared/types';
import type { Agent, Document, License } from '@shared/types';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch agent data
        const agentRes = await agentsApi.list();
        if (agentRes.data.length > 0) {
          setAgent(agentRes.data[0]);
          
          // Fetch documents
          const docsRes = await documentsApi.list({ agentId: agentRes.data[0].id });
          setDocuments(docsRes.data);
          
          // Fetch license
          const licRes = await licensesApi.list({ agentId: agentRes.data[0].id });
          if (licRes.data.length > 0) {
            setLicense(licRes.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LICENCE_ACTIVE':
      case 'QIP_VALIDE':
      case 'VALIDE':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'EN_ATTENTE':
      case 'DOCUMENTS_SOUMIS':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'QIP_REJETE':
      case 'REJETE':
      case 'LICENCE_SUSPENDUE':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const requiredDocs = [
    'PIECE_IDENTITE',
    'PHOTO_IDENTITE',
    'CASIER_JUDICIAIRE',
    'CERTIFICAT_MEDICAL',
    'ATTESTATION_FORMATION',
    'CONTRAT_TRAVAIL'
  ];

  const submittedTypes = documents.map(d => d.type);
  const progress = (submittedTypes.length / requiredDocs.length) * 100;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenue, {user?.firstName} !
        </h1>
        <p className="text-muted-foreground">
          Suivez l&apos;avancement de votre dossier de licence aeroportuaire
        </p>
      </div>

      {/* Status card */}
      {!agent ? (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Profil agent non complete
            </CardTitle>
            <CardDescription>
              Vous devez d&apos;abord completer votre profil agent avant de pouvoir soumettre des documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/profile">
                Completer mon profil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statut Dossier</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(agent.status)}>
                  {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
                </Badge>
                <p className="mt-2 text-xs text-muted-foreground">
                  Matricule: {agent.matricule}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}/6</div>
                <Progress value={progress} className="mt-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {documents.filter(d => d.status === 'VALIDE').length} valides
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Licence</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {license ? (
                  <>
                    <Badge className={getStatusColor(license.status)}>
                      {license.status}
                    </Badge>
                    <p className="mt-2 text-xs text-muted-foreground">
                      N: {license.numero}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Non delivree</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prochaine etape</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {documents.length < 6 
                    ? 'Soumettre documents' 
                    : agent.status === 'QIP_VALIDE'
                    ? 'Attente DLAA'
                    : agent.status === 'LICENCE_ACTIVE'
                    ? 'Licence obtenue'
                    : 'Verification en cours'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Documents list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mes Documents</CardTitle>
                <CardDescription>Statut de vos documents soumis</CardDescription>
              </div>
              {documents.length < 6 && (
                <Button asChild size="sm">
                  <Link to="/documents/submit">
                    Soumettre un document
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requiredDocs.map((docType) => {
                  const doc = documents.find(d => d.type === docType);
                  
                  return (
                    <div 
                      key={docType}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {doc ? (
                          doc.status === 'VALIDE' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : doc.status === 'REJETE' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {DOCUMENT_TYPE_LABELS[docType as keyof typeof DOCUMENT_TYPE_LABELS]}
                          </p>
                          {doc && (
                            <p className="text-xs text-muted-foreground">
                              {doc.fileName}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={doc ? getStatusColor(doc.status) : ''}
                      >
                        {doc 
                          ? DOC_STATUS_LABELS[doc.status as keyof typeof DOC_STATUS_LABELS] 
                          : 'Non soumis'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
