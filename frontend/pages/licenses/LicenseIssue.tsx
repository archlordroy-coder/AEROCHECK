import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agentsApi, licensesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Award, 
  User, 
  FileText,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { AGENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@shared/types';
import type { Agent } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function LicenseIssue() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validityYears, setValidityYears] = useState('2');

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      
      try {
        const response = await agentsApi.get(id);
        if (response.success && response.data) {
          setAgent(response.data);
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast.error('Agent non trouve');
        navigate('/app/dlaa');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id, navigate]);

  const handleIssueLicense = async () => {
    if (!agent) return;

    setIsSubmitting(true);

    try {
      const response = await licensesApi.issue({
        agentId: agent.id,
        validityYears: parseInt(validityYears)
      });

      if (response.success) {
        toast.success('Licence emise avec succes');
        navigate('/app/dlaa');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'emission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  const allDocsValid = agent.documents?.every(d => d.status === 'VALIDE') || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/dlaa')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Emission de licence DLAA
          </h1>
          <p className="text-muted-foreground">
            Emettre une licence pour {agent.user?.firstName} {agent.user?.lastName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations de l&apos;agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {agent.user?.firstName} {agent.user?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matricule</p>
                  <p className="font-mono font-medium">{agent.matricule}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonction</p>
                  <p className="font-medium">{agent.fonction}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employeur</p>
                  <p className="font-medium">{agent.employeur}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aeroport</p>
                  <p className="font-medium">{agent.aeroport}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge className="mt-1 bg-green-500/10 text-green-600 border-green-500/20">
                    {AGENT_STATUS_LABELS[agent.status as keyof typeof AGENT_STATUS_LABELS]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents verifies
              </CardTitle>
              <CardDescription>
                Tous les documents ont ete valides par le QIP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agent.documents?.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        {DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS]}
                      </span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Valide
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issue form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Emettre la licence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duree de validite</Label>
                <Select value={validityYears} onValueChange={setValidityYears}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 an</SelectItem>
                    <SelectItem value="2">2 ans</SelectItem>
                    <SelectItem value="3">3 ans</SelectItem>
                    <SelectItem value="5">5 ans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date d&apos;emission</span>
                  <span className="font-medium">
                    {format(new Date(), 'dd/MM/yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date d&apos;expiration</span>
                  <span className="font-medium">
                    {format(
                      new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(validityYears))),
                      'dd/MM/yyyy',
                      { locale: fr }
                    )}
                  </span>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleIssueLicense}
                disabled={isSubmitting || !allDocsValid}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Emettre la licence
                  </>
                )}
              </Button>

              {!allDocsValid && (
                <p className="text-xs text-center text-destructive">
                  Tous les documents doivent etre valides
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                La licence DLAA sera generee avec un QR code unique permettant
                la verification de son authenticite.
              </p>
              <p>
                L&apos;agent recevra une notification et pourra telecharger sa licence
                depuis son espace personnel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
