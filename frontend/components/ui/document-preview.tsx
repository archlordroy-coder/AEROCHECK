import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, FileText, X, Download, GripVertical } from 'lucide-react';
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
  const [previewSize, setPreviewSize] = useState({ width: 800, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: previewSize.width,
      startHeight: previewSize.height
    };
  }, [previewSize]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current) return;
    
    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;
    
    setPreviewSize({
      width: Math.max(400, resizeRef.current.startWidth + deltaX),
      height: Math.max(300, resizeRef.current.startHeight + deltaY)
    });
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeRef.current = null;
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [handleResizeEnd, handleResizeMove, isResizing]);

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
                • {COUNTRY_LABELS[document.agent.aeroport.code || ''] || document.agent.aeroport.nom}
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

          {/* Resizable Preview Area */}
          <div 
            ref={containerRef}
            className="border rounded-lg overflow-hidden bg-gray-50 relative"
            style={{ 
              width: previewSize.width, 
              height: previewSize.height,
              minWidth: 400,
              minHeight: 300,
              maxWidth: '100%'
            }}
          >
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {isImage ? (
                <img 
                  src={previewUrl} 
                  alt={document.fileName}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : isPDF ? (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full"
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
            
            {/* Resize Handle */}
            <div
              className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors rounded-tl-lg ${isResizing ? 'bg-primary/30' : ''}`}
              onMouseDown={handleResizeStart}
              title="Glissez pour redimensionner"
            >
              <GripVertical className="h-4 w-4 text-primary rotate-45" />
            </div>
            
            {/* Size indicator */}
            <div className="absolute bottom-1 left-2 text-xs text-muted-foreground bg-white/80 px-2 py-0.5 rounded">
              {previewSize.width} × {previewSize.height}
            </div>
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
