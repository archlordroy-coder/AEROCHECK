import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Dashboard overview stats
router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  const [
    totalAgents,
    totalDocuments,
    totalLicenses,
    documentsEnAttente,
    licencesActives,
    licencesExpirees
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.document.count(),
    prisma.license.count(),
    prisma.document.count({ where: { status: 'EN_ATTENTE' } }),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.license.count({ where: { status: 'EXPIREE' } })
  ]);

  // Get agents by status
  const agentsByStatus = await prisma.agent.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const agentsParStatus: Record<string, number> = {};
  agentsByStatus.forEach(item => {
    agentsParStatus[item.status] = item._count.status;
  });

  // Get documents by status
  const documentsByStatus = await prisma.document.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const documentsParStatus: Record<string, number> = {};
  documentsByStatus.forEach(item => {
    documentsParStatus[item.status] = item._count.status;
  });

  // Recent activity
  const recentAgents = await prisma.agent.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  const recentDocuments = await prisma.document.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      agent: {
        include: {
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    data: {
      totalAgents,
      totalDocuments,
      totalLicenses,
      documentsEnAttente,
      licencesActives,
      licencesExpirees,
      agentsParStatus,
      documentsParStatus,
      recentAgents,
      recentDocuments
    }
  });
});

// Workflow stats (for supervisors)
router.get(
  '/workflow',
  authenticate,
  authorize('DNA', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    const [
      enAttente,
      documentsSoumis,
      qipValides,
      qipRejetes,
      licencesActives,
      licencesSuspendues
    ] = await Promise.all([
      prisma.agent.count({ where: { status: 'EN_ATTENTE' } }),
      prisma.agent.count({ where: { status: 'DOCUMENTS_SOUMIS' } }),
      prisma.agent.count({ where: { status: 'QIP_VALIDE' } }),
      prisma.agent.count({ where: { status: 'QIP_REJETE' } }),
      prisma.agent.count({ where: { status: 'LICENCE_ACTIVE' } }),
      prisma.agent.count({ where: { status: 'LICENCE_SUSPENDUE' } })
    ]);

    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentAgents = await prisma.agent.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const recentLicenses = await prisma.license.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    // Group by month
    const monthlyData: Record<string, { agents: number; licenses: number }> = {};
    
    recentAgents.forEach(agent => {
      const month = agent.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { agents: 0, licenses: 0 };
      }
      monthlyData[month].agents++;
    });

    recentLicenses.forEach(license => {
      const month = license.createdAt.toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { agents: 0, licenses: 0 };
      }
      monthlyData[month].licenses++;
    });

    res.json({
      success: true,
      data: {
        workflow: {
          enAttente,
          documentsSoumis,
          qipValides,
          qipRejetes,
          licencesActives,
          licencesSuspendues
        },
        monthlyData
      }
    });
  }
);

// Users stats (admin only)
router.get(
  '/users',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const usersParRole: Record<string, number> = {};
    usersByRole.forEach(item => {
      usersParRole[item.role] = item._count.role;
    });

    const totalUsers = await prisma.user.count();

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        usersParRole,
        recentUsers
      }
    });
  }
);

export default router;
