import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import appLogo from "@/logo/logosansfond.png";
import { Lock, Mail, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      toast.success('Inscription reussie ! Bienvenue sur AEROCHECK');
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
          <div className="group flex h-40 w-40 items-center justify-center rounded-[3rem] bg-white shadow-2xl ring-4 ring-border/50 transition-all duration-500 hover:rotate-6 hover:scale-110">
            <img src={appLogo} alt="AEROCHECK Logo" className="h-28 w-28 object-contain" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground drop-shadow-lg">AEROCHECK</h1>
          <p className="text-xl text-muted-foreground font-medium">Gestion des Licences Aeroportuaires</p>
          <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
            <p className="mb-4">Plateforme de gestion des licences d'accès aéroportuaire pour l'ASECNA</p>
            <div className="flex gap-4 justify-center">
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Sécurisé</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Rapide</span>
              <span className="px-3 py-1 bg-primary/10 rounded-full text-xs">Fiable</span>
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
              <img src={appLogo} alt="AEROCHECK Logo" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">AEROCHECK</h1>
          </div>

          <CardHeader className="space-y-1 text-center lg:text-left">
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Creez votre compte agent aeroportuaire
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
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
