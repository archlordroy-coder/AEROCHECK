import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
const appLogo = "/logo/logosansfond.png";
import { Lock, Mail, ArrowLeft, Home, Shield, FileSearch, Award, User, TrendingUp, Plane, Globe } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion reussie');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
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
            <img src={appLogo} alt="AEROCHECK Logo" className="h-56 w-56 object-contain" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground drop-shadow-lg">AEROCHECK</h1>
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

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          {/* Mobile logo (visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
            <div className="group flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-xl ring-2 ring-border/50">
              <img src={appLogo} alt="AEROCHECK Logo" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">AEROCHECK</h1>
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
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour acceder a votre espace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Pas encore de compte ?</span>{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                {"S'inscrire"}
              </Link>
            </div>

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-medium">Comptes de Test Officiels</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    role: 'Super Admin',
                    email: 'admin@aerocheck.com',
                    icon: <Shield className="h-4 w-4" />,
                    desc: 'Gestion totale & Audit',
                    color: 'text-blue-600 bg-blue-50 border-blue-100'
                  },
                  {
                    role: 'Vérificateur QIP',
                    email: 'qip1@aerocheck.com',
                    icon: <FileSearch className="h-4 w-4" />,
                    desc: 'Vérification documents',
                    color: 'text-amber-600 bg-amber-50 border-amber-100'
                  },
                  {
                    role: 'Délivreur DLAA',
                    email: 'dlaa1@aerocheck.com',
                    icon: <Award className="h-4 w-4" />,
                    desc: 'Émission de licences',
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  },
                  {
                    role: 'Agent ATCO',
                    email: 'agent1@test.com',
                    icon: <User className="h-4 w-4" />,
                    desc: 'Soumission & Profil',
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
                  },
                  {
                    role: 'Superviseur DNA',
                    email: 'dna@aerocheck.com',
                    icon: <TrendingUp className="h-4 w-4" />,
                    desc: 'Analyses & Monitoring',
                    color: 'text-purple-600 bg-purple-50 border-purple-100'
                  },
                  {
                    role: 'Monitoring ENA',
                    email: 'ena@aerocheck.com',
                    icon: <Plane className="h-4 w-4" />,
                    desc: 'Suivi Aéroport',
                    color: 'text-sky-600 bg-sky-50 border-sky-100'
                  },
                  {
                    role: 'Representant Pays',
                    email: 'suprep@aerocheck.com',
                    icon: <Globe className="h-4 w-4" />,
                    desc: 'Gestion Nationale',
                    color: 'text-teal-600 bg-teal-50 border-teal-100'
                  }
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => { setEmail(demo.email); setPassword('password123'); }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all hover:scale-105 active:scale-95 group ${demo.color}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-md bg-white/80">
                        {demo.icon}
                      </div>
                      <span className="text-xs font-bold leading-none">{demo.role}</span>
                    </div>
                    <p className="text-[10px] opacity-80 font-medium mb-1 truncate w-full">{demo.email}</p>
                    <p className="text-[10px] italic leading-tight opacity-70 group-hover:opacity-100 transition-opacity">{demo.desc}</p>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-muted-foreground text-center animate-pulse">
                Mot de passe commun : <span className="font-bold">password123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
