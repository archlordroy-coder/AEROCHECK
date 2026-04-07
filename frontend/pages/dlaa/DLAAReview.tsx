import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { agentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, Award, Calendar, CheckCircle, Clock, FileCheck, FileText, Shield, User } from 'lucide-react';
import { AGENT_STATUS_LABELS, DOC_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@shared/types';
import type { Agent } from '@shared/types';
import { filterLicenseDocuments, getRequiredLicenseDocumentTypes, requiresJustificatif } from '@/lib/priority-documents';

export default function DLAAReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;

      try {
        const response = await agentsApi.get(id);
        if (response.success && response.data) {
          setAgent(response.data);
        }
      } catch (error) {
        navigate('/app/dlaa');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
          <h3 className="text-lg font-medium">Dossier introuvable</h3>
          <Button onClick={() => navigate('/app/dlaa')} className="mt-4">
            Retour au tableau DLAA
          </Button>
        </CardContent>
      </Card>
    );
  }

  const requiredDocumentTypes = getRequiredLicenseDocumentTypes(agent);
  const documents = filterLicenseDocuments(agent.documents ?? []);
  const documentRows = requiredDocumentTypes.map((type) => {
    const document = documents.find((item) => item.type === type);
    const expired = Boolean(document?.expiresAt && new Date(document.expiresAt) < new Date());
    return { type, document, expired };
  });
  const isReadyForIssuance = documentRows.every(({ document, expired }) => document && document.status === 'VALIDE' && !expired);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/dlaa')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Dossier de delivrance DLAA
          </h1>
          <p className="text-muted-foreground">
            Controle final du dossier avant emission de la licence
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Synthese de recevabilite DLAA
              </CardTitle>
              <CardDescription>
                Dossier orienté emission, distinct de la verification documentaire QIP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Statut agent</span>
                <Badge>{AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS] || agent.status}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Documents requis</span>
                <span className="font-medium">{documentRows.filter((item) => item.document).length}/{documentRows.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <span className="text-sm text-muted-foreground">Decision DLAA</span>
                <Badge className={isReadyForIssuance ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'}>
                  {isReadyForIssuance ? 'Pret pour emission' : 'Dossier incomplet'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Controle des documents requis
              </CardTitle>
              <CardDescription>
                {requiresJustificatif(agent)
                  ? '3 documents prioritaires + justificatif de nomination'
                  : '3 documents prioritaires seulement'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentRows.map(({ type, document, expired }) => (
                <div key={type} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS]}</p>
                      {document ? (
                        <>
                          <p className="text-sm text-muted-foreground">{document.fileName}</p>
                          {document.issuedAt && (
                            <p className="text-xs text-muted-foreground">
                              Delivre le {new Date(document.issuedAt).toLocaleDateString('fr-FR')}
                              {document.expiresAt ? ` • Expire le ${new Date(document.expiresAt).toLocaleDateString('fr-FR')}` : ' • Valide a vie'}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Document manquant</p>
                      )}
                    </div>
                    <Badge className={
                      !document
                        ? 'bg-muted text-muted-foreground'
                        : expired
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : document.status === 'VALIDE'
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : document.status === 'REJETE'
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
                    }>
                      {!document ? 'Manquant' : expired ? 'Expire' : DOC_STATUS_LABELS[document.status as keyof typeof DOC_STATUS_LABELS]}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{agent.user?.firstName} {agent.user?.lastName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-mono font-medium">{agent.matricule}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Aeroport</p>
                <p className="font-medium">{agent.aeroport?.nom || agent.aeroportId}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Fonction</p>
                <p className="font-medium">{agent.fonction}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Decision finale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Le DLAA ne refait pas la verification QIP document par document. Il controle la recevabilite globale du dossier avant emission.
              </p>
              <Button asChild className="w-full" disabled={!isReadyForIssuance}>
                <Link to={`/app/dlaa/issue/${agent.id}`}>
                  <Award className="mr-2 h-4 w-4" />
                  Passer a l&apos;emission
                </Link>
              </Button>
              {!isReadyForIssuance && (
                <p className="text-xs text-center text-destructive">
                  Tous les documents requis doivent etre valides et non expires.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
