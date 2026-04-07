import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import appLogo from "@/logo/logosansfond.png";
import { Lock, Mail, User, Phone, Calendar, MapPin, Briefcase, GraduationCap, Loader2, ArrowLeft, Home } from 'lucide-react';
import { referencesApi } from '@/lib/api';

const QUALIFICATIONS_OPTIONS = [
  'ADC',
  'APP',
  'ACC',
  'APS'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference data from API
  const [pays, setPays] = useState<Array<{id: string, nomFr: string}>>([]);
  const [aeroports, setAeroports] = useState<Array<{id: string, nom: string, ville: string, paysId: string}>>([]);
  const [aeroportsFiltered, setAeroportsFiltered] = useState<Array<{id: string, nom: string, ville: string, paysId: string}>>([]);
  const [isLoadingRefs, setIsLoadingRefs] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    // ATCO fields
    matricule: '',
    paysId: '',
    aeroportId: '',
    sexe: '',
    qualifications: [] as string[],
    whatsapp: '',
    dateNaissance: '',
  });

  // Fetch reference data on mount
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [paysRes, aerRes] = await Promise.all([
          referencesApi.pays(),
          referencesApi.aeroports()
        ]);
        setPays(paysRes.data);
        setAeroports(aerRes.data);
      } catch (error) {
        console.error('Error fetching references:', error);
        toast.error('Erreur lors du chargement des données de référence');
      } finally {
        setIsLoadingRefs(false);
      }
    };
    fetchReferences();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    // Validate ATCO required fields
    if (!formData.matricule || !formData.paysId || !formData.aeroportId) {
      toast.error('Veuillez remplir tous les champs obligatoires (matricule, pays, aeroport)');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        // ATCO fields
        matricule: formData.matricule,
        paysId: formData.paysId,
        aeroportId: formData.aeroportId,
        sexe: formData.sexe as 'M' | 'F' | undefined,
        qualifications: formData.qualifications.length > 0 ? formData.qualifications : undefined,
        whatsapp: formData.whatsapp || undefined,
        dateNaissance: formData.dateNaissance || undefined,
      });
      toast.success('Inscription reussie ! Bienvenue sur ATCOCLICLE');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left side - Logo & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-muted items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="group flex h-72 w-72 items-center justify-center rounded-[4rem] bg-white shadow-2xl ring-4 ring-border/50 transition-all duration-500 hover:rotate-6 hover:scale-110">
            <img src={appLogo} alt="ATCOCLICLE Logo" className="h-56 w-56 object-contain" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground drop-shadow-lg">ATCOCLICLE</h1>
          <p className="text-xl text-muted-foreground font-medium">ATCO Licence Validity Monitor</p>
          <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
            <p className="mb-4">Plateforme de gestions des licenses des controleurs aeriens de l'ASECNA</p>
            <div className="flex gap-4 justify-center">
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Securite</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Fiabilite</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Tracabilite</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Efficacite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4 overflow-y-auto">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
            <div className="group flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-xl ring-2 ring-border/50">
              <img src={appLogo} alt="ATCOCLICLE Logo" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">ATCOCLICLE</h1>
          </div>

          <CardHeader className="space-y-1 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </div>
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Creez votre compte controleur aerien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Prenom"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 bg-white/80 backdrop-blur"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+221 77 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 bg-white/80 backdrop-blur"
                  />
                </div>
              </div>

              {/* ATCO-specific fields */}
              <div className="border-t border-border/50 pt-4 mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Informations professionnelles ATCO
                </p>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="matricule">Matricule *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="matricule"
                      name="matricule"
                      placeholder="Ex: ATCO-2024-001"
                      value={formData.matricule}
                      onChange={handleChange}
                      className="pl-10 bg-white/80 backdrop-blur"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date de naissance</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="dateNaissance"
                        name="dateNaissance"
                        type="date"
                        value={formData.dateNaissance}
                        onChange={handleChange}
                        className="pl-10 bg-white/80 backdrop-blur"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexe">Sexe</Label>
                    <Select
                      value={formData.sexe}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sexe: value }))}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur">
                        <SelectValue placeholder="Selectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Feminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="paysId">Pays d&apos;affectation *</Label>
                    <Select
                      value={formData.paysId}
                      onValueChange={(value) => handleSelectChange('paysId', value)}
                      disabled={isLoadingRefs}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur">
                        <SelectValue placeholder={isLoadingRefs ? "Chargement..." : "Selectionnez un pays"} />
                      </SelectTrigger>
                      <SelectContent>
                        {pays.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nomFr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aeroportId">Aeroport *</Label>
                    <Select
                      value={formData.aeroportId}
                      onValueChange={(value) => handleSelectChange('aeroportId', value)}
                      disabled={!formData.paysId || aeroportsFiltered.length === 0}
                    >
                      <SelectTrigger className="bg-white/80 backdrop-blur">
                        <SelectValue placeholder={!formData.paysId ? "Selectionnez d'abord un pays" : "Selectionnez un aeroport"} />
                      </SelectTrigger>
                      <SelectContent>
                        {aeroportsFiltered.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.nom} ({a.ville})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      placeholder="+221 77 123 4567"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="pl-10 bg-white/80 backdrop-blur"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
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
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              qualifications: prev.qualifications.includes(qual)
                                ? prev.qualifications.filter(q => q !== qual)
                                : [...prev.qualifications, qual]
                            }));
                          }}
                        />
                        <GraduationCap className="h-3 w-3" />
                        {qual}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isLoadingRefs}>
                {isLoading || isLoadingRefs ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Deja un compte ?</span>{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
