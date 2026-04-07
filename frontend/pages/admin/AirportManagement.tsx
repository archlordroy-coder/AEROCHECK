import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Building2, MapPin, Users, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  isActive: boolean;
  agentCount: number;
  createdAt: string;
}

const ASECNA_COUNTRIES = [
  'Benin', 'Burkina Faso', 'Cameroun', 'Centrafrique', 'Comores',
  'Congo', 'Cote d\'Ivoire', 'Gabon', 'Guinee-Bissau', 'Guinee Equatoriale',
  'Madagascar', 'Mali', 'Mauritanie', 'Niger', 'Senegal', 'Tchad', 'Togo'
];

export default function AirportManagement() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    city: '',
    country: '',
    region: '',
    description: '',
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/airports');
      setAirports(response.data);
    } catch (error) {
      // Mock data for demo
      setAirports([
        {
          id: '1',
          code: 'DSS',
          name: 'Aeroport International Blaise Diagne',
          city: 'Dakar',
          country: 'Senegal',
          region: 'Afrique de l\'Ouest',
          isActive: true,
          agentCount: 245,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          code: 'ABJ',
          name: 'Aeroport International Felix Houphouet-Boigny',
          city: 'Abidjan',
          country: 'Cote d\'Ivoire',
          region: 'Afrique de l\'Ouest',
          isActive: true,
          agentCount: 312,
          createdAt: '2024-01-10',
        },
        {
          id: '3',
          code: 'DLA',
          name: 'Aeroport International de Douala',
          city: 'Douala',
          country: 'Cameroun',
          region: 'Afrique Centrale',
          isActive: true,
          agentCount: 189,
          createdAt: '2024-02-01',
        },
        {
          id: '4',
          code: 'LBV',
          name: 'Aeroport International Leon Mba',
          city: 'Libreville',
          country: 'Gabon',
          region: 'Afrique Centrale',
          isActive: true,
          agentCount: 156,
          createdAt: '2024-01-20',
        },
        {
          id: '5',
          code: 'NIM',
          name: 'Aeroport International Diori Hamani',
          city: 'Niamey',
          country: 'Niger',
          region: 'Afrique de l\'Ouest',
          isActive: true,
          agentCount: 98,
          createdAt: '2024-02-15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAirport = async () => {
    try {
      await api.post('/airports', formData);
      toast({
        title: 'Succes',
        description: 'Aeroport cree avec succes',
      });
      setIsCreateOpen(false);
      resetForm();
      fetchAirports();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la creation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAirport = async () => {
    if (!editingAirport) return;
    try {
      await api.patch(`/airports/${editingAirport.id}`, formData);
      toast({
        title: 'Succes',
        description: 'Aeroport mis a jour',
      });
      setEditingAirport(null);
      resetForm();
      fetchAirports();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la mise a jour',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      city: '',
      country: '',
      region: '',
      description: '',
    });
  };

  const openEdit = (airport: Airport) => {
    setEditingAirport(airport);
    setFormData({
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      region: airport.region,
      description: '',
    });
  };

  const filteredAirports = airports.filter((airport) => {
    const matchesSearch =
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || airport.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(airports.map((a) => a.country))];

  const stats = {
    total: airports.length,
    active: airports.filter((a) => a.isActive).length,
    totalAgents: airports.reduce((sum, a) => sum + a.agentCount, 0),
    countries: uniqueCountries.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Aeroports</h1>
          <p className="text-muted-foreground">Gerez les aeroports de la zone ASECNA</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Aeroport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Aeroport</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel aeroport au systeme ATCOCLICLE
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code OACI</Label>
                  <Input
                    id="code"
                    placeholder="DSS"
                    maxLength={4}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    placeholder="Dakar"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Aeroport International..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASECNA_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez une region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Afrique de l'Ouest">Afrique de l&apos;Ouest</SelectItem>
                    <SelectItem value="Afrique Centrale">Afrique Centrale</SelectItem>
                    <SelectItem value="Ocean Indien">Ocean Indien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Informations supplementaires..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateAirport}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Aeroports</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aeroports Actifs</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAgents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pays Couverts</CardTitle>
            <MapPin className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.countries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Aeroports</CardTitle>
          <CardDescription>
            {filteredAirports.length} aeroport(s) trouve(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par code, nom ou ville..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredAirports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun aeroport trouve
                  </TableCell>
                </TableRow>
              ) : (
                filteredAirports.map((airport) => (
                  <TableRow key={airport.id}>
                    <TableCell className="font-mono font-bold">{airport.code}</TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {airport.name}
                    </TableCell>
                    <TableCell>{airport.city}</TableCell>
                    <TableCell>{airport.country}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{airport.agentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={airport.isActive ? 'default' : 'secondary'}>
                        {airport.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(airport)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAirport} onOpenChange={() => setEditingAirport(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;Aeroport</DialogTitle>
            <DialogDescription>
              Modifier les informations de {editingAirport?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code OACI</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ville</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Pays</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASECNA_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAirport(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateAirport}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
