import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { agentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, MapPin, Briefcase, Plane, Calendar, Save, Loader2 } from 'lucide-react';
import { AGENT_STATUS_LABELS } from '@shared/types';
import type { Agent } from '@shared/types';

const AIRPORTS = [
  'Aeroport Blaise Diagne (DSS)',
  'Aeroport Leopold Sedar Senghor (DKR)',
  'Aeroport de Saint-Louis',
  'Aeroport de Ziguinchor',
  'Aeroport de Cap Skirring',
  'Aeroport de Tambacounda'
];

const ZONES = [
  'Zone publique',
  'Zone reservee',
  'Zone de surete a acces reglemente (ZSAR)',
  'Zone de trafic',
  'Zone de fret'
];

const FONCTIONS = [
  'Agent de piste',
  'Agent de surete',
  'Agent de handling',
  'Technicien aeronautique',
  'Controleur acces',
  'Agent de check-in',
  'Agent de fret',
  'Pompier aeroportuaire'
];

export default function AgentProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: 'Senegalaise',
    adresse: '',
    fonction: '',
    employeur: '',
    aeroport: '',
    zoneAcces: [] as string[]
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await agentsApi.list();
        if (response.data.length > 0) {
          const agentData = response.data[0];
          setAgent(agentData);
          setFormData({
            dateNaissance: agentData.dateNaissance.split('T')[0],
            lieuNaissance: agentData.lieuNaissance,
            nationalite: agentData.nationalite,
            adresse: agentData.adresse,
            fonction: agentData.fonction,
            employeur: agentData.employeur,
            aeroport: agentData.aeroport,
            zoneAcces: JSON.parse(agentData.zoneAcces as unknown as string || '[]')
          });
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleZoneChange = (zone: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      zoneAcces: checked 
        ? [...prev.zoneAcces, zone]
        : prev.zoneAcces.filter(z => z !== zone)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (agent) {
        await agentsApi.update(agent.id, formData);
        toast.success('Profil mis a jour avec succes');
      } else {
        await agentsApi.create(formData);
        toast.success('Profil cree avec succes');
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {agent ? 'Mon Profil Agent' : 'Creer mon profil agent'}
          </h1>
          <p className="text-muted-foreground">
            {agent 
              ? 'Consultez et modifiez vos informations professionnelles'
              : 'Remplissez ce formulaire pour creer votre profil agent'}
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

      {agent && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Matricule:</span>{' '}
                  <span className="font-mono font-medium">{agent.matricule}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Aeroport:</span>{' '}
                  <span className="font-medium">{agent.aeroport}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prenom</Label>
                  <Input value={user?.firstName || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={user?.lastName || ''} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleChange('dateNaissance', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieuNaissance">Lieu de naissance</Label>
                <Input
                  id="lieuNaissance"
                  placeholder="Ville de naissance"
                  value={formData.lieuNaissance}
                  onChange={(e) => handleChange('lieuNaissance', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalite">Nationalite</Label>
                <Input
                  id="nationalite"
                  placeholder="Nationalite"
                  value={formData.nationalite}
                  onChange={(e) => handleChange('nationalite', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  placeholder="Adresse complete"
                  value={formData.adresse}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fonction">Fonction</Label>
                <Select 
                  value={formData.fonction}
                  onValueChange={(value) => handleChange('fonction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez une fonction" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONCTIONS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeur">Employeur</Label>
                <Input
                  id="employeur"
                  placeholder="Nom de l'employeur"
                  value={formData.employeur}
                  onChange={(e) => handleChange('employeur', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aeroport">Aeroport d&apos;affectation</Label>
                <Select 
                  value={formData.aeroport}
                  onValueChange={(value) => handleChange('aeroport', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un aeroport" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRPORTS.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Zones d&apos;acces demandees</Label>
                <div className="space-y-2">
                  {ZONES.map(zone => (
                    <div key={zone} className="flex items-center gap-2">
                      <Checkbox
                        id={zone}
                        checked={formData.zoneAcces.includes(zone)}
                        onCheckedChange={(checked) => handleZoneChange(zone, checked as boolean)}
                      />
                      <Label htmlFor={zone} className="text-sm font-normal cursor-pointer">
                        {zone}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {agent ? 'Mettre a jour' : 'Creer mon profil'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
