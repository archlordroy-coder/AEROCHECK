import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import appLogo from "@/logo/logosansfond.png";
import { Lock, Mail, ArrowLeft, Home } from 'lucide-react';

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

            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Comptes de demonstration (cliquez pour remplir) :</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail('admin@aerocheck.com'); setPassword('password123'); }}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">Admin</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail('qip1@aerocheck.com'); setPassword('password123'); }}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">QIP</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail('dlaa1@aerocheck.com'); setPassword('password123'); }}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">DLAA</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail('agent1@test.com'); setPassword('password123'); }}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">Agent ATCO</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmail('dna@aerocheck.com'); setPassword('password123'); }}
                  className="text-xs justify-start"
                >
                  <span className="font-medium">Superviseur ASECNA</span>
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center italic">Mot de passe: password123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
