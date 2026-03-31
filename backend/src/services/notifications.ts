import { prisma } from '../index.js';

// Service de notifications
export class NotificationService {
  // Vérifier les documents expirant dans 30, 15, 7 jours
  static async checkExpiringDocuments() {
    const now = new Date();
    const thresholds = [
      { days: 30, type: 'EXPIRATION_30J' },
      { days: 15, type: 'EXPIRATION_15J' },
      { days: 7, type: 'EXPIRATION_7J' },
    ];

    for (const threshold of thresholds) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + threshold.days);

      // Trouver les documents expirant à cette date
      const expiringDocs = await prisma.document.findMany({
        where: {
          expiresAt: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lt: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
          status: 'VALIDE',
          archived: false,
        },
        include: {
          agent: { include: { user: true } },
        },
      });

      for (const doc of expiringDocs) {
        // Vérifier si notification déjà envoyée
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: doc.agent.userId,
            type: threshold.type,
            data: { contains: doc.id },
            createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
          },
        });

        if (!existingNotif) {
          // Créer notification
          await prisma.notification.create({
            data: {
              userId: doc.agent.userId,
              type: threshold.type,
              title: `Expiration dans ${threshold.days} jours`,
              message: `Votre document ${doc.type} expire le ${doc.expiresAt?.toLocaleDateString('fr-FR')}.`,
              data: JSON.stringify({ documentId: doc.id, type: doc.type }),
            },
          });

          // TODO: Envoyer email
          console.log(`[EMAIL] Document ${doc.id} expire dans ${threshold.days} jours`);
        }
      }
    }
  }

  // Envoyer notification de validation/rejet
  static async sendValidationNotification(
    userId: string,
    status: 'VALIDE' | 'REJETE',
    documentType: string,
    niveau: string,
    comment?: string
  ) {
    await prisma.notification.create({
      data: {
        userId,
        type: status === 'VALIDE' ? 'VALIDATION' : 'REJET',
        title: status === 'VALIDE' ? 'Document validé' : 'Document rejeté',
        message: `Votre document ${documentType} a été ${status === 'VALIDE' ? 'validé' : 'rejeté'} par ${niveau}.`,
        data: JSON.stringify({ niveau, comment }),
      },
    });
  }

  // Marquer notification comme lue
  static async markAsRead(notificationId: string) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  // Récupérer notifications non lues d'un utilisateur
  static async getUnreadNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Planificateur de tâches (à exécuter quotidiennement)
export function startNotificationScheduler() {
  // Vérifier tous les jours à 9h du matin
  const checkInterval = 24 * 60 * 60 * 1000; // 24 heures

  // Exécuter immédiatement puis planifier
  NotificationService.checkExpiringDocuments();

  setInterval(() => {
    NotificationService.checkExpiringDocuments();
  }, checkInterval);

  console.log('[NOTIFICATIONS] Planificateur démarré');
}
