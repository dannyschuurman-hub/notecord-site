#!/usr/bin/env python3
"""Release-dag-script notecord.nl. Draaien ALLEEN nadat NoteCord echt in de App Store staat
en Danny ja zegt. Eerst met --dry-run.
  python3 tools/release-dag.py --id 6834597743 --url https://apps.apple.com/nl/app/<naam>/id6834597743 \
      [--badge-en pad/Download_on_the_App_Store_EN.svg --badge-nl pad/..._NL.svg] [--dry-run]
Wat het doet: apple-itunes-app op elke pagina; downloadUrl + offers (gratis) in SoftwareApplication;
CTA 'Volg/Follow the release' en alle badge-links naar de winkel; 'komt binnenkort/coming soon'-teksten
eruit (html, copy.js, llms*.txt); /download/ -> doorverwijzing naar de winkel, noindex weg;
officiele badges (als meegegeven). Daarna zelf: sitemap lastmod, IndexNow, llms.txt nakijken."""
import argparse, glob, re, shutil, sys
ap = argparse.ArgumentParser()
ap.add_argument("--id", required=True); ap.add_argument("--url", required=True)
ap.add_argument("--badge-en"); ap.add_argument("--badge-nl"); ap.add_argument("--dry-run", action="store_true")
a = ap.parse_args()
if not re.fullmatch(r"\d{6,12}", a.id) or not a.url.startswith("https://apps.apple.com/"):
    sys.exit("id of url klopt niet")
URL = a.url
STR = [  # (oud, nieuw)
 ("Coming soon to the App Store", "Download on the App Store"),
 ("Binnenkort in de App Store", "Download in de App Store"),
 ("NoteCord is coming soon to the App Store for iPhone and iPad.", "NoteCord is on the App Store for iPhone and iPad."),
 ("NoteCord komt binnenkort in de App Store voor iPhone en iPad.", "NoteCord staat in de App Store voor iPhone en iPad."),
 ("Follow the release", "Get the app"), ("Volg de release", "Haal de app"),
]
DL = {
 "en": f'<div><h1>NoteCord is on the <mark>App Store</mark></h1><p class="lead">Record, transcribe and summarise conversations on your iPhone or iPad.</p><div class="dl-knoppen"><a class="vp-knop" href="{URL}" rel="noopener">Download on the App Store</a><a class="terug" href="../">Back to the site</a></div></div>',
 "nl": f'<div><h1>NoteCord staat in de <mark>App Store</mark></h1><p class="lead">Neem gesprekken op, schrijf ze uit en vat ze samen op je iPhone of iPad.</p><div class="dl-knoppen"><a class="vp-knop" href="{URL}" rel="noopener">Download in de App Store</a><a class="terug" href="../">Terug naar de site</a></div></div>',
}
tot = {"pagina": 0, "meta": 0, "ld": 0, "cta": 0, "tekst": 0, "download": 0}
files = glob.glob("**/*.html", recursive=True) + ["copy.js", "llms.txt", "llms-full.txt"]
for f in files:
    s0 = s = open(f, encoding="utf-8").read()
    if f.endswith(".html"):
        if "</head>" in s and "apple-itunes-app" not in s:
            s = s.replace("</head>", f'<meta name="apple-itunes-app" content="app-id={a.id}">\n</head>', 1); tot["meta"] += 1
        n = s.count('"@type":"SoftwareApplication"')
        s = s.replace('"@type":"SoftwareApplication",',
            f'"@type":"SoftwareApplication","downloadUrl":"{URL}","offers":{{"@type":"Offer","price":"0","priceCurrency":"EUR"}},', 1) if '"downloadUrl"' not in s else s
        tot["ld"] += n
        s, k = re.subn(r'(<a [^>]*?)href="[^"]*download/"([^>]*>(?:<img[^>]*>|Follow the release|Volg de release)</a>)',
                       lambda m: f'{m.group(1)}href="{URL}"{m.group(2)}', s); tot["cta"] += k
        if re.search(r"(^|/)download/index\.html$", f):
            lang = "nl" if f.startswith("nl/") else "en"
            s, k = re.subn(r'<section class="vp-held">\s*<div>.*?</div></div>\s*</section>',
                           f'<section class="vp-held">\n{DL[lang]}\n</section>', s, flags=re.S)
            s = re.sub(r'<meta name="robots" content="noindex"[^>]*>', "", s); tot["download"] += k
    for old, new in STR:
        if old in s: tot["tekst"] += s.count(old); s = s.replace(old, new)
    if s != s0:
        tot["pagina"] += 1
        if not a.dry_run: open(f, "w", encoding="utf-8").write(s)
if a.badge_en and not a.dry_run: shutil.copy(a.badge_en, "assets/appstore-en.svg")
if a.badge_nl and not a.dry_run: shutil.copy(a.badge_nl, "assets/appstore-nl.svg")
print(("DRY-RUN " if a.dry_run else "") + str(tot))
