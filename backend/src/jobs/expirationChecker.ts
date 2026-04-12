import { getStore, addNotification } from '../db.js';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Checks all active documents for expiration dates and sends notifications
 * to agents at 90, 30 and 1 day(s) before expiry.
 */
export function checkExpirations() {
  console.log('[AEROCHECK] Expiration check starting...');
  const { documents, agents } = getStore();
  const now = new Date();

  let alertsSent = 0;

  for (const doc of documents) {
    if (!doc.expiresAt || doc.status !== 'VALIDE') continue;

    const expiryDate = parseISO(doc.expiresAt);
    const diff = differenceInDays(expiryDate, now);

    // Target days for alerts
    const alertDays = [90, 30, 1];

    if (alertDays.includes(diff)) {
      const agent = agents.find(a => a.id === doc.agentId);
      if (agent) {
        // Check if an alert for this document and this diff was already sent recently (within last 24h)
        const recentNotifications = getStore().notifications.filter(n => 
          n.userId === agent.userId && 
          n.title === "Expiration imminente" &&
          n.message.includes(`"${doc.type}"`) &&
          n.message.includes(`expire dans ${diff} jour(s)`)
        );

        if (recentNotifications.length === 0) {
          const message = `Alerte : Votre document "${doc.type}" expire dans ${diff} jour(s). Veuillez prendre les dispositions pour le renouveler.`;
          addNotification(agent.userId, "Expiration imminente", message);
          alertsSent++;
        }
      }
    }
  }

  console.log(`[AEROCHECK] Expiration check completed. Alerts sent: ${alertsSent}`);
}

/**
 * Starts the daily interval for the expiration checker
 */
export function startExpirationCron() {
  // Run once on startup
  checkExpirations();

  // Then run every 24 hours
  setInterval(checkExpirations, 24 * 60 * 60 * 1000);
}
