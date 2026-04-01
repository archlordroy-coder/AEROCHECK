import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentsApi, documentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileUp, Upload, CheckCircle, Clock, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, DOC_STATUS_LABELS } from '@shared/types';
import type { Agent, Document, DocumentType } from '@shared/types';

const DOC_TYPES: DocumentType[] = [
  'PIECE_IDENTITE',
  'PHOTO_IDENTITE',
  'CASIER_JUDICIAIRE',
  'CERTIFICAT_MEDICAL',
  'ATTESTATION_FORMATION',
  'CONTRAT_TRAVAIL'
];

export default function DocumentSubmit() {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | ''>('');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentRes = await agentsApi.list();
        if (agentRes.data.length > 0) {
          setAgent(agentRes.data[0]);
          const docsRes = await documentsApi.list({ agentId: agentRes.data[0].id });
          setDocuments(docsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAvailableTypes = () => {
    const submittedTypes = documents
      .filter(d => d.status !== 'REJETE')
      .map(d => d.type);
    return DOC_TYPES.filter(t => !submittedTypes.includes(t));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileType(file.type);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent || !selectedType || !fileName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      await documentsApi.submit({
        agentId: agent.id,
        type: selectedType,
        fileName
      });
      
      toast.success('Document soumis avec succes');
      
      // Refresh documents
      const docsRes = await documentsApi.list({ agentId: agent.id });
      setDocuments(docsRes.data);
      
      // Reset form
      setSelectedType('');
      setFileName('');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setFileType(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALIDE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJETE':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDE':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'REJETE':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
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
    return (
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Profil agent requis
          </CardTitle>
          <CardDescription>
            Vous devez d&apos;abord creer votre profil agent avant de pouvoir soumettre des documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/profile')}>
            Creer mon profil
          </Button>
        </CardContent>
      </Card>
    );
  }

  const availableTypes = getAvailableTypes();
  const progress = (documents.filter(d => d.status !== 'REJETE').length / DOC_TYPES.length) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Soumettre des documents
          </h1>
          <p className="text-muted-foreground">
            Telechargez les documents requis pour votre dossier
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Progression du dossier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-2 flex justify-between text-sm">
                <span>{documents.filter(d => d.status !== 'REJETE').length}/{DOC_TYPES.length} documents</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div 
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submit form */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/10 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileUp className="h-5 w-5" />
                Nouveau document
              </CardTitle>
              <CardDescription>
                Selectionnez le type et telechargez votre document
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {availableTypes.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="mb-4 h-12 w-12 text-green-600" />
                  <h3 className="text-lg font-medium">Tous les documents soumis</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous avez soumis tous les documents requis
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="docType">Type de document</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) => setSelectedType(value as DocumentType)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {DOCUMENT_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier (PDF, JPG, PNG)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="h-11 flex-1 cursor-pointer"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full shadow-md"
                    disabled={!selectedType || !fileName || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Soumettre le document
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {previewUrl && (
            <Card className="animate-fade-in border-primary/10 shadow-lg overflow-hidden">
              <CardHeader className="bg-primary/5 py-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Apercu: {fileName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {fileType?.startsWith('image/') ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[400px] object-contain bg-muted/30" />
                ) : fileType === 'application/pdf' ? (
                  <iframe src={previewUrl} className="w-full h-[400px]" title="PDF Preview" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <FileUp className="h-12 w-12 mb-4 opacity-20" />
                    <p>Apercu non disponible pour ce type de fichier</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documents list */}
        <Card>
          <CardHeader>
            <CardTitle>Documents requis</CardTitle>
            <CardDescription>Statut de chaque document</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DOC_TYPES.map((docType) => {
                const doc = documents.find(d => d.type === docType);
                
                return (
                  <div 
                    key={docType}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {doc ? getStatusIcon(doc.status) : (
                        <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/50" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {DOCUMENT_TYPE_LABELS[docType]}
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
      </div>
    </div>
  );
}
