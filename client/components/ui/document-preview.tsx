import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, X, Download } from 'lucide-react';
import { DOCUMENT_TYPE_LABELS, COUNTRY_LABELS } from '@shared/types';
import type { Document } from '@shared/types';

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: (id: string, status: 'VALIDE' | 'REJETE') => void;
  showActions?: boolean;
}

export function DocumentPreview({ 
  document, 
  isOpen, 
  onClose, 
  onValidate,
  showActions = false 
}: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!document) return null;

  const previewUrl = `/api/documents/${document.id}/preview`;
  const isImage = document.fileName?.match(/\.(jpg|jpeg|png|gif|svg)$/i);
  const isPDF = document.fileName?.match(/\.pdf$/i);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {DOCUMENT_TYPE_LABELS[document.type as keyof typeof DOCUMENT_TYPE_LABELS] || document.type}
          </DialogTitle>
          <DialogDescription>
            Document de {document.agent?.user?.firstName} {document.agent?.user?.lastName}
            {document.agent?.aeroport && (
              <span className="ml-2">
                • {COUNTRY_LABELS[document.agent.aeroport] || document.agent.aeroport}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{document.fileName}</Badge>
            <Badge className={
              document.status === 'EN_ATTENTE' ? 'bg-yellow-500/10 text-yellow-600' :
              document.status === 'VALIDE' ? 'bg-green-500/10 text-green-600' :
              'bg-red-500/10 text-red-600'
            }>
              {document.status === 'EN_ATTENTE' ? 'En attente' :
               document.status === 'VALIDE' ? 'Validé' : 'Rejeté'}
            </Badge>
          </div>

          {/* Preview Area */}
          <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[400px] flex items-center justify-center">
            {isImage ? (
              <img 
                src={previewUrl} 
                alt={document.fileName}
                className="max-w-full max-h-[500px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : isPDF ? (
              <iframe 
                src={previewUrl} 
                className="w-full h-[500px]"
                title={document.fileName}
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Prévisualisation non disponible</p>
                <p className="text-sm text-gray-400">{document.fileName}</p>
                <Button asChild variant="outline" className="mt-4">
                  <a href={previewUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && onValidate && document.status === 'EN_ATTENTE' && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => onValidate(document.id, 'REJETE')}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button 
                onClick={() => onValidate(document.id, 'VALIDE')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Valider
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
