import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { agentsApi, documentsApi, licensesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusCard, StatusBadge, StatusDot, getAgentStatusColor, getDocumentStatusColor, getLicenseStatusColor } from '@/components/ui/status-indicator';
import { 
  FileText, 
  CreditCard, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar
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
    const color = getAgentStatusColor(status);
    switch (color) {
      case 'green':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'orange':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'red':
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
          {/* Quick stats with StatusCards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              title="Statut Dossier"
              value={AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
              color={getAgentStatusColor(agent.status)}
              icon={User}
            />

            <StatusCard
              title="Documents"
              value={`${documents.length}/6`}
              color={documents.length === 6 ? 'green' : documents.length > 3 ? 'orange' : 'red'}
              icon={FileText}
              trend={{ value: Math.round((documents.filter(d => d.status === 'VALIDE').length / Math.max(documents.length, 1)) * 100), label: 'validés' }}
            />

            <StatusCard
              title="Licence"
              value={license ? license.status : 'Non délivrée'}
              color={license ? getLicenseStatusColor(license.status) : 'gray'}
              icon={CreditCard}
            />

            <StatusCard
              title="Prochaine étape"
              value={documents.length < 6 
                ? 'Soumettre documents' 
                : agent.status === 'QIP_VALIDE'
                ? 'Attente DLAA'
                : agent.status === 'LICENCE_ACTIVE'
                ? 'Licence obtenue'
                : 'Vérification en cours'}
              color={agent.status === 'LICENCE_ACTIVE' ? 'green' : 'orange'}
              icon={Clock}
            />
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
                          <StatusDot 
                            color={getDocumentStatusColor(doc.status)} 
                            pulse={doc.status === 'EN_ATTENTE'}
                            className="h-5 w-5"
                          />
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
                      <StatusBadge
                        color={doc ? getDocumentStatusColor(doc.status) : 'gray'}
                        label={doc 
                          ? DOC_STATUS_LABELS[doc.status as keyof typeof DOC_STATUS_LABELS] 
                          : 'Non soumis'}
                      />
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
