#!/bin/sh
# Merge the original AeroTizen's newest changes into this fork. See docs/fork.md.
set -eu

UPSTREAM_URL="https://github.com/helalaou/AeroTizen.git"

if [ -n "$(git status --porcelain)" ]; then
  echo "Commit or stash your changes first." >&2
  exit 1
fi

git remote get-url upstream >/dev/null 2>&1 || git remote add upstream "$UPSTREAM_URL"
git fetch upstream --tags

behind="$(git rev-list --count HEAD..upstream/main)"
if [ "$behind" = "0" ]; then
  echo "Already up to date with upstream."
  exit 0
fi

echo "Upstream has $behind new commit(s):"
git log --oneline HEAD..upstream/main
echo
if git merge --no-edit upstream/main; then
  echo
  echo "Merged. Now run the checks in docs/fork.md, then push."
else
  echo
  echo "Resolve the conflicts (the files to watch are in docs/fork.md), then commit." >&2
  exit 1
fi
