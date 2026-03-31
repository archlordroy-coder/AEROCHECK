import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Eye, Users, FileCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const ValidationWorkspace = () => {
  const { user } = useAuth();
  const api = useApi();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [validating, setValidating] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.get("/users/users");
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du chargement des agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleValidate = async (userId: string, licenseId: string, status: "approved" | "rejected") => {
    setValidating(true);
    try {
      await api.post(`/workflow/validate/${licenseId}`, { status, comment });
      toast.success(status === "approved" ? "Approuve" : "Rejete");
      setSelectedUser(null);
      setComment("");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Erreur de validation");
    } finally {
      setValidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_qip": return <Badge variant="secondary" className="animate-pulse">En attente QIP</Badge>;
      case "pending_dlaa": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse">En attente DLAA</Badge>;
      case "approved": return <Badge variant="default" className="bg-green-100 text-green-800">Approuve</Badge>;
      case "rejected": return <Badge variant="destructive">Rejete</Badge>;
      default: return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  const filteredUsers = users.filter((u: any) => u.role === "agent");

  // Chart data
  const stats = [
    { name: "Approuves", value: filteredUsers.filter(u => u.licenses?.[0]?.status === "approved").length, color: "#10b981" },
    { name: "En attente", value: filteredUsers.filter(u => u.licenses?.[0]?.status?.startsWith("pending")).length, color: "#f59e0b" },
    { name: "Rejetes", value: filteredUsers.filter(u => u.licenses?.[0]?.status === "rejected").length, color: "#ef4444" },
    { name: "Brouillons", value: filteredUsers.filter(u => !u.licenses?.[0] || u.licenses?.[0]?.status === "draft").length, color: "#94a3b8" },
  ].filter(s => s.value > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[400px]" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileCheck className="w-8 h-8 text-primary" />
          Portail de Validation - {user?.role?.toUpperCase()}
        </h1>
        <Badge variant="outline" className="px-3 py-1 font-semibold border-primary/20 bg-primary/5">
          {user?.country || "Global"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <Card className="shadow-lg border-none bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              File d'attente des agents
            </CardTitle>
            <CardDescription>Consultez et validez les dossiers de votre juridiction.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Aeroport</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        Aucun dossier a traiter pour le moment.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u: any) => {
                      const latestLicense = u.licenses?.[0];
                      return (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group border-b hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                          <TableCell className="text-sm">{u.airport?.name}</TableCell>
                          <TableCell>{latestLicense ? getStatusBadge(latestLicense.status) : <Badge variant="outline">N/A</Badge>}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(u)}
                                  disabled={!latestLicense}
                                  className="group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                                >
                                  <Eye className="w-4 h-4 mr-2" /> Examiner
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-black">Examen du dossier : {u.firstName} {u.lastName}</DialogTitle>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-8 pt-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-muted/40 rounded-2xl border border-border/50">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pays</p>
                                        <p className="font-bold">{u.country?.name}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aeroport</p>
                                        <p className="font-bold">{u.airport?.name}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matricule</p>
                                        <p className="font-bold">{u.matricule || "N/A"}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut actuel</p>
                                        <div>{getStatusBadge(latestLicense.status)}</div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="text-lg font-black border-b-2 border-primary/10 pb-2">Documents justificatifs</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {latestLicense.documents?.map((d: any) => (
                                          <Card key={d.id} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                            <p className="font-black text-xs uppercase tracking-wider text-primary mb-2">{d.type}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4">
                                                <Clock className="w-3 h-3" />
                                                <span>Expire le: {new Date(d.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                            <Button asChild variant="secondary" size="sm" className="w-full text-xs">
                                              <a href={d.fileUrl} target="_blank">Ouvrir le fichier</a>
                                            </Button>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-dashed">
                                      <Label className="text-base font-black">Decision de validation</Label>
                                      <Textarea
                                        placeholder="Saisissez ici les motifs de votre decision (obligatoire en cas de rejet)..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="bg-white min-h-[100px]"
                                      />
                                      <div className="flex justify-end gap-4 pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleValidate(u.id, latestLicense.id, "rejected")}
                                            disabled={validating}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" /> Rejeter
                                        </Button>
                                        <Button
                                            onClick={() => handleValidate(u.id, latestLicense.id, "approved")}
                                            disabled={validating}
                                            className="bg-emerald-600 hover:bg-emerald-700 px-8 shadow-lg shadow-emerald-200"
                                        >
                                          <CheckCircle2 className="w-4 h-4 mr-2" /> Valider le dossier
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
            <Card className="shadow-lg border-none bg-white/80 backdrop-blur h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Statistiques Conformite</CardTitle>
                <CardDescription>Repartition des dossiers agents du pays.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.length > 0 ? (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground italic">
                        Aucune donnee disponible
                    </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none bg-primary text-primary-foreground h-fit">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Guide Validateur
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <p className="opacity-90 leading-relaxed">
                        Le QIP doit verifier la clarte des scans et la validite des dates. Le DLAA confirme la decision finale.
                    </p>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                        <p className="font-bold mb-1">Anglais :</p>
                        <p className="text-xs opacity-80">Note min. 4 requise pour validation.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ValidationWorkspace;
