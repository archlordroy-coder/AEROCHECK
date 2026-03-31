import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plane, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plane className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">AEROCHECK</h1>
        <p className="text-sm text-muted-foreground">Gestion des Licences Aeroportuaires</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
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
                  className="pl-10"
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
                  className="pl-10"
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
            <p className="mb-2 text-xs font-medium text-muted-foreground">Comptes de demonstration :</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">Admin:</span> admin@aerocheck.com</p>
              <p><span className="font-medium">QIP:</span> qip1@aerocheck.com</p>
              <p><span className="font-medium">DLAA:</span> dlaa1@aerocheck.com</p>
              <p><span className="font-medium">Agent:</span> agent1@test.com</p>
              <p className="pt-1 italic">Mot de passe: password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
