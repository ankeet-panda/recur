"""Stitch the production build into one self-contained HTML page for the shared link.

Usage (from this folder):
  node app/node_modules/vite/bin/vite.js build app      (after the type check)
  python -I package.py
Writes publish/recur.html: title, the font stylesheet link (Google Fonts, allowed by the artifact viewer),
the inlined stylesheet and the inlined module script. No other outside requests.
"""
import glob
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(HERE, 'app', 'dist')

css_files = glob.glob(os.path.join(DIST, 'assets', '*.css'))
js_files = glob.glob(os.path.join(DIST, 'assets', '*.js'))
assert len(css_files) == 1 and len(js_files) == 1, (css_files, js_files)
css = open(css_files[0], encoding='utf-8').read()
js = open(js_files[0], encoding='utf-8').read()
assert 'url(/' not in css and 'url("/' not in css, 'an asset was not inlined'

js = js.replace('</script', r'<\/script')
css = css.replace('</style', r'<\/style')

FONTS = ('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500'
         '&family=Hanken+Grotesk:wght@400;500;600&display=swap')
page = f'''<title>Recur</title>
<link rel="icon" href="data:,">
<meta name="description" content="Recur: a subscriptions tracker concept with a month dial, price-rise alerts and hold-to-cancel.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>{css}</style>
<div id="root"></div>
<script type="module">{js}</script>
'''
out = os.path.join(HERE, 'publish', 'recur.html')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8', newline='\n').write(page)
# A full page beside it, for opening the local file directly in a browser
full = f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n{page}</html>\n'
open(os.path.join(HERE, 'publish', 'recur-local.html'), 'w', encoding='utf-8', newline='\n').write(full)
print(out, f'{len(page.encode("utf-8")) / 1024:.0f} KB')
