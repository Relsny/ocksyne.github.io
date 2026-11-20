#!/bin/bash
# Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
# ACTIVER le démarrage automatique (Mac)

# Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.
set -u

xml_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

abs_path() {
  local target="$1"
  if command -v realpath >/dev/null 2>&1; then
    realpath "$target"
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$target"
    return
  fi
  local dir base
  dir=$(cd "$(dirname "$target")" && pwd)
  base=$(basename "$target")
  printf '%s/%s\n' "$dir" "$base"
}

script_dir() {
  local src="${1:-$0}"
  local dir
  dir=$(dirname "$src")
  (cd "$dir" && pwd)
}

is_bot_dir() {
  local d="$1"
  [ -n "$d" ] && [ -d "$d" ] && [ -f "$d/package.json" ] && { [ -f "$d/src/index.js" ] || [ -f "$d/src/token.js" ]; }
}

# Dossier du bot : celui du script, son parent, un sous-dossier (ex. fichiers-du-bot), sinon on demande.
detect_bot_dir() {
  local here parent d
  here=$(script_dir "${1:-$0}")
  parent=$(cd "$here/.." && pwd)

  if is_bot_dir "$here"; then
    printf '%s\n' "$here"
    return 0
  fi
  if is_bot_dir "$parent"; then
    printf '%s\n' "$parent"
    return 0
  fi
  for d in "$here"/*; do
    [ -d "$d" ] || continue
    if is_bot_dir "$d"; then
      printf '%s\n' "$d"
      return 0
    fi
  done
  for d in "$parent"/*; do
    [ -d "$d" ] || continue
    if is_bot_dir "$d"; then
      printf '%s\n' "$d"
      return 0
    fi
  done
  return 1
}

normalize_user_path() {
  local input="$1"
  input="${input#"${input%%[![:space:]]*}"}"
  input="${input%"${input##*[![:space:]]}"}"
  case "$input" in
    \"*\") input="${input#\"}"; input="${input%\"}" ;;
    \'*\') input="${input#\'}"; input="${input%\'}" ;;
  esac
  # Le Terminal peut laisser un / à la fin quand on glisse un dossier.
  input="${input%/}"
  printf '%s\n' "$input"
}

ask_bot_dir() {
  local input=""
  echo "Le dossier du bot n’a pas été trouvé automatiquement."
  echo "C’est le dossier qui contient le fichier package.json (souvent « fichiers-du-bot »)."
  echo "Glissez-le dans cette fenêtre, puis appuyez sur Entrée."
  if command -v osascript >/dev/null 2>&1; then
    echo "Vous pouvez aussi laisser la ligne vide et appuyer sur Entrée pour l’ouvrir dans un sélecteur."
  fi
  printf 'Dossier du bot : '
  IFS= read -r input || true
  input=$(normalize_user_path "$input")
  if [ -z "$input" ] && command -v osascript >/dev/null 2>&1; then
    input=$(osascript -e 'POSIX path of (choose folder with prompt "Choisissez le dossier du bot (celui qui contient package.json).")' 2>/dev/null || true)
    input=$(normalize_user_path "$input")
  fi
  if [ -z "$input" ]; then
    echo "Aucun dossier n’a été indiqué."
    return 1
  fi
  if [ -d "$input" ]; then
    input=$(cd "$input" && pwd)
  fi
  if ! is_bot_dir "$input"; then
    echo "Ce dossier ne ressemble pas à un bot DCAS (package.json et src/index.js sont absents)."
    return 1
  fi
  printf '%s\n' "$input"
}

resolve_bot_dir() {
  local found
  if [ -n "${DCAS_BOT_DIR:-}" ]; then
    if is_bot_dir "$DCAS_BOT_DIR"; then
      printf '%s\n' "$(cd "$DCAS_BOT_DIR" && pwd)"
      return 0
    fi
    echo "Le dossier indiqué dans DCAS_BOT_DIR n’est pas un bot DCAS."
    return 1
  fi
  if found=$(detect_bot_dir "$0"); then
    printf '%s\n' "$found"
    return 0
  fi
  if [ "${DCAS_AUTOSTART_TEST:-}" = "1" ] || [ "${DCAS_AUTOSTART_DRY_RUN:-}" = "1" ]; then
    return 1
  fi
  ask_bot_dir
}

find_node() {
  local p candidates="" node
  if [ -n "${DCAS_NODE_PATH:-}" ] && [ -x "${DCAS_NODE_PATH}" ]; then
    abs_path "$DCAS_NODE_PATH"
    return 0
  fi
  export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-/usr/bin:/bin}"
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
  fi
  if [ -s "$HOME/.fnm/fnm" ] || command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env 2>/dev/null)" || true
  fi
  for p in \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME/.nvm/versions/node"/*/bin/node \
    "$HOME/.fnm/aliases/default/bin/node" \
    "$HOME/.local/share/fnm/aliases/default/bin/node"
  do
    if [ -x "$p" ]; then
      candidates="$candidates
$p"
    fi
  done
  if command -v node >/dev/null 2>&1; then
    candidates="$candidates
$(command -v node)"
  fi
  node=$(printf '%s\n' "$candidates" | sed '/^$/d' | head -n 1)
  if [ -z "$node" ]; then
    return 1
  fi
  abs_path "$node"
}

find_npm_near_node() {
  local node="$1" dir npm
  dir=$(dirname "$node")
  if [ -x "$dir/npm" ]; then
    abs_path "$dir/npm"
    return 0
  fi
  if command -v npm >/dev/null 2>&1; then
    abs_path "$(command -v npm)"
    return 0
  fi
  return 1
}

write_plist() {
  local dest="$1" bot="$2" node="$3"
  local label="fr.dcas.bot"
  local log="$bot/logs/dcas-autostart.log"
  local index="$bot/src/index.js"
  local node_bin
  node_bin=$(dirname "$node")
  mkdir -p "$(dirname "$dest")" "$bot/logs"
  cat > "$dest" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>WorkingDirectory</key>
  <string>$(xml_escape "$bot")</string>
  <key>ProgramArguments</key>
  <array>
    <string>$(xml_escape "$node")</string>
    <string>$(xml_escape "$index")</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>ThrottleInterval</key>
  <integer>10</integer>
  <key>StandardOutPath</key>
  <string>$(xml_escape "$log")</string>
  <key>StandardErrorPath</key>
  <string>$(xml_escape "$log")</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>$(xml_escape "$node_bin"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>LANG</key>
    <string>fr_FR.UTF-8</string>
  </dict>
</dict>
</plist>
PLIST
}

plist_path() {
  printf '%s\n' "${HOME}/Library/LaunchAgents/fr.dcas.bot.plist"
}

agent_label() {
  printf '%s\n' "gui/$(id -u)/fr.dcas.bot"
}

pause_end() {
  if [ "${DCAS_AUTOSTART_TEST:-}" = "1" ] || [ "${DCAS_AUTOSTART_DRY_RUN:-}" = "1" ]; then
    return 0
  fi
  echo
  read -r -p "Appuyez sur Entrée pour fermer." _
}

agent_loaded() {
  local label
  label=$(agent_label)
  if launchctl print "$label" >/dev/null 2>&1; then
    return 0
  fi
  if launchctl list "fr.dcas.bot" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}



echo "DCAS — Démarrage automatique (macOS)"
echo "Le bot sera lancé à l’ouverture de votre session. Ce n’est pas un hébergement :"
echo "s’il s’éteint, se met en veille ou perd Internet, le bot s’arrête."
echo

bot=$(resolve_bot_dir) || {
  echo "Impossible de trouver le dossier du bot."
  pause_end
  exit 1
}

node=$(find_node) || {
  echo "Node.js est introuvable. Installez la version LTS depuis https://nodejs.org/"
  echo "ou avec Homebrew, puis relancez ce fichier."
  pause_end
  exit 1
}

if [ ! -f "$bot/src/index.js" ]; then
  echo "Le fichier src/index.js est absent de :"
  echo "  $bot"
  pause_end
  exit 1
fi

if [ ! -d "$bot/node_modules" ]; then
  echo "Les composants du bot ne sont pas encore installés. Installation en cours…"
  npm_bin=$(find_npm_near_node "$node" || true)
  if [ -z "${npm_bin:-}" ]; then
    echo "npm est introuvable à côté de Node.js. Lancez d’abord « LANCER LE BOT (Mac) » une fois."
    pause_end
    exit 1
  fi
  (cd "$bot" && "$npm_bin" install) || {
    echo "L’installation a échoué. Ouvrez le lanceur habituel du bot, puis réessayez."
    pause_end
    exit 1
  }
fi

mkdir -p "$bot/logs"
dest=$(plist_path)
if [ -n "${DCAS_PLIST_OUT:-}" ]; then
  dest="$DCAS_PLIST_OUT"
fi
write_plist "$dest" "$bot" "$node"
echo "Dossier du bot :"
echo "  $bot"
echo "Node.js :"
echo "  $node"
echo "Journal :"
echo "  $bot/logs/dcas-autostart.log"

if [ "${DCAS_AUTOSTART_TEST:-}" = "1" ] || [ "${DCAS_AUTOSTART_DRY_RUN:-}" = "1" ]; then
  echo "Mode test : le fichier launchd a été écrit, sans l’enregistrer sur la session."
  echo "$dest"
  exit 0
fi

uid=$(id -u)
label="gui/${uid}/fr.dcas.bot"
launchctl bootout "$label" >/dev/null 2>&1 || launchctl unload "$dest" >/dev/null 2>&1 || true
if ! launchctl bootstrap "gui/${uid}" "$dest" 2>/dev/null; then
  if ! launchctl load -w "$dest"; then
    echo "Impossible d’enregistrer l’agent launchd. Vérifiez les droits sur ~/Library/LaunchAgents."
    pause_end
    exit 1
  fi
fi
launchctl enable "$label" >/dev/null 2>&1 || true
launchctl kickstart -k "$label" >/dev/null 2>&1 || true

echo
echo "C’est enregistré. À la prochaine ouverture de session, le bot démarrera tout seul."
echo "Il tourne en arrière-plan (pas besoin de laisser une fenêtre ouverte)."
echo "Pour vérifier : double-cliquez sur « ETAT du bot (Mac) »."
echo "Pour annuler : « DESACTIVER le démarrage automatique (Mac) »."
pause_end
