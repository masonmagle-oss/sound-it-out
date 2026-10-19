#!/usr/bin/env python3
"""Build dist/sound-it-out-single-file.html: index.html with every sound embedded as base64 (64 kbps mono)."""
import base64, os, re, subprocess, sys, tempfile
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
snd = os.path.join(root, 'sounds')
data = {}
with tempfile.TemporaryDirectory() as tmp:
    for f in sorted(os.listdir(snd)):
        if not f.endswith('.mp3'): continue
        out = os.path.join(tmp, f)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(snd, f), '-ac', '1', '-b:a', '64k', out], check=True)
        data[f[:-4]] = 'data:audio/mpeg;base64,' + base64.b64encode(open(out, 'rb').read()).decode()
items = ','.join('%s:%s' % (repr(k).replace("'", '"'), repr(v).replace("'", '"')) for k, v in data.items())
inject = '<script>window.__SOUNDS={%s};</script>\n' % items
marker = '    if (!force && key in found) return Promise.resolve(found[key]);\n'
patch = marker + '    if (window.__SOUNDS && window.__SOUNDS[key]) { found[key] = window.__SOUNDS[key]; return Promise.resolve(found[key]); }\n'
if marker not in html:
    sys.exit('resolve() marker not found; update tools/build-single-file.py')
html = html.replace(marker, patch, 1)
i = html.index('<script>')
html = html[:i] + inject + html[i:]
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
p = os.path.join(root, 'dist', 'sound-it-out-single-file.html')
open(p, 'w', encoding='utf-8').write(html)
print('wrote', p, round(os.path.getsize(p) / 1e6, 1), 'MB,', len(data), 'sounds')
