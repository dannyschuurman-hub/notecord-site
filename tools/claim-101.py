#!/usr/bin/env python3
"""Claim '0 verbindingen' koppelen aan de eenmalige modeldownload. Draaien samen met het live
komen van NoteCord 1.0.1 (model uit Apple-hosting), niet eerder: in 1.0 (54) bestaat de download niet."""
import glob
PAIRS = [
 ("Measured in Apple’s iPhone simulator during recording, transcription and summarisation.",
  "Measured in NoteCord’s network traffic during recording, transcription and summarisation, after the one-time download of the accurate model."),
 ("Gemeten in de iPhone-simulator van Apple tijdens het opnemen, uitschrijven en samenvatten.",
  "Gemeten in het netwerkverkeer van NoteCord tijdens opnemen, uitschrijven en samenvatten, na de eenmalige download van het nauwkeurige model."),
]
n = 0
for f in glob.glob("**/*.html", recursive=True) + ["copy.js", "llms.txt", "llms-full.txt"]:
    s = o = open(f, encoding="utf-8").read()
    for a, b in PAIRS: s = s.replace(a, b)
    if s != o: open(f, "w", encoding="utf-8").write(s); n += 1; print(f)
print("bestanden:", n)
