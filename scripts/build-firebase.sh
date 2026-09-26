#!/usr/bin/env bash
# Builds three self-contained Firebase Hosting sites from this repo:
#   dist/home    -> learnkyrgyz.web.app
#   dist/student -> studentlrnkyrgyz.web.app
#   dist/teacher -> teachlrnkyrgyz.web.app
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/home dist/student dist/teacher dist/hub dist/oldhub
# Game question bank for Quoldek and other quiz games (/api/quoldek/v1).
if command -v node >/dev/null; then node scripts/quoldek-feed.mjs; fi
cp index.html sw.js dist/home/
cp -R assets api dist/home/
for app in student teacher; do
  cp -R assets "dist/$app/"
  cp "$app/app.js" "dist/$app/app.js"
  cp sw.js "dist/$app/"
  # The apps live one folder deep in the repo; on their own site they sit at the root.
  sed 's#\.\./assets/#assets/#g' "$app/index.html" > "dist/$app/index.html"
  sed -i 's#"\.\./assets/#"./assets/#g' "dist/$app/app.js"
done
# oneinfour.web.app — the one-account hub (oneintwo.web.app forwards to it)
cp -R assets "dist/hub/"
for f in index.html hub.css; do sed 's#\.\./assets/#assets/#g' "oneinfour/$f" > "dist/hub/$f"; done
# module imports must stay relative ("./assets/…"), or the browser refuses to load them
sed 's#"\.\./assets/#"./assets/#g' oneinfour/hub.js > dist/hub/hub.js
printf '<!doctype html><meta http-equiv="refresh" content="0;url=https://oneinfour.web.app/">\n' > dist/oldhub/index.html
echo "Built dist/{home,student,teacher,hub,oldhub}"
