#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

BRANCH="${1:-$(git branch --show-current)}"
REMOTE="${REMOTE_NAME:-origin}"

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERR]${NC} $1"
}

if [ -z "$BRANCH" ]; then
  log_error "Impossible de determiner la branche courante."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log_error "Ce script doit etre execute depuis un depot Git."
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  log_error "Le remote '$REMOTE' est introuvable."
  exit 1
fi

log_info "Remote cible: $REMOTE"
log_info "Branche cible: $BRANCH"

STATUS="$(git status --short)"
if [ -z "$STATUS" ]; then
  log_warn "Aucun changement detecte. Le push enverra seulement ce qui est deja committe."
else
  log_info "Etat du depot:"
  echo "$STATUS"
fi

if git diff --cached --name-only | grep -Eq '^(\.env|backend/\.env|frontend/\.env)$'; then
  log_warn "Un fichier .env est stage. Verifie bien que tu ne pushes pas de secrets."
fi

log_info "Verification backend..."
(cd backend && npm run build)
log_success "Build backend OK"

log_info "Verification frontend..."
(cd frontend && npm run typecheck)
log_success "Typecheck frontend OK"

log_info "Tests frontend..."
npm test
log_success "Tests OK"

log_info "Push vers $REMOTE/$BRANCH..."
git push "$REMOTE" "$BRANCH"
log_success "Push termine avec succes"
