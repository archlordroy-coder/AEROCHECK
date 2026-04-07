import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import appLogo from "@/logo/logosansfond.png";
import { 
  Shield, 
  FileCheck, 
  Award, 
  Users, 
  ArrowRight,
  Building2,
  Globe,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border">
              <img src={appLogo} alt="ATCOCLICLE Logo" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground">ATCOCLICLE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#fonctionnalites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalites
            </a>
            <a href="#processus" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Processus
            </a>
            <a href="#aeroports" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Aeroports
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <Badge className="mb-6 animate-float" variant="secondary">
              Plateforme Officielle ASECNA
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-balance text-slate-950">
              Gestion des Licences des ATCOS
            </h1>
            <p className="text-xl text-muted-foreground mb-10 text-pretty leading-relaxed">
              Plateforme de gestions des licenses des controleurs aeriens de l'ASECNA.
              Assurez le suivi de la validite des documents qui permettent la delivrance et le renouvellement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer l&apos;inscription
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Acceder a mon espace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">17</div>
              <div className="text-sm text-muted-foreground">Pays Membres</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">25+</div>
              <div className="text-sm text-muted-foreground">Aeroports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">ATCOS suivis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Documents critiques</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fonctionnalites Principales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution complete pour le suivi de validite et la tracabilite des licences ATCO
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Inscription en Ligne</CardTitle>
                <CardDescription>
                  Creez votre compte ATCO et deposez les documents requis en toute simplicite
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Verification QIP</CardTitle>
                <CardDescription>
                  Suivi en temps reel de la verification de vos documents par le QIP
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Emission DLAA</CardTitle>
                <CardDescription>
                  Emission et suivi de l'etat de votre licence de controleur aerien
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Securite Renforcee</CardTitle>
                <CardDescription>
                  Vos donnees sont protegees selon les normes internationales
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Suivi en Temps Reel</CardTitle>
                <CardDescription>
                  Suivez l'etat global et la validite de vos documents a chaque etape
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Aeroports</CardTitle>
                <CardDescription>
                  Valable dans tous les aeroports de la zone ASECNA
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="processus" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Processus d&apos;Obtention</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quatre etapes simples pour obtenir votre licence de controleur aerien
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Inscription</h3>
              <p className="text-sm text-muted-foreground">
                Creez votre compte et remplissez votre profil ATCO
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Documents</h3>
              <p className="text-sm text-muted-foreground">
                Soumettez les documents requis pour la delivrance de la licence
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Verification</h3>
              <p className="text-sm text-muted-foreground">
                Le QIP verifie et valide vos documents
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Licence</h3>
              <p className="text-sm text-muted-foreground">
                La DLAA emet votre licence officielle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Airports Section */}
      <section id="aeroports" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Aeroports Partenaires</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Principaux aeroports couverts par la plateforme ATCOCLICLE
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { code: 'DSS', name: 'Dakar', country: 'Senegal' },
              { code: 'ABJ', name: 'Abidjan', country: 'Cote d\'Ivoire' },
              { code: 'DLA', name: 'Douala', country: 'Cameroun' },
              { code: 'LBV', name: 'Libreville', country: 'Gabon' },
              { code: 'NIM', name: 'Niamey', country: 'Niger' },
              { code: 'BKO', name: 'Bamako', country: 'Mali' },
              { code: 'COO', name: 'Cotonou', country: 'Benin' },
              { code: 'OUA', name: 'Ouagadougou', country: 'Burkina Faso' },
            ].map((airport) => (
              <Card key={airport.code} className="text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.02]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-primary/70" />
                    <span className="font-mono font-bold">{airport.code}</span>
                  </div>
                  <div className="font-medium">{airport.name}</div>
                  <div className="text-sm text-muted-foreground">{airport.country}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pret a commencer ?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Rejoignez les milliers d'ATCOS qui utilisent ATCOCLICLE pour suivre l'etat de validite de leurs documents.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Creer mon compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border">
                  <img src={appLogo} alt="ATCOCLICLE Logo" className="h-7 w-7 object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tight">ATCOCLICLE</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plateforme officielle de gestion des licences des ATCOS ASECNA.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#fonctionnalites" className="hover:text-foreground">Fonctionnalites</a></li>
                <li><a href="#processus" className="hover:text-foreground">Processus</a></li>
                <li><a href="#aeroports" className="hover:text-foreground">Aeroports</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Centre d&apos;aide</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Conditions d&apos;utilisation</a></li>
                <li><a href="#" className="hover:text-foreground">Politique de confidentialite</a></li>
                <li><a href="#" className="hover:text-foreground">Mentions legales</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ATCOCLICLE - ASECNA. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
