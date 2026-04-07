import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Download,
  Shield,
  Award,
  Printer
} from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, AGENT_STATUS_LABELS } from '@shared/types';
import type { Document } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DocumentVerify() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'VALIDE' | 'REJETE' | null>(null);

  const userRole = user?.role || 'QIP';
  const isQIP = userRole === 'QIP' || userRole === 'SUPER_ADMIN';
  const isDLAA = userRole === 'DLAA' || userRole === 'DNA';

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        const response = await documentsApi.get(id);
        if (response.success && response.data) {
          setDocument(response.data);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Document non trouve');
        navigate('/app/qip');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  const handleValidate = async (status: 'VALIDE' | 'REJETE') => {
    if (!document) return;
    
    if (status === 'REJETE' && !comment.trim()) {
      toast.error(`Veuillez indiquer la raison du rejet ${isQIP ? 'QIP' : 'DLAA'}`);
      return;
    }

    setIsSubmitting(true);
    setAction(status);

    try {
      await documentsApi.validate(document.id, {
        status,
        comment: comment.trim() || undefined
      });
      
      toast.success(status === 'VALIDE' 
        ? `Document valide ${isQIP ? 'par QIP' : 'par DLAA'}` 
        : `Document rejete ${isQIP ? 'par QIP' : 'par DLAA'}`
      );
      navigate(isQIP ? '/app/qip' : '/app/dlaa');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la validation');
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
          <h3 className="text-lg font-medium">Document non trouve</h3>
          <Button onClick={() => navigate('/app/qip')} className="mt-4">
            Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(isQIP ? '/app/qip' : '/app/dlaa')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {isQIP ? (
              <>
                <Shield className="h-6 w-6 text-yellow-600" />
                Verification QIP
              </>
            ) : (
              <>
                <Award className="h-6 w-6 text-primary" />
                Verification Finale DLAA
              </>
            )}
          </h1>
          <p className="text-muted-foreground">
            {isQIP 
              ? 'Examinez et validez ce document (Premier niveau)' 
              : 'Verification finale avant delivrance de licence'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {DOCUMENT_TYPE_LABELS[document.type as keyof typeof DOCUMENT_TYPE_LABELS]}
              </CardTitle>
              <CardDescription>
                Soumis le {format(new Date(document.createdAt), 'dd MMMM yyyy a HH:mm', { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Document preview */}
              <div className="flex flex-col rounded-lg border bg-muted/20 overflow-hidden">
                <div className="bg-muted/40 p-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{document.fileName}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Telecharger
                  </Button>
                </div>

                <div className="aspect-[4/3] w-full flex items-center justify-center bg-white">
                  {document.fileName.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img
                      src={`/api/documents/${document.id}/preview`}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Apercu+Indisponible';
                      }}
                    />
                  ) : document.fileName.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={`/api/documents/${document.id}/preview`}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="text-center p-12">
                      <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-20" />
                      <p className="mt-4 text-sm font-medium text-muted-foreground">
                        Aperçu non disponible pour ce type de fichier
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isQIP ? (
                  <>
                    <Shield className="h-5 w-5 text-yellow-600" />
                    Decision QIP
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 text-primary" />
                    Decision Finale DLAA
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isQIP 
                  ? 'Validez ou rejetez ce document au niveau QIP'
                  : 'Validation finale avant emission de licence'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment">Commentaire (obligatoire en cas de rejet)</Label>
                <Textarea
                  id="comment"
                  placeholder="Ajoutez un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleValidate('VALIDE')}
                  disabled={isSubmitting}
                  className={`flex-1 ${isQIP ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {isSubmitting && action === 'VALIDE' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      {isQIP ? <Shield className="mr-2 h-4 w-4" /> : <Award className="mr-2 h-4 w-4" />}
                      {isQIP ? 'Valider QIP' : 'Valider DLAA'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleValidate('REJETE')}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="flex-1"
                >
                  {isSubmitting && action === 'REJETE' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejeter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historique Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.validations.map((validation) => (
                  <div key={validation.id} className="flex items-start gap-3">
                    {validation.status === 'VALIDE' ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                    ) : validation.status === 'REJETE' ? (
                      <XCircle className="mt-0.5 h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="mt-0.5 h-4 w-4 text-yellow-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {validation.validator?.firstName} {validation.validator?.lastName}
                        </span>
                        <span className="text-muted-foreground"> - {validation.status}</span>
                      </p>
                      {validation.comment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {validation.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(validation.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {document.agent?.user?.firstName} {document.agent?.user?.lastName}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-mono font-medium">{document.agent?.matricule}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Statut actuel</p>
                <Badge className="mt-1">
                  {AGENT_STATUS_LABELS[document.agent?.status as keyof typeof AGENT_STATUS_LABELS] || document.agent?.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">Aeroport</p>
                <p className="text-sm">{document.agent?.aeroport?.nom || document.agent?.aeroportId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
