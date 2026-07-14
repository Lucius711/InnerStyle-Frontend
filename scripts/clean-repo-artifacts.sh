#!/usr/bin/env bash
# Repo hygiene cleanup (finding m2). Removes committed build artifacts and Vite's transient config
# cache from git tracking and from disk. Safe to re-run. Run from the frontend repo root:
#   bash scripts/clean-repo-artifacts.sh
#
# The files are already covered by .gitignore, so after this runs they stay untracked.
set -euo pipefail

echo "Untracking + deleting Vite timestamp config caches..."
git rm --cached -q -- 'vite.config.js.timestamp-*.mjs' 2>/dev/null || true
rm -f vite.config.js.timestamp-*.mjs || true

echo "Untracking build/test artifact directories..."
git rm --cached -r -q -- dist playwright-report test-results 2>/dev/null || true

echo "Removing one-off scratch scripts (if present)..."
for f in _axis.mjs _t.mjs _test3mf.mjs chk.cjs; do
  git rm --cached -q -- "$f" 2>/dev/null || true
  rm -f "$f" || true
done

echo "Done. Review 'git status' then commit the cleanup."
