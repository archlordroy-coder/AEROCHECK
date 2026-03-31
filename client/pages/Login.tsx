import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApi } from "../hooks/useApi";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import appLogo from "@/logo/logosansfond.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.success("Connexion reussie");
      navigate("/portail");
    } catch (error: any) {
      toast.error(error.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-muted/30 rounded-[3rem]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md px-4"
      >
        <div className="flex flex-col items-center mb-8">
            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl p-4 mb-4 border border-border/50">
                <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">AEROCHECK</h1>
            <p className="text-muted-foreground uppercase text-[10px] tracking-[0.3em] font-black mt-1">Plateforme de Gestion</p>
        </div>

        <Card className="shadow-2xl border-none bg-white/90 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription className="text-sm">
              Accedez a votre espace de travail securise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all border-border/60"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Mot de passe</Label>
                <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 h-12 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all border-border/60"
                    />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground font-medium">Ou</span>
                </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Vous etes un nouvel agent ?
            </p>
            <Button variant="outline" className="w-full h-11 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold" onClick={() => navigate("/register")}>
              Creer un compte agent <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
