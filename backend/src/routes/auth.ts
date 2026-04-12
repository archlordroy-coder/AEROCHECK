import express from 'express';
import bcrypt from 'bcryptjs';
import { addUser, createId, getAgentByUserId, getUserRecordById, getUserRecordByEmail, listUsers, sanitizeUser, saveUser, verifyPassword } from '../db.js';
import { authenticate, authorize, generateToken, type AuthRequest } from '../middleware/auth.js';
import type { RegisterRequest, Role } from '../../shared/types/index.js';
import { asTrimmedString, pickEnumValue, parseBoolean } from '../utils/validators.js';

const router = express.Router();
const ROLES = ['AGENT', 'QIP', 'DLAA', 'DNA', 'SUPER_ADMIN', 'ENA', 'SUP_REP'] as const satisfies readonly Role[];

router.post('/login', (req, res) => {
  const email = asTrimmedString(req.body?.email)?.toLowerCase();
  const password = asTrimmedString(req.body?.password);

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
    return;
  }

  const user = getUserRecordByEmail(email);
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ success: false, error: 'Identifiants invalides' });
    return;
  }

  res.json({
    success: true,
    data: {
      token: generateToken(user.id),
      user: sanitizeUser(user),
    },
  });
});

router.post('/register', (req, res) => {
  const payload = req.body as RegisterRequest & { role?: Role };
  const email = asTrimmedString(payload.email)?.toLowerCase();
  const password = asTrimmedString(payload.password);
  const firstName = asTrimmedString(payload.firstName);
  const lastName = asTrimmedString(payload.lastName);
  const role = pickEnumValue(payload.role, ROLES) ?? 'AGENT';

  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({ success: false, error: 'Champs requis manquants' });
    return;
  }

  if (payload.role && !pickEnumValue(payload.role, ROLES)) {
    res.status(400).json({ success: false, error: 'Role invalide' });
    return;
  }

  if (getUserRecordByEmail(email)) {
    res.status(409).json({ success: false, error: 'Cet email existe deja' });
    return;
  }

  if (role === 'QIP' || role === 'DLAA') {
    const existingRoleHolder = listUsers().find(u => u.role === role && u.paysId === payload.paysId && u.isActive);
    if (existingRoleHolder) {
      res.status(400).json({ success: false, error: `Il existe déjà un utilisateur avec le rôle ${role} pour ce pays` });
      return;
    }
  }

  const user = addUser({
    id: createId('user'),
    email,
    role,
    firstName,
    lastName,
    phone: asTrimmedString(payload.phone),
    paysId: asTrimmedString(payload.paysId),
    aeroportId: asTrimmedString(payload.aeroportId),
    passwordHash: bcrypt.hashSync(password, 10),
    isActive: true,
  });

  res.status(201).json({
    success: true,
    data: {
      token: generateToken(user.id),
      user: sanitizeUser(user),
    },
  });
});

router.get('/me', authenticate, (req: AuthRequest, res) => {
  const user = req.user ? getUserRecordById(req.user.id) : undefined;
  if (!user) {
    res.status(401).json({ success: false, error: 'Utilisateur non authentifie' });
    return;
  }

  const safeUser = sanitizeUser(user);
  const agent = getAgentByUserId(user.id);
  res.json({
    success: true,
    data: {
      ...safeUser,
      pays: user.paysId,
      aeroport: user.aeroportId,
      ...(agent ? { agent } : {}),
    },
  });
});

router.get('/users', authenticate, authorize('SUPER_ADMIN', 'DNA'), (_req, res) => {
  res.json({
    success: true,
    data: listUsers().map((user) => ({
      ...sanitizeUser(user),
      isActive: user.isActive,
    })),
  });
});

router.patch('/users/:id', authenticate, authorize('SUPER_ADMIN', 'DNA'), (req, res) => {
  const user = getUserRecordById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    return;
  }

  const { firstName, lastName, role } = req.body as Partial<{ firstName: string; lastName: string; role: Role }>;
  const nextFirstName = firstName === undefined ? undefined : asTrimmedString(firstName);
  const nextLastName = lastName === undefined ? undefined : asTrimmedString(lastName);
  const nextRole = role === undefined ? undefined : pickEnumValue(role, ROLES);

  if (firstName !== undefined && !nextFirstName) {
    res.status(400).json({ success: false, error: 'Le prenom est invalide' });
    return;
  }

  if (lastName !== undefined && !nextLastName) {
    res.status(400).json({ success: false, error: 'Le nom est invalide' });
    return;
  }

  if (role !== undefined && !nextRole) {
    res.status(400).json({ success: false, error: 'Role invalide' });
    return;
  }

  const nextRoleValue = nextRole ?? user.role;
  const nextPaysIdValue = asTrimmedString(req.body?.paysId) ?? user.paysId;

  if (nextRoleValue === 'QIP' || nextRoleValue === 'DLAA') {
    const existingRoleHolder = listUsers().find(u => u.role === nextRoleValue && u.paysId === nextPaysIdValue && u.id !== user.id && u.isActive);
    if (existingRoleHolder) {
      res.status(400).json({ success: false, error: `Il existe déjà un utilisateur avec le rôle ${nextRoleValue} pour ce pays` });
      return;
    }
  }

  if (nextFirstName) user.firstName = nextFirstName;
  if (nextLastName) user.lastName = nextLastName;
  if (nextRole) user.role = nextRole;
  if (asTrimmedString(req.body?.paysId)) user.paysId = asTrimmedString(req.body?.paysId);
  if (asTrimmedString(req.body?.aeroportId)) user.aeroportId = asTrimmedString(req.body?.aeroportId);
  
  user.updatedAt = new Date().toISOString();
  const savedUser = saveUser(user);

  res.json({ success: true, data: { ...sanitizeUser(savedUser), isActive: savedUser.isActive } });
});

router.patch('/users/:id/status', authenticate, authorize('SUPER_ADMIN', 'DNA'), (req, res) => {
  const user = getUserRecordById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
    return;
  }

  const isActive = parseBoolean(req.body?.isActive);
  if (isActive === undefined) {
    res.status(400).json({ success: false, error: 'Le statut d activation est invalide' });
    return;
  }

  user.isActive = isActive;
  user.updatedAt = new Date().toISOString();
  const savedUser = saveUser(user);

  res.json({ success: true, data: { ...sanitizeUser(savedUser), isActive: savedUser.isActive } });
});

router.post('/change-password', authenticate, (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Mot de passe actuel et nouveau requis' });
    return;
  }

  const user = getUserRecordById(req.user!.id);
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    res.status(401).json({ success: false, error: 'Mot de passe actuel incorrect' });
    return;
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.updatedAt = new Date().toISOString();
  saveUser(user);

  res.json({ success: true, message: 'Mot de passe mis a jour avec succes' });
});

export default router;
