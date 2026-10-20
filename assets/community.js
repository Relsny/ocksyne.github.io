
(async function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const views = $("ock-views");
  const followers = $("ock-followers");
  const button = $("ock-subscribe");
  const message = $("ock-community-status");
  const email = $("ock-email");
  const login = $("ock-email-login");
  const config = window.OCKSYNE_COMMUNITY || {};

  const ready = Boolean(
    config.url &&
    config.key &&
    !config.url.includes("REMPLACER") &&
    !config.key.includes("REMPLACER") &&
    window.supabase
  );

  function status(value) {
    message.textContent = value;
  }

  if (!ready) {
    status("Statistiques en attente de configuration.");
    button.disabled = true;
    login.disabled = true;
    return;
  }

  const db = window.supabase.createClient(config.url, config.key);

  async function refresh() {
    const result = await db.rpc("ocksyne_counts");
    if (result.error) {
      status("Statistiques indisponibles : " + result.error.message);
      return;
    }
    views.textContent = Number(result.data.views || 0).toLocaleString("fr-FR");
    followers.textContent = Number(result.data.followers || 0).toLocaleString("fr-FR");
  }

  async function getUser() {
    const result = await db.auth.getUser();
    return result.data.user;
  }

  async function updateButton() {
    const user = await getUser();
    if (!user) {
      button.textContent = "Se connecter pour suivre";
      return;
    }

    const result = await db.from("ocksyne_followers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    button.textContent = result.data ? "Se désabonner" : "S’abonner";
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

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      const user = await getUser();
      if (!user) {
        status("Entre ton email pour recevoir un lien de connexion.");
        email.focus();
        return;
      }

      const existing = await db.from("ocksyne_followers")
        .select("user_id").eq("user_id",user.id).maybeSingle();
      if (existing.error) throw existing.error;

      const change = existing.data
        ? await db.from("ocksyne_followers").delete().eq("user_id",user.id)
        : await db.from("ocksyne_followers").insert({user_id:user.id});

      if (change.error) throw change.error;
      await refresh();
      await updateButton();
      status(existing.data ? "Abonnement retiré." : "Tu suis désormais Ocksyne.");
    } catch (err) {
      status(err.message || "Erreur de connexion.");
    } finally {
      button.disabled = false;
    }
  });

  login.addEventListener("click", async () => {
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      status("La connexion sera disponible sur le site publié en HTTPS.");
      return;
    }
    const address = email.value.trim();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(address)) {
      status("Entre une adresse email valide.");
      return;
    }

    login.disabled = true;
    const result = await db.auth.signInWithOtp({
      email: address,
      options: {emailRedirectTo: location.origin + location.pathname}
    });

    status(result.error ? result.error.message : "Vérifie ta boîte email pour te connecter.");
    login.disabled = false;
  });

  $("ock-logout").addEventListener("click", async () => {
    await db.auth.signOut();
    await updateButton();
    status("Déconnecté.");
  });

  await trackView();
  await refresh();
  await updateButton();

  db.auth.onAuthStateChange(() => {
    setTimeout(() => updateButton(),0);
  });
})();
