#!/usr/bin/env python3
"""Cut an ElevenLabs take into separate sounds at silent gaps. Usage: cut-take.py take.mp3 out-prefix [stem|head:MS|skip:MS]
'head:MS' keeps only the first MS of each piece, 'skip:MS' drops the first MS.
'stem' ends each piece at the first dip after its loudest point, to keep a vowel and drop a closing k (ack -> a).
Writes <out-prefix>-1.mp3, -2.mp3 ... (10 ms RMS windows, gap >= 70 ms splits, 60 ms fade, adelay 40, loudnorm -18, 44.1 kHz mono 128 kbps)."""
import array, math, subprocess, sys
src, prefix = sys.argv[1], sys.argv[2]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 's16le', '-ac', '1', '-ar', '44100', '-'], capture_output=True, check=True).stdout
s = array.array('h'); s.frombytes(pcm)
W = 441
rms = [math.sqrt(sum(x * x for x in s[i:i + W]) / W) for i in range(0, len(s) - W, W)]
thr = max(rms) * 0.03  # shortcut: fixed -30 dB gate relative to the loudest window; lower it if a soft sound is cut off
segs, start, gap = [], None, 0
for i, r in enumerate(rms):
    if r > thr:
        if start is None: start = i
        gap = 0; end = i
    elif start is not None:
        gap += 1
        if gap >= 7: segs.append((start, end)); start = None
if start is not None: segs.append((start, end))
for n, (a, b) in enumerate(segs, 1):
    for opt in sys.argv[3:]:
        if opt.startswith('head:'): b = min(b, a + int(opt[5:]) // 10)
        if opt.startswith('skip:'): a = min(b, a + int(opt[5:]) // 10)
    if 'stem' in sys.argv[3:]:
        pk = max(range(a, b + 1), key=lambda i: rms[i])
        b = next((i for i in range(pk, b + 1) if rms[i] < rms[pk] * 0.12), b)
    a = max(0, a - 1); d = (b - a + 2) * 0.01
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a * 0.01:.2f}', '-t', f'{d:.2f}', '-i', src,
        '-af', f'afade=t=in:d=0.01,afade=t=out:st={max(d - 0.06, 0):.2f}:d=0.06,adelay=40,apad=pad_dur=0.1,loudnorm=I=-18',
        '-ac', '1', '-ar', '44100', '-b:a', '128k', f'{prefix}-{n}.mp3'], check=True)
    print(f'{prefix}-{n}.mp3 {d:.2f}s')
