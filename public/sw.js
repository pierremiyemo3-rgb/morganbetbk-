/* ═══════════════════════════════════════════════════
   MorganbetBK — Service Worker
   Gère les notifications locales et le cache offline
═══════════════════════════════════════════════════ */

const CACHE_NAME = "morganbetbk-v1";
const NOTIF_CHECK_INTERVAL = 60 * 60 * 1000; // 1 heure

// ── Installation du Service Worker ────────────────────
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

// ── Réception des messages depuis l'app ──────────────
self.addEventListener("message", e => {
  const { type, data } = e.data || {};

  if (type === "SCHEDULE_NOTIFICATIONS") {
    // Planifier les vérifications périodiques
    scheduleCheck(data);
  }

  if (type === "SEND_NOTIF") {
    // Envoyer une notification immédiatement
    const { title, body, tag } = data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      vibrate: [200, 100, 200],
      requireInteraction: false,
      actions: [
        { action: "open", title: "Ouvrir l'app" },
        { action: "dismiss", title: "Ignorer" }
      ]
    });
  }
});

// ── Clic sur une notification ─────────────────────────
self.addEventListener("notificationclick", e => {
  e.notification.close();

  if (e.action === "dismiss") return;

  // Ouvrir ou focus l'app
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({ type: "NOTIF_CLICKED", tag: e.notification.tag });
      } else {
        self.clients.openWindow("/?p=dashboard");
      }
    })
  );
});

// ── Vérification périodique (Background Sync) ─────────
self.addEventListener("periodicsync", e => {
  if (e.tag === "check-notifications") {
    e.waitUntil(checkNotifications());
  }
});

// ── Sync de fond classique ─────────────────────────────
self.addEventListener("sync", e => {
  if (e.tag === "check-notifications") {
    e.waitUntil(checkNotifications());
  }
});

async function scheduleCheck(data) {
  // Stocker les données pour les vérifications futures
  if (data) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      new Request("/_notif_data"),
      new Response(JSON.stringify(data))
    );
  }
}

async function checkNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(new Request("/_notif_data"));
    if (!res) return;

    const { bets = [], bankroll = 0, goal = 0, lang = "fr", lastCheck = 0 } = await res.json();
    const now = Date.now();

    // Éviter les vérifications trop fréquentes
    if (now - lastCheck < NOTIF_CHECK_INTERVAL) return;

    const labels = {
      fr: {
        pending: (n) => ({ title: "⏳ Paris en attente", body: `${n} pari${n > 1 ? "s" : ""} en cours depuis +24h — mets à jour les statuts !` }),
        loss: (pct) => ({ title: "🚨 Alerte perte", body: `Tu as perdu ${pct.toFixed(1)}% de ta bankroll cette semaine.` }),
        goal: (amt) => ({ title: "🎉 Objectif atteint !", body: `Ta bankroll a atteint €${amt.toFixed(2)} !` }),
        summary: (bk, p, n) => ({ title: "📊 Résumé du jour", body: `Bankroll: €${bk.toFixed(2)} | Profit: ${p >= 0 ? "+" : ""}€${p.toFixed(2)} | ${n} paris` }),
      },
      en: {
        pending: (n) => ({ title: "⏳ Pending bets", body: `${n} bet${n > 1 ? "s" : ""} pending for +24h — update their status!` }),
        loss: (pct) => ({ title: "🚨 Loss alert", body: `You've lost ${pct.toFixed(1)}% of your bankroll this week.` }),
        goal: (amt) => ({ title: "🎉 Goal reached!", body: `Your bankroll reached €${amt.toFixed(2)}!` }),
        summary: (bk, p, n) => ({ title: "📊 Daily summary", body: `Bankroll: €${bk.toFixed(2)} | Profit: ${p >= 0 ? "+" : ""}€${p.toFixed(2)} | ${n} bets` }),
      },
      it: {
        pending: (n) => ({ title: "⏳ Scommesse in attesa", body: `${n} scommessa${n > 1 ? "e" : ""} in attesa da +24h — aggiorna gli stati!` }),
        loss: (pct) => ({ title: "🚨 Allerta perdite", body: `Hai perso il ${pct.toFixed(1)}% del tuo bankroll questa settimana.` }),
        goal: (amt) => ({ title: "🎉 Obiettivo raggiunto!", body: `Il tuo bankroll ha raggiunto €${amt.toFixed(2)}!` }),
        summary: (bk, p, n) => ({ title: "📊 Riepilogo", body: `Bankroll: €${bk.toFixed(2)} | Profitto: ${p >= 0 ? "+" : ""}€${p.toFixed(2)} | ${n} scommesse` }),
      },
    };

    const L = labels[lang] || labels.fr;

    // 1. Paris en attente +24h
    const old24 = bets.filter(b => b.status === "pending" && (now - new Date(b.date).getTime()) > 86400000);
    if (old24.length > 0) {
      const n = L.pending(old24.length);
      self.registration.showNotification(n.title, { body: n.body, tag: "pending-24h", icon: "/favicon.svg", vibrate: [200, 100, 200] });
    }

    // 2. Alerte perte hebdo
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); weekStart.setHours(0, 0, 0, 0);
    const weekLoss = bets.filter(b => b.status === "lost" && new Date(b.date) >= weekStart).reduce((a, b) => a + b.stakeEur, 0);
    const weekPct = bankroll > 0 ? weekLoss / bankroll * 100 : 0;
    if (weekPct >= 10) {
      const n = L.loss(weekPct);
      self.registration.showNotification(n.title, { body: n.body, tag: "weekly-loss", icon: "/favicon.svg", vibrate: [300, 100, 300] });
    }

    // 3. Objectif atteint
    if (goal > 0 && bankroll >= goal) {
      const n = L.goal(bankroll);
      self.registration.showNotification(n.title, { body: n.body, tag: "goal-reached", icon: "/favicon.svg", vibrate: [200, 100, 200, 100, 200] });
    }

    // 4. Résumé quotidien (entre 8h et 10h)
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 10) {
      const resolved = bets.filter(b => b.status === "won" || b.status === "lost");
      const profit = resolved.reduce((a, b) => a + (b.status === "won" ? b.potentialGainEur - b.stakeEur : -b.stakeEur), 0);
      const n = L.summary(bankroll, profit, bets.length);
      self.registration.showNotification(n.title, { body: n.body, tag: "daily-summary", icon: "/favicon.svg" });
    }

    // Mettre à jour le lastCheck
    await cache.put(
      new Request("/_notif_data"),
      new Response(JSON.stringify({ bets, bankroll, goal, lang, lastCheck: now }))
    );

  } catch (err) {
    console.error("SW check error:", err);
  }
}
