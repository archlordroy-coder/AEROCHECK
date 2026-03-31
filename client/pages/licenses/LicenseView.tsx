import { useEffect, useState } from 'react';
import { agentsApi, licensesApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Download, 
  QrCode, 
  Calendar,
  User,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LICENSE_STATUS_LABELS } from '@shared/types';
import type { Agent, License } from '@shared/types';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function LicenseView() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentRes = await agentsApi.list();
        if (agentRes.data.length > 0) {
          setAgent(agentRes.data[0]);
          
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
            Vous devez d&apos;abord creer votre profil agent.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!license) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ma Licence</h1>
          <p className="text-muted-foreground">
            Votre licence DLAA n&apos;a pas encore ete emise
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CreditCard className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-medium">Licence non disponible</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Votre dossier est en cours de traitement. Une fois tous vos documents valides
              et votre verification QIP terminee, votre licence DLAA sera emise.
            </p>
            <Badge className="mt-4" variant="outline">
              Statut actuel: {agent.status.replace(/_/g, ' ')}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilExpiry = differenceInDays(new Date(license.dateExpiration), new Date());
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ma Licence DLAA</h1>
        <p className="text-muted-foreground">
          Document de Licence d&apos;Agent Aeroportuaire
        </p>
      </div>

      {/* Status alert */}
      {isExpired && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-600">Licence expiree</p>
              <p className="text-sm text-muted-foreground">
                Votre licence a expire. Contactez votre employeur pour le renouvellement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isExpiringSoon && !isExpired && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-600">Expiration proche</p>
              <p className="text-sm text-muted-foreground">
                Votre licence expire dans {daysUntilExpiry} jours. Pensez au renouvellement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* License card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">ASECNA - AEROCHECK</p>
                <h2 className="text-xl font-bold mt-1">Licence DLAA</h2>
              </div>
              <CreditCard className="h-10 w-10 opacity-80" />
            </div>
          </div>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Titulaire</span>
                </div>
                <span className="font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Numero</span>
                </div>
                <span className="font-mono font-medium">{license.numero}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Aeroport</span>
                </div>
                <span className="font-medium text-sm">{agent.aeroport}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fonction</span>
                </div>
                <span className="font-medium">{agent.fonction}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Validite</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {format(new Date(license.dateEmission), 'dd/MM/yyyy')} - {format(new Date(license.dateExpiration), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge className={
                  license.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {license.status === 'ACTIVE' && <CheckCircle className="mr-1 h-3 w-3" />}
                  {LICENSE_STATUS_LABELS[license.status as keyof typeof LICENSE_STATUS_LABELS]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code de verification
            </CardTitle>
            <CardDescription>
              Scannez ce code pour verifier l&apos;authenticite de la licence
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {license.qrCode ? (
              <img 
                src={license.qrCode} 
                alt="QR Code de la licence"
                className="h-48 w-48 rounded-lg border p-2"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-muted">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Telecharger PDF
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ce QR code contient les informations cryptees de votre licence
              et permet une verification instantanee par les autorites.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations complementaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Matricule agent</p>
              <p className="font-mono font-medium">{agent.matricule}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employeur</p>
              <p className="font-medium">{agent.employeur}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zones d&apos;acces</p>
              <p className="font-medium text-sm">
                {JSON.parse(agent.zoneAcces as unknown as string || '[]').join(', ') || 'Non definies'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
