import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { agentsApi, referencesApi, documentsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, MapPin, Briefcase, Plane, Calendar, Save, Loader2, Camera, FileText, Award, Clock, Upload, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { AGENT_STATUS_LABELS, LICENSE_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@shared/types';
import type { Agent, Document as AgentDocument, License } from '@shared/types';

const QUALIFICATIONS_OPTIONS = ['ADC', 'APP', 'ACC', 'APS'];

const FONCTIONS = [
  'Controleur Aerien',
  'Instructeur',
  'Superviseur'
];

interface Nationalite {
  id: string;
  code: string;
  nom: string;
}

interface Employeur {
  id: string;
  nom: string;
}

interface Pays {
  id: string;
  code: string;
  nom: string;
  nomFr: string;
}

interface Aeroport {
  id: string;
  code: string;
  nom: string;
  ville: string;
  paysId: string;
}

export default function AgentProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reference data from API
  const [nationalites, setNationalites] = useState<Nationalite[]>([]);
  const [employeurs, setEmployeurs] = useState<Employeur[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [aeroports, setAeroports] = useState<Aeroport[]>([]);
  const [aeroportsFiltered, setAeroportsFiltered] = useState<Aeroport[]>([]);
  
  const [formData, setFormData] = useState({
    dateNaissance: '',
    nationaliteId: '',
    adresse: '',
    fonction: '',
    employeurId: '',
    paysId: '',
    aeroportId: '',
    sexe: '',
    qualifications: [] as string[],
    whatsapp: ''
  });

  // Documents and licenses
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reference data
        const [natRes, empRes, paysRes, aerRes] = await Promise.all([
          referencesApi.nationalites(),
          referencesApi.employeurs(),
          referencesApi.pays(),
          referencesApi.aeroports()
        ]);
        
        setNationalites(natRes.data);
        setEmployeurs(empRes.data);
        setPays(paysRes.data);
        setAeroports(aerRes.data);

        // Fetch agent profile
        const response = await agentsApi.list();
        if (response.data.length > 0) {
          const agentData = response.data[0];
          setAgent(agentData);
          setFormData({
            dateNaissance: agentData.dateNaissance.split('T')[0],
            nationaliteId: agentData.nationaliteId || '',
            adresse: agentData.adresse,
            fonction: agentData.fonction,
            employeurId: agentData.employeurId || '',
            paysId: agentData.paysId || '',
            aeroportId: agentData.aeroportId || '',
            sexe: agentData.sexe || '',
            qualifications: agentData.qualifications || [],
            whatsapp: agentData.whatsapp || ''
          });
          
          // Filter airports for the selected country
          if (agentData.paysId) {
            const filtered = aerRes.data.filter((a: Aeroport) => a.paysId === agentData.paysId);
            setAeroportsFiltered(filtered);
          }

          // Fetch documents and licenses
          const [docsRes, licensesRes] = await Promise.all([
            documentsApi.list({ agentId: agentData.id }),
            agentsApi.getLicenses(agentData.id)
          ]);
          setDocuments(docsRes.data);
          setLicenses(licensesRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Cascade: when pays changes, filter airports and reset aeroport selection
      if (field === 'paysId') {
        const filtered = aeroports.filter(a => a.paysId === value);
        setAeroportsFiltered(filtered);
        newData.aeroportId = ''; // Reset airport selection
      }
      
      return newData;
    });
  };

  const handleQualificationChange = (qual: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      qualifications: checked 
        ? [...prev.qualifications, qual]
        : prev.qualifications.filter(q => q !== qual)
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      setPhotoFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile || !agent) return;
    
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('type', 'PHOTO_IDENTITE');
      await documentsApi.upload(agent.id, formData);
      toast.success('Photo téléchargée avec succès');
      
      // Clean up preview URL
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      
      // Refresh agent data to get updated photoUrl
      const agentRes = await agentsApi.getById(agent.id);
      setAgent(agentRes.data);
      // Refresh documents
      const docsRes = await documentsApi.list({ agentId: agent.id });
      setDocuments(docsRes.data);
    } catch (error) {
      toast.error('Erreur lors du téléchargement de la photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (agent) {
        await agentsApi.update(agent.id, formData);
        toast.success('Profil mis a jour avec succes');
      } else {
        // Generate matricule for new agent
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const matricule = `AG${year}${random}`;
        
        await agentsApi.create({ 
          ...formData, 
          matricule,
          lieuNaissance: 'Non specifie',
          zoneAcces: [],
          emailVerified: false
        });
        toast.success('Profil cree avec succes');
        await refreshUser();
        navigate('/app/dashboard');
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
        <>
          {/* Photo and Summary Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                {/* Photo Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div 
                      className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => agent.photoUrl && window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/agents/${agent.id}/photo`, '_blank')}
                    >
                      {photoPreview ? (
                        <img 
                          src={photoPreview}
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      ) : agent.photoUrl ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/agents/${agent.id}/photo`}
                          alt="Photo de profil" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.classList.add('photo-error');
                          }}
                        />
                      ) : (
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="photo-error hidden h-full w-full flex items-center justify-center">
                        <Camera className="h-12 w-12 text-muted-foreground" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  {photoFile && (
                    <div className="w-full space-y-2">
                      <p className="text-xs text-center text-muted-foreground">
                        {photoFile.name}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={uploadPhoto} className="flex-1">
                          <Upload className="mr-1 h-3 w-3" />
                          Confirmer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            if (photoPreview) URL.revokeObjectURL(photoPreview);
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                  {agent.photoUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/agents/${agent.id}/photo`, '_blank')}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Voir la photo
                    </Button>
                  )}
                </div>

                {/* Agent Info Summary */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Matricule</p>
                    <p className="font-mono font-medium">{agent.matricule}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sexe</p>
                    <p className="font-medium">{agent.sexe === 'M' ? 'Masculin' : agent.sexe === 'F' ? 'Feminin' : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Aeroport</p>
                    <p className="font-medium">{agent.aeroport?.nom || agent.aeroportId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pays</p>
                    <p className="font-medium">{agent.pays?.nom || agent.paysId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qualifications</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(agent.qualifications) && agent.qualifications.length > 0 ? (
                        agent.qualifications.map(q => (
                          <Badge key={q} variant="outline" className="text-xs">{q}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{agent.whatsapp || '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents & Licenses */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Documents soumis ({documents.length})
                </CardTitle>
                <CardDescription>
                  Etat de votre dossier documentaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun document soumis
                  </p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] || doc.type}</span>
                        </div>
                        <Badge className={
                          doc.status === 'VALIDE' ? 'bg-green-500/10 text-green-600' :
                          doc.status === 'REJETE' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }>
                          {doc.status === 'VALIDE' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {doc.status === 'REJETE' && <XCircle className="mr-1 h-3 w-3" />}
                          {doc.status === 'EN_ATTENTE' && <Clock className="mr-1 h-3 w-3" />}
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* License History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4" />
                  Historique des licences ({licenses.length})
                </CardTitle>
                <CardDescription>
                  Vos licences delivrees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {licenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune licence delivree
                  </p>
                ) : (
                  <div className="space-y-2">
                    {licenses.map((license) => (
                      <div key={license.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{license.numero}</p>
                          <p className="text-xs text-muted-foreground">
                            Exp: {new Date(license.dateExpiration).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Badge className={
                          license.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' :
                          license.status === 'EXPIREE' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }>
                          {LICENSE_STATUS_LABELS[license.status as keyof typeof LICENSE_STATUS_LABELS] || license.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="sexe">Sexe</Label>
                  <Select 
                    value={formData.sexe}
                    onValueChange={(value) => handleChange('sexe', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Feminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalite">Nationalite</Label>
                <Select 
                  value={formData.nationaliteId}
                  onValueChange={(value) => handleChange('nationaliteId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez une nationalite" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalites.map((n) => (
                      <SelectItem key={n.id} value={n.id}>{n.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="+221 77 123 4567"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
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
                <Select 
                  value={formData.employeurId}
                  onValueChange={(value) => handleChange('employeurId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un employeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeurs.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pays">Pays d&apos;affectation</Label>
                <Select 
                  value={formData.paysId}
                  onValueChange={(value) => handleChange('paysId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {pays.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nomFr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aeroport">Aeroport d&apos;affectation</Label>
                <Select 
                  value={formData.aeroportId}
                  onValueChange={(value) => handleChange('aeroportId', value)}
                  disabled={!formData.paysId || aeroportsFiltered.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.paysId ? "Selectionnez un aeroport" : "Selectionnez d'abord un pays"} />
                  </SelectTrigger>
                  <SelectContent>
                    {aeroportsFiltered.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nom} ({a.ville})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Qualifications ATCO</Label>
                <div className="flex flex-wrap gap-2">
                  {QUALIFICATIONS_OPTIONS.map((qual) => (
                    <label
                      key={qual}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        formData.qualifications.includes(qual)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.qualifications.includes(qual)}
                        onChange={(e) => handleQualificationChange(qual, e.target.checked)}
                      />
                      {qual}
                    </label>
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
