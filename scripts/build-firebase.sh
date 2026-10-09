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
# recoon.web.app — the one-account hub (the4workspace, oneintwo and oneinfour forward to it)
cp -R assets "dist/hub/" && cp -R oneinfour/icons oneinfour/icon.svg oneinfour/switcher.js oneinfour/sw.js oneinfour/manifest.webmanifest oneinfour/icon-192.png oneinfour/icon-512.png oneinfour/icon-maskable-512.png oneinfour/apple-touch-icon.png oneinfour/share.png "dist/hub/"
for f in index.html hub.css; do sed 's#\.\./assets/#assets/#g' "oneinfour/$f" > "dist/hub/$f"; done
# module imports must stay relative ("./assets/…"), or the browser refuses to load them
sed 's#"\.\./assets/#"./assets/#g' oneinfour/hub.js > dist/hub/hub.js
printf '<!doctype html><meta http-equiv="refresh" content="0;url=https://recoon.web.app/">\n' > dist/oldhub/index.html
# world-islands.web.app — World Islands (signs in through Recoon; banda-worldislands and bandaworld forward to it)
cp -R banda dist/banda
# robots.txt + sitemap.xml so Google can find and list each site
seo() { # dir host [noindex]
  if [ "${3:-}" = noindex ]; then printf 'User-agent: *\nDisallow: /\n' > "$1/robots.txt"; return; fi
  printf 'User-agent: *\nAllow: /\n\nSitemap: https://%s/sitemap.xml\n' "$2" > "$1/robots.txt"
  printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://%s/</loc><lastmod>%s</lastmod></url>\n</urlset>\n' "$2" "$(date -u +%Y-%m-%d)" > "$1/sitemap.xml"
}
seo dist/home learnkyrgyz.web.app
seo dist/student studentlrnkyrgyz.web.app
seo dist/teacher teachlrnkyrgyz.web.app
seo dist/hub recoon.web.app
seo dist/oldhub oneintwo.web.app noindex
seo dist/banda world-islands.web.app
echo "Built dist/{home,student,teacher,hub,oldhub,banda}"
