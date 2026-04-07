import express from 'express';
import { createId, getRelations, listAgents, saveAirport } from '../db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asTrimmedString } from '../utils/validators.js';

const router = express.Router();

function getRegionLabel(countryName: string): string {
  const normalized = countryName.toLowerCase();
  if (['cameroun', 'gabon', 'centrafrique', 'tchad', 'congo', 'guinee equatoriale'].includes(normalized)) {
    return 'Afrique Centrale';
  }
  return 'Afrique de l Ouest';
}

function serializeAirport(airport: ReturnType<typeof getRelations>['aeroports'][number]) {
  const country = getRelations().pays.find((item) => item.id === airport.paysId);
  const agentCount = listAgents().filter((agent) => agent.aeroportId === airport.id).length;
  const countryName = country?.nomFr ?? country?.nom ?? '';

  return {
    id: airport.id,
    code: airport.code ?? '',
    name: airport.nom,
    city: airport.ville ?? '',
    country: countryName,
    region: getRegionLabel(countryName),
    isActive: true,
    agentCount,
    createdAt: '2026-01-01T00:00:00.000Z',
    paysId: airport.paysId ?? '',
  };
}

router.get('/', authenticate, (req, res) => {
  const { search, paysId } = req.query as { search?: string; paysId?: string };
  const needle = search?.trim().toLowerCase();

  const data = getRelations().aeroports
    .filter((airport) => (paysId ? airport.paysId === paysId : true))
    .filter((airport) => {
      if (!needle) return true;
      return [airport.code ?? '', airport.nom, airport.ville ?? ''].some((value) => value.toLowerCase().includes(needle));
    })
    .map(serializeAirport);

  res.json({ success: true, data });
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'DNA'), (req, res) => {
  const code = asTrimmedString(req.body?.code)?.toUpperCase();
  const name = asTrimmedString(req.body?.name);
  const city = asTrimmedString(req.body?.city);
  const country = asTrimmedString(req.body?.country);

  if (!code || !name || !city || !country) {
    res.status(400).json({ success: false, error: 'Code, nom, ville et pays sont requis' });
    return;
  }

  const pays = getRelations().pays.find((item) => {
    const label = item.nomFr ?? item.nom;
    return label.toLowerCase() === country.toLowerCase();
  });

  if (!pays) {
    res.status(400).json({ success: false, error: 'Pays introuvable dans le referentiel' });
    return;
  }

  const existingCode = getRelations().aeroports.find((item) => (item.code ?? '').toLowerCase() === code.toLowerCase());
  if (existingCode) {
    res.status(409).json({ success: false, error: 'Ce code aeroport existe deja' });
    return;
  }

  const saved = saveAirport({
    id: createId('apt'),
    code,
    nom: name,
    ville: city,
    paysId: pays.id,
  });

  res.status(201).json({ success: true, data: serializeAirport(saved) });
});

router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'DNA'), (req, res) => {
  const airport = getRelations().aeroports.find((item) => item.id === req.params.id);
  if (!airport) {
    res.status(404).json({ success: false, error: 'Aeroport introuvable' });
    return;
  }

  const nextCode = req.body?.code === undefined ? airport.code : asTrimmedString(req.body.code)?.toUpperCase();
  const nextName = req.body?.name === undefined ? airport.nom : asTrimmedString(req.body.name);
  const nextCity = req.body?.city === undefined ? airport.ville : asTrimmedString(req.body.city);
  const nextCountry = req.body?.country === undefined ? undefined : asTrimmedString(req.body.country);

  if (!nextCode || !nextName || !nextCity) {
    res.status(400).json({ success: false, error: 'Code, nom et ville sont requis' });
    return;
  }

  const duplicate = getRelations().aeroports.find((item) => item.id !== airport.id && (item.code ?? '').toLowerCase() === nextCode.toLowerCase());
  if (duplicate) {
    res.status(409).json({ success: false, error: 'Ce code aeroport existe deja' });
    return;
  }

  let paysId = airport.paysId;
  if (nextCountry) {
    const pays = getRelations().pays.find((item) => {
      const label = item.nomFr ?? item.nom;
      return label.toLowerCase() === nextCountry.toLowerCase();
    });
    if (!pays) {
      res.status(400).json({ success: false, error: 'Pays introuvable dans le referentiel' });
      return;
    }
    paysId = pays.id;
  }

  const saved = saveAirport({
    ...airport,
    code: nextCode,
    nom: nextName,
    ville: nextCity,
    paysId,
  });

  res.json({ success: true, data: serializeAirport(saved) });
});

export default router;
