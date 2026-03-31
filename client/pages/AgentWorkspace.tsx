import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { FileText, CheckCircle2, XCircle, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const AgentWorkspace = () => {
  const { user } = useAuth();
  const api = useApi();
  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState({
    medical: { fileUrl: "", expiryDate: "" },
    english: { fileUrl: "", expiryDate: "" },
    skills: { fileUrl: "", expiryDate: "" },
  });

  const fetchLicense = async () => {
    try {
      const data = await api.get("/workflow/my-license");
      setLicense(data);
      if (data.documents) {
        const newDocs: any = { ...docs };
        data.documents.forEach((d: any) => {
          newDocs[d.type] = {
            fileUrl: d.fileUrl || "",
            expiryDate: d.expiryDate ? d.expiryDate.split("T")[0] : "",
            status: d.status,
            comment: d.comment,
          };
        });
        setDocs(newDocs);
      }
    } catch (err: any) {
      if (err.message !== "License not found") {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const handleDocChange = (type: string, field: string, value: string) => {
    setDocs((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(docs).map(([type, data]) => ({
        type,
        fileUrl: data.fileUrl,
        expiryDate: data.expiryDate,
      }));
      await api.post("/workflow/submit", { documents: payload });
      toast.success("Soumission reussie");
      fetchLicense();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_qip": return <Badge variant="secondary" className="animate-pulse"><Clock className="w-3 h-3 mr-1" /> En attente QIP</Badge>;
      case "pending_dlaa": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse"><Clock className="w-3 h-3 mr-1" /> En attente DLAA</Badge>;
      case "approved": return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Approuve</Badge>;
      case "rejected": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejete</Badge>;
      default: return <Badge variant="outline">Brouillon</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
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
        <h1 className="text-3xl font-bold">Mon Espace Agent</h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={license?.status || "none"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {license && getStatusBadge(license.status)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-400 mr-3" />
          <p className="text-sm text-blue-700 font-medium">
            Rappel : Vous devez fournir les trois documents reglementaires valides pour toute demande de licence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: "medical", title: "Certificat Medical", color: "text-blue-600" },
          { id: "english", title: "Test d'Anglais", color: "text-purple-600" },
          { id: "skills", title: "Controle de Competences", color: "text-emerald-600" },
        ].map((docType, index) => (
          <motion.div
            key={docType.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${docType.color}`} />
                  {docType.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Lien du document (URL)</Label>
                  <Input
                    placeholder="https://ex.com/doc.pdf"
                    value={docs[docType.id as keyof typeof docs].fileUrl}
                    onChange={(e) => handleDocChange(docType.id, "fileUrl", e.target.value)}
                    disabled={license?.status === "pending_qip" || license?.status === "pending_dlaa" || license?.status === "approved"}
                    className="focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Date d'expiration</Label>
                  <Input
                    type="date"
                    value={docs[docType.id as keyof typeof docs].expiryDate}
                    onChange={(e) => handleDocChange(docType.id, "expiryDate", e.target.value)}
                    disabled={license?.status === "pending_qip" || license?.status === "pending_dlaa" || license?.status === "approved"}
                    className="focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || license?.status === "pending_qip" || license?.status === "pending_dlaa" || license?.status === "approved"}
          className="px-12 py-6 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        >
          {submitting ? "Traitement..." : "Soumettre mon dossier"}
        </Button>
      </div>

      {license?.status === "rejected" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-red-200 bg-red-50 shadow-inner">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                <XCircle className="w-5 h-5" /> Motifs du rejet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 font-medium italic">
                Votre dossier a ete refuse. Veuillez verifier vos documents et soumettre a nouveau.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AgentWorkspace;
