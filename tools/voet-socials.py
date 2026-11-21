#!/usr/bin/env python3
"""Zet Instagram + Facebook in de footer van elke pagina (idempotent).
Alleen accounts die in onze bronnen staan (SEO-audit 21-11). TikTok: nog niet, naam onzeker."""
import glob, re
IG = "https://www.instagram.com/notecordapp/"
FB = "https://www.facebook.com/notecordapp"
TXT = {"nl": "Volg ons", "en": "Follow us"}
n = 0
for f in glob.glob("**/index.html", recursive=True):
    s = open(f, encoding="utf-8").read()
    if "v-social" in s or "</footer>" not in s:
        continue
    m = re.search(r'<html lang="(\w+)"', s)
    t = TXT.get(m.group(1) if m else "en", TXT["en"])
    p = (f'<p class="v-social">{t}: <a href="{IG}" rel="me noopener">Instagram</a> · '
         f'<a href="{FB}" rel="me noopener">Facebook</a></p>')
    s = s.replace("</footer>", p + "</footer>", 1)
    open(f, "w", encoding="utf-8").write(s)
    n += 1
print("footers bijgewerkt:", n)
