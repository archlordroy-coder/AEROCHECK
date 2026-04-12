import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { agentsApi, referencesApi, documentsApi, resolveApiAssetUrl } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, MapPin, Briefcase, Plane, Calendar, Save, Loader2, FileText, Award, Clock, CheckCircle, XCircle, AlertCircle, Camera, Shield } from 'lucide-react';
import { AGENT_STATUS_LABELS, LICENSE_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@shared/types';
import type { Agent, Document as AgentDocument, License } from '@shared/types';
import { filterLicenseDocuments, getRequiredLicenseDocumentTypes, requiresJustificatif } from '@/lib/priority-documents';
import { getLicenseMonitoringDate } from '@/lib/license-validity';

const QUALIFICATIONS_OPTIONS = ['ADC', 'APP', 'APS', 'ACP', 'ACS', 'ARP'];
const GRADES = ['STAGIAIRE', 'CADET', 'JUNIOR', 'SENIOR'] as const;
const POSTES_ADMIN = ['AUCUN', 'ATCO', 'CHEF_UNITE_ENF', 'ENA', 'QIP', 'CHARGE_EN_ROUTE', 'CHARGE_EXPLOITATION_NA'] as const;
const LICENSE_STATUSES = ['VALIDE', 'EXPIREE', 'SUSPENDUE'] as const;

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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Reference data from API
  const [nationalites, setNationalites] = useState<Nationalite[]>([]);
  const [pays, setPays] = useState<Pays[]>([]);
  const [aeroports, setAeroports] = useState<Aeroport[]>([]);
  const [aeroportsFiltered, setAeroportsFiltered] = useState<Aeroport[]>([]);
  
  const [formData, setFormData] = useState({
    dateNaissance: '',
    nationaliteId: '',
    adresse: '',
    fonction: 'Controlleur de la circulation aerienne',
    grade: '' as '' | (typeof GRADES)[number],
    instructeur: false,
    posteAdministratif: 'AUCUN' as (typeof POSTES_ADMIN)[number],
    employeurId: 'emp-asecna',
    paysId: '',
    aeroportId: '',
    sexe: '' as '' | 'M' | 'F',
    qualifications: [] as string[],
    licenseStatus: 'VALIDE' as (typeof LICENSE_STATUSES)[number],
    whatsapp: ''
  });

  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Documents and licenses
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const requiredDocumentTypes = getRequiredLicenseDocumentTypes(agent);
  const priorityDocuments = filterLicenseDocuments(documents).filter((document) => requiredDocumentTypes.includes(document.type));
  const profilePhotoUrl = resolveApiAssetUrl(agent?.photoUrl);
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.trim() || 'AG';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reference data
        const [natRes, paysRes, aerRes] = await Promise.all([
          referencesApi.nationalites(),
          referencesApi.pays(),
          referencesApi.aeroports()
        ]);
        
        setNationalites(natRes.data);
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
            grade: (agentData.grade as '' | (typeof GRADES)[number]) || '',
            instructeur: Boolean(agentData.instructeur),
            posteAdministratif: (agentData.posteAdministratif as (typeof POSTES_ADMIN)[number]) || 'AUCUN',
            employeurId: agentData.employeurId || '',
            paysId: agentData.paysId || '',
            aeroportId: agentData.aeroportId || '',
            sexe: agentData.sexe || '',
            qualifications: agentData.qualifications || [],
            licenseStatus: (agentData.licenseStatus as (typeof LICENSE_STATUSES)[number]) || 'VALIDE',
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

  const handleChange = (field: string, value: string | boolean) => {
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !agent) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    setIsUploadingPhoto(true);

    try {
      const response = await agentsApi.uploadPhoto(agent.id, formData);
      if (response.success && response.data) {
        setAgent(response.data);
        toast.success('Photo de profil mise a jour');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const required = ['dateNaissance', 'nationaliteId', 'adresse', 'paysId', 'aeroportId'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error('Veuillez remplir tous les champs obligatoires (Pays, Aéroport, Nationalité, Date de naissance, Adresse)');
      setIsSaving(false);
      return;
    }

    try {
      if (agent) {
        const payload = {
          ...formData,
          grade: formData.grade || undefined,
          sexe: formData.sexe || undefined,
        };
        await agentsApi.update(agent.id, payload);
        toast.success('Profil mis a jour avec succes');
      } else {
        // Generate matricule for new agent
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const matricule = `AG${year}${random}`;
        
        const payload = {
          ...formData,
          grade: formData.grade || undefined,
          sexe: formData.sexe || undefined,
          matricule,
          lieuNaissance: 'Non specifie',
          zoneAcces: [],
          emailVerified: false
        };
        await agentsApi.create(payload);
        toast.success('Profil cree avec succes');
        await refreshUser();
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      // Improved error handling to show specific backend errors
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new) {
      toast.error('Veuillez remplir les deux champs de mot de passe');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Mot de passe mis à jour avec succès');
        setPasswords({ current: '', new: '' });
      } else {
        toast.error(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      toast.error('Erreur technique lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
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
      
      {/* Agent-specific view: Show photo and summary only for Agent/QIP */}
      {(user?.role === 'AGENT' || user?.role === 'QIP') && (
        <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-xl border border-dashed p-5 text-center">
              <Avatar className="h-28 w-28 border bg-muted">
                <AvatarImage src={profilePhotoUrl} alt="Photo de profil agent" />
                <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">Photo de profil</p>
                <p className="text-xs text-muted-foreground">
                  {agent?.photoUrl ? 'La photo est stockee sur le backend.' : 'Ajoutez une photo qui sera stockee sur le backend.'}
                </p>
              </div>
              <div className="w-full">
                <Label
                  htmlFor="agent-photo-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {isUploadingPhoto ? 'Upload en cours...' : 'Changer la photo'}
                </Label>
                <Input
                  id="agent-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!agent || isUploadingPhoto}
                  onChange={handlePhotoUpload}
                />
              </div>
              {!agent && (
                <p className="text-[10px] text-amber-600 mt-2 italic">
                  L'upload sera disponible après la création de votre profil.
                </p>
              )}
            </div>

            <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Matricule</p>
                <p className="font-mono font-medium">{agent?.matricule || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sexe</p>
                <p className="font-medium">{formData.sexe === 'M' ? 'Masculin' : formData.sexe === 'F' ? 'Feminin' : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aeroport</p>
                <p className="font-medium">
                  {agent?.aeroport?.nom || aeroports.find(a => a.id === formData.aeroportId)?.nom || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pays</p>
                <p className="font-medium">
                  {agent?.pays?.nom || pays.find(p => p.id === formData.paysId)?.nom || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Qualifications</p>
                <div className="flex flex-wrap gap-1">
                  {formData.qualifications.length > 0 ? (
                    formData.qualifications.map(q => (
                      <Badge key={q} variant="outline" className="text-xs">{q}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{formData.whatsapp || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

      {agent && (
        <>
          {/* Documents & Licenses */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Documents requis ({priorityDocuments.length}/{requiredDocumentTypes.length})
                </CardTitle>
                <CardDescription>
                  Certificat medical, controle de competence, niveau d&apos;anglais
                  {requiresJustificatif(agent) ? ' et justificatif de nomination' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {priorityDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun document soumis
                  </p>
                ) : (
                  <div className="space-y-2">
                    {priorityDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{DOCUMENT_TYPE_LABELS[doc.type as keyof typeof DOCUMENT_TYPE_LABELS] || doc.type}</span>
                          {doc.issuedAt && (
                            <span className="text-xs text-muted-foreground">
                              Delivre le {new Date(doc.issuedAt).toLocaleDateString('fr-FR')}
                              {doc.expiresAt ? ` • Expire le ${new Date(doc.expiresAt).toLocaleDateString('fr-FR')}` : ' • Valide a vie'}
                            </span>
                          )}
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
                    {licenses.map((license) => {
                      const nextMonitoringDate = getLicenseMonitoringDate(agent, license);

                      return (
                        <div key={license.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">{license.numero}</p>
                          <p className="text-xs text-muted-foreground">
                            {nextMonitoringDate
                              ? `Prochaine echeance: ${nextMonitoringDate.toLocaleDateString('fr-FR')}`
                              : 'Validite liee aux documents'}
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
                      );
                    })}
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
                <Input id="fonction" value="Controlleur de la circulation aerienne" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade === 'STAGIAIRE' ? 'Stagiaire' : grade === 'CADET' ? 'Cadet' : grade === 'JUNIOR' ? 'Junior' : 'Senior'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructeur">Instructeur</Label>
                <Select value={formData.instructeur ? 'OUI' : 'NON'} onValueChange={(value) => handleChange('instructeur', value === 'OUI')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON">Non</SelectItem>
                    <SelectItem value="OUI">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="posteAdministratif">Poste administratif</Label>
                <Select value={formData.posteAdministratif} onValueChange={(value) => handleChange('posteAdministratif', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un poste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUCUN">NULL</SelectItem>
                    <SelectItem value="ATCO">ATCO</SelectItem>
                    <SelectItem value="CHEF_UNITE_ENF">Chef unite ENF</SelectItem>
                    <SelectItem value="ENA">ENA</SelectItem>
                    <SelectItem value="QIP">QIP</SelectItem>
                    <SelectItem value="CHARGE_EN_ROUTE">Charge en route</SelectItem>
                    <SelectItem value="CHARGE_EXPLOITATION_NA">Charge d&apos;exploitation NA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeur">Employeur</Label>
                <div className="rounded-md bg-muted px-3 py-2 text-sm font-medium">
                  ASECNA
                </div>
                <p className="text-[10px] text-muted-foreground">L'employeur unique pour ce profil est l'ASECNA.</p>
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
                <Label>Qualifications</Label>
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
              <div className="space-y-2">
                <Label htmlFor="licenseStatus">Etat de la licence</Label>
                <Select value={formData.licenseStatus} onValueChange={(value) => handleChange('licenseStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez l'etat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VALIDE">Valide</SelectItem>
                    <SelectItem value="EXPIREE">Expiree</SelectItem>
                    <SelectItem value="SUSPENDUE">Suspendue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(formData.instructeur || formData.posteAdministratif !== 'AUCUN') && (
                <p className="text-xs text-amber-600">
                  Si vous etes instructeur ou occupez un poste administratif, ajoutez un justificatif de nomination dans les documents.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Section (Change Password) */}
        {agent && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Securité du compte
              </CardTitle>
              <CardDescription>
                Modifiez votre mot de passe pour securiser votre acces
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••"
                    value={passwords.new}
                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        )}

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
