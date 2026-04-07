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
  Calendar,
  Upload,
  Award,
  MapPin,
  Briefcase
} from 'lucide-react';
import { AGENT_STATUS_LABELS, DOC_STATUS_LABELS, DOCUMENT_TYPE_LABELS, LICENSE_STATUS_LABELS } from '@shared/types';
import type { Agent, Document, License } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      {/* Header Personnalisé Agent */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mon Espace Agent
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>
        {agent && (
          <Badge className={
            agent.status.includes('ACTIVE') || agent.status.includes('VALIDE')
              ? 'bg-green-500/10 text-green-600 border-green-500/20'
              : agent.status.includes('REJETE') || agent.status.includes('SUSPENDUE')
              ? 'bg-red-500/10 text-red-600 border-red-500/20'
              : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
          }>
            {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS]}
          </Badge>
        )}
      </div>

      {!agent ? (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Profil incomplet
            </CardTitle>
            <CardDescription>
              Vous devez completer votre profil pour soumettre vos documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/app/profile">
                Completer mon profil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mon Parcours - Vue Personnelle */}
          <Card className="bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mon Parcours
              </CardTitle>
              <CardDescription>
                Progression de ma demande de licence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression globale</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                
                <div className="grid gap-2 sm:grid-cols-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${agent ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={agent ? '' : 'text-muted-foreground'}>Profil créé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${documents.length >= 6 ? 'bg-green-500' : documents.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                    <span className={documents.length > 0 ? '' : 'text-muted-foreground'}>Documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${agent.status === 'QIP_VALIDE' ? 'bg-green-500' : agent.status === 'QIP_REJETE' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span className={agent.status.includes('QIP') ? '' : 'text-muted-foreground'}>Validation QIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${license ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={license ? '' : 'text-muted-foreground'}>Licence DLAA</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Personnelles */}
          {/* Stats Personnelles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              title="Mes Documents"
              value={`${documents.length}/6`}
              color={documents.length === 6 ? 'green' : documents.length > 3 ? 'orange' : 'red'}
              icon={FileText}
              trend={{ value: Math.round((documents.filter(d => d.status === 'VALIDE').length / Math.max(documents.length, 1)) * 100), label: 'validés' }}
            />

            <StatusCard
              title="Mon Statut"
              value={AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}
              color={getAgentStatusColor(agent.status)}
              icon={User}
            />

            <StatusCard
              title="Ma Licence"
              value={license ? LICENSE_STATUS_LABELS[license.status] || license.status : 'Non délivrée'}
              color={license ? getLicenseStatusColor(license.status) : 'gray'}
              icon={CreditCard}
            />

            <StatusCard
              title="Prochaine Étape"
              value={documents.length < 6 
                ? 'Documents' 
                : agent.status === 'QIP_VALIDE'
                ? 'Attente DLAA'
                : agent.status === 'DLAA_DELIVRE'
                ? 'Licence obtenue'
                : 'Vérification'}
              color={agent.status === 'DLAA_DELIVRE' ? 'green' : 'orange'}
              icon={Clock}
            />
          </div>

          {/* Mes Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mes Documents
                </CardTitle>
                <CardDescription>Documents requis pour ma licence</CardDescription>
              </div>
              {documents.length < 6 && (
                <Button asChild size="sm">
                  <Link to="/app/documents/submit">
                    <Upload className="mr-2 h-4 w-4" />
                    Soumettre
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
                              Soumis le {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge
                        color={doc ? getDocumentStatusColor(doc.status) : 'gray'}
                        label={doc 
                          ? DOC_STATUS_LABELS[doc.status as keyof typeof DOC_STATUS_LABELS] 
                          : 'Requis'}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ma Licence */}
          {license && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Award className="h-5 w-5" />
                  Ma Licence Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Numéro</p>
                    <p className="font-mono font-medium">{license.numero}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Émise le</p>
                    <p className="font-medium">
                      {format(new Date(license.dateEmission), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expire le</p>
                    <p className={`font-medium ${
                      new Date(license.dateExpiration) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'text-red-600'
                        : ''
                    }`}>
                      {format(new Date(license.dateExpiration), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mes Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mon Affectation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Pays</p>
                  <p className="font-medium">{agent.pays?.nomFr || agent.paysId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aéroport</p>
                  <p className="font-medium">{agent.aeroport?.nom || agent.aeroportId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fonction</p>
                  <p className="font-medium">{agent.fonction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
