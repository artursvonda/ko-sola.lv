"""PROTOTIPS: izvade/*.yaml + avoti -> parskats.html (avots blakus Solījumiem, pārklājums, citātu pārbaude).

Palaist: python3 parskats.py   (vajag PyYAML)
"""
import glob, html, json, os, re, sys
import yaml

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(D, "..", ".."))
# python3 parskats.py [izvades-mape] [CVK nodaļa ...]  (v1: paplašinātā programma pilnā apjomā)
IZV = sys.argv[1] if len(sys.argv) > 1 else "izvade"
NODALAS = tuple(sys.argv[2:]) or ("1. Drošība un aizsardzība", "3. Finanses")
PAP = "avoti/jv-paplasinata-1-3.md" if IZV == "izvade" else "avoti/jv-paplasinata-pilna.txt"


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def cvk_units():
    txt = open(os.path.join(ROOT, "sources/cvk/09-jauna-vienotiba.md"), encoding="utf-8").read()
    paras = [p.strip() for p in txt.split("\n\n")]
    units, cur = [], None
    for p in paras:
        if re.match(r"^\d+\. ", p):
            cur = p if p in NODALAS else None
            if cur:
                units.append({"k": "h", "t": p})
            continue
        if cur:
            for s in re.split(r"(?<=[.!?])\s+(?=[A-ZĀČĒĢĪĶĻŅŠŪŽ])", p):
                units.append({"k": "s", "t": norm(s)})
    return units


def pap_units():
    txt = open(os.path.join(D, PAP), encoding="utf-8").read()
    if txt.startswith("---"):
        txt = txt.split("---", 2)[2]
    ch = None
    lines = [l for l in txt.splitlines() if not l.startswith("<<<PAGE")]
    units, buf, sect = [], None, None

    def flush():
        nonlocal buf
        if buf:
            units.append(buf)
            buf = None

    for l in lines:
        s = l.strip()
        if not s:
            flush()
            continue
        if s.startswith("•"):
            flush()
            buf = {"k": "b", "t": norm(s[1:]), "sect": sect, "ch": ch}
            continue
        if buf and buf["k"] in ("b", "p"):
            buf["t"] = norm(buf["t"] + " " + s)
            continue
        if re.match(r"^\d+\. ", s) or s in ("10 000 zīmju programmas apsolījums", "Prioritātes",
                                           "Apņemšanās un uzdevumi", "Pamatojums") or (len(s) < 70 and not s.endswith(".")):
            flush()
            if re.match(r"^\d+\. ", s):
                ch = norm(s)
            if s in ("Prioritātes", "Apņemšanās un uzdevumi", "Pamatojums", "10 000 zīmju programmas apsolījums"):
                sect = s
            units.append({"k": "h", "t": s})
            continue
        buf = {"k": "p", "t": norm(s), "sect": sect, "ch": ch}
    flush()
    return units


def link(units, quotes, src):
    full, spans = "", []
    for u in units:
        if full:
            full += " "
        spans.append((len(full), len(full) + len(u["t"])))
        full += u["t"]
        u["ids"] = []
    bad = []
    for sid, q in quotes:
        if q["veids"] != src:
            continue
        c = norm(q["citats"])
        i = full.find(c)
        # izlaiž paplašinātajā iekļauto CVK kopiju, ja citāts atrodams arī citur
        while i >= 0 and any(a <= i < b and u.get("sect") == "10 000 zīmju programmas apsolījums" for u, (a, b) in zip(units, spans)):
            j = full.find(c, i + 1)
            if j < 0:
                break
            i = j
        if i < 0:
            bad.append((sid, c))
            continue
        for u, (a, b) in zip(units, spans):
            if a < i + len(c) and i < b and sid not in u["ids"]:
                u["ids"].append(sid)
                u.setdefault("q", []).append([max(i, a) - a, min(i + len(c), b) - a, sid])
    return bad


sol = []
for f in sorted(glob.glob(os.path.join(D, IZV, "*.yaml"))):
    sol.append(yaml.safe_load(open(f, encoding="utf-8")))
quotes = [(s["id"], a) for s in sol for a in s.get("avoti", [])]
cvk, pap = cvk_units(), pap_units()
bad = link(cvk, quotes, "cvk") + link(pap, quotes, "paplasinata")
summary = ""
p = os.path.join(D, IZV, "_kopsavilkums.md")
if os.path.exists(p):
    summary = open(p, encoding="utf-8").read()

for u in pap:
    u["scope"] = u.get("ch") in NODALAS
data = json.dumps({"title": "JV · " + ", ".join(NODALAS), "sol": sol, "cvk": cvk, "pap": pap, "bad": bad, "summary": summary}, ensure_ascii=False)
tpl = open(os.path.join(D, "parskats.tpl.html"), encoding="utf-8").read()
open(os.path.join(D, IZV, "parskats.html") if IZV != "izvade" else os.path.join(D, "parskats.html"), "w", encoding="utf-8").write(tpl.replace("/*DATA*/null", data))
print(f"{len(sol)} Solījumi, {len(bad)} citāti nav atrasti avotā")
for b in bad:
    print("  NAV AVOTĀ:", b)
sys.exit(1 if bad else 0)
