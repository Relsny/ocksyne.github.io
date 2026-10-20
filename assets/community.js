(async function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const views = $("ock-views");
  const followers = $("ock-followers");
  const button = $("ock-subscribe");
  const message = $("ock-community-status");
  const config = window.OCKSYNE_COMMUNITY || {};
  const siteKey = window.OCKSYNE_TURNSTILE_SITE_KEY;
  const turnstileBox = $("ock-turnstile");

  const ready = Boolean(
    config.url && config.key &&
    !config.url.includes("REMPLACER") &&
    !config.key.includes("REMPLACER") &&
    window.supabase && siteKey && turnstileBox
  );

  function status(value) {
    if (message) message.textContent = value;
  }

  if (!ready) {
    status("Configuration des abonnements indisponible.");
    button.disabled = true;
    return;
  }

  const db = window.supabase.createClient(config.url, config.key);
  let busy = false;
  let widgetId = null;

  async function refresh() {
    const result = await db.rpc("ocksyne_counts");
    if (result.error) throw result.error;
    const stats = result.data || {};
    views.textContent = Number(stats.views || 0).toLocaleString("fr-FR");
    followers.textContent = Number(stats.followers || 0).toLocaleString("fr-FR");
  }

  async function getUser() {
    const result = await db.auth.getUser();
    if (result.error && result.error.name !== "AuthSessionMissingError") {
      throw result.error;
    }
    return result.data.user;
  }

  async function isFollowing(user) {
    if (!user) return false;
    const result = await db.from("ocksyne_followers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (result.error) throw result.error;
    return Boolean(result.data);
  }

  async function updateButton() {
    const user = await getUser();
    const following = await isFollowing(user);
    button.textContent = following ? "✓ Abonné — Ne plus suivre" : "Suivre Ocksyne";
    button.setAttribute("aria-pressed", String(following));
  }

  async function trackView() {
    if (location.protocol !== "https:") return;

    let token;
    try {
      token = localStorage.getItem("ocksyne-visitor-v1");
      if (!token || !/^[0-9a-f]{32}$/.test(token)) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        token = Array.from(bytes, x => x.toString(16).padStart(2,"0")).join("");
        localStorage.setItem("ocksyne-visitor-v1", token);
      }
    } catch {
      return;
    }

    const result = await db.rpc("ocksyne_record_view", {
      visitor_key: token
    });

    if (result.error) {
      status("Enregistrement de visite indisponible.");
    }
  }


  async function changeFollow(user) {
    const existing = await isFollowing(user);
    const result = existing
      ? await db.from("ocksyne_followers")
          .delete().eq("user_id", user.id)
      : await db.from("ocksyne_followers")
          .insert({user_id: user.id});

    if (result.error) throw result.error;

    await refresh();
    await updateButton();
    status(existing ? "Abonnement retiré." : "Tu suis désormais Ocksyne !");
  }

  async function anonymousFollow(captchaToken) {
    try {
      status("Connexion anonyme sécurisée...");
      const result = await db.auth.signInAnonymously({
        options: { captchaToken }
      });
      if (result.error) throw result.error;
      if (!result.data.user) throw new Error("Session anonyme indisponible.");
      await changeFollow(result.data.user);
    } catch (err) {
      status(err.message || "Abonnement impossible.");
    } finally {
      busy = false;
      button.disabled = false;
      if (widgetId !== null && window.turnstile) {
        window.turnstile.remove(widgetId);
        widgetId = null;
      }
    }
  }

  button.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    button.disabled = true;

    try {
      const user = await getUser();
      if (user) {
        await changeFollow(user);
        busy = false;
        button.disabled = false;
        return;
      }

      if (!window.turnstile) {
        throw new Error("Protection Turnstile non chargée. Actualise la page.");
      }

      status("Vérification de sécurité...");
      if (widgetId !== null) {
        window.turnstile.remove(widgetId);
        widgetId = null;
      }

      widgetId = window.turnstile.render("#ock-turnstile", {
        sitekey: siteKey,
        theme: "dark",
        appearance: "interaction-only",
        execution: "execute",
        callback: token => { anonymousFollow(token); },
        "error-callback": () => {
          status("Vérification impossible. Réessaie.");
          if (widgetId !== null) {
            window.turnstile.remove(widgetId);
            widgetId = null;
          }
          busy = false;
          button.disabled = false;
        }
      });

      window.turnstile.execute(widgetId);
    } catch (err) {
      status(err.message || "Erreur de connexion.");
      busy = false;
      button.disabled = false;
    }
  });

  button.disabled = false;

  try {
    await trackView();
    await refresh();
    await updateButton();
    status("Statistiques actualisées.");
  } catch (err) {
    status("Erreur : " + (err.message || "Statistiques indisponibles."));
  }

  db.auth.onAuthStateChange(() => {
    setTimeout(() => {
      updateButton().catch(err => status(err.message));
    }, 0);
  });
})();
