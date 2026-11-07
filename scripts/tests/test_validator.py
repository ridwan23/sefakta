import json, copy, subprocess, os, shutil, sys, tempfile
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
TMP=tempfile.mkdtemp(prefix="sefakta_fx_")
def src(origin,url,quote,acc="2026-11-01"): return {"title":"T","url":url,"publisher":"P","origin":origin,"accessed":acc,"quote":quote}
BASE={"projectId":"t","title":"t","series":"Alam","status":"draft","captionMode":"subtitle",
 "scenes":[{"id":"a","durationSeconds":30,"voiceoverText":"Gunung itu setinggi seribu delapan ratus lima belas meter.","factIds":["f1"]},
           {"id":"b","durationSeconds":30,"voiceoverText":"Satu fakta saja.","factIds":[]}],
 "facts":[{"id":"f1","claim":"Tinggi gunung","kind":"fakta","status":"terverifikasi","figures":[{"text":"1815 m","value":1815}],
   "sources":[src("Lembaga A","https://example.org/a","tinggi 1815 meter"),src("Lembaga B","https://example.net/b","height 1,815 meters")]}],
 "numbersIgnored":[]}
def run(brief,*flags,raw=None):
    d=os.path.join(TMP,"case"); shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    open(d+"/t.json","w").write(raw if raw is not None else json.dumps(brief))
    r=subprocess.run(["node","--no-warnings","--experimental-strip-types","scripts/validate-facts.ts","--dir="+d,*flags],cwd=ROOT,capture_output=True,text=True)
    return r.returncode, r.stdout
def mut(fn):
    b=copy.deepcopy(BASE); fn(b); return b
fails=0
def check(name,res,code,needle=None):
    global fails
    ok = res[0]==code and (needle is None or needle in res[1])
    print(("PASS" if ok else "FAIL"),name,"" if ok else f"-> exit {res[0]} (mau {code}), butuh '{needle}'\n{res[1]}")
    fails+= (not ok)
check("T0 brief valid",run(BASE),0)
check("T1 dua sumber, origin sama",run(mut(lambda b:b["facts"][0]["sources"][1].update(origin="Lembaga A"))),1,"tidak independen")
check("T2 hanya 1 sumber",run(mut(lambda b:b["facts"][0].update(sources=b["facts"][0]["sources"][:1]))),1,"hanya 1 sumber")
check("T3 angka tidak ada di quote sumber ke-2",run(mut(lambda b:b["facts"][0]["sources"][1].update(quote="tinggi sekitar 2000 meter"))),1,"hanya ada di quote 1 sumber")
check("T4 angka naskah tak tercakup fakta",run(mut(lambda b:b["scenes"][1].update(voiceoverText="Jatuh sembilan puluh kaki."))),1,"= 90")
check("T5 angka diabaikan + alasan",run(mut(lambda b:(b["scenes"][1].update(voiceoverText="Jatuh sembilan puluh kaki."),b.update(numbersIgnored=[{"value":90,"reason":"ilustrasi"}])))),0)
check("T5b numbersIgnored tanpa alasan",run(mut(lambda b:b.update(numbersIgnored=[{"value":90}]))),1,"numbersIgnored")
check("T6 fakta bertentangan dipakai",run(mut(lambda b:b["facts"][0].update(status="bertentangan"))),1,"BERTENTANGAN")
check("T7 belum-terverifikasi: draft=warn",run(mut(lambda b:b["facts"][0].update(status="belum-terverifikasi"))),0,"belum terverifikasi")
check("T7b belum-terverifikasi: --publish=error",run(mut(lambda b:b["facts"][0].update(status="belum-terverifikasi")),"--publish"),1)
check("T8 status siap-publikasi + belum terverifikasi",run(mut(lambda b:(b.update(status="siap-publikasi"),b["facts"][0].update(status="belum-terverifikasi")))),1)
check("T9 factIds tidak ada",run(mut(lambda b:b["scenes"][1].update(factIds=["zzz"]))),1,'"zzz"')
check("T10 accessed di masa depan",run(mut(lambda b:b["facts"][0]["sources"][0].update(accessed="2999-01-01"))),1,"masa depan")
check("T10b accessed lama = warn",run(mut(lambda b:b["facts"][0]["sources"][0].update(accessed="2026-01-01"))),0,"hari lalu")
check("T11 url http",run(mut(lambda b:b["facts"][0]["sources"][0].update(url="http://example.org/a"))),1,"https")
check("T12 durasi 40 dtk: draft=warn",run(mut(lambda b:b["scenes"][0].update(durationSeconds=10))),0,"di luar 55–65")
check("T12b durasi 40 dtk: publish=error",run(mut(lambda b:b["scenes"][0].update(durationSeconds=10)),"--publish"),1)
check("T13 ringkasan: caption 5 kata",run(mut(lambda b:(b.update(captionMode="ringkasan"),[s.update(caption="satu dua tiga empat lima") for s in b["scenes"]]))),1,"8–14 kata")
check("T13b ringkasan: caption 10 kata",run(mut(lambda b:(b.update(captionMode="ringkasan"),[s.update(caption="kopi hitam itu terasa pahit tapi hangat di pagi hari") for s in b["scenes"]]))),0)
check("T19 brief arsip dilewati walau berisi error",run(mut(lambda b:(b.update(status="arsip"),b["facts"][0].update(status="bertentangan")))),0,"dilewati")
check("T14 series salah",run(mut(lambda b:b.update(series="Gosip"))),1,"series")
check("T15 'tiga detik' tak tercakup",run(mut(lambda b:b["scenes"][1].update(voiceoverText="Melayang tiga detik."))),1,"= 3")
check("T15b 'satu fakta' tanpa unit diabaikan",run(BASE),0)
check("T15c angka di caption scene yang tidak merujuk faktanya",run(mut(lambda b:b["scenes"][1].update(caption="Tahun 1815 terjadi"))),1,"1815")
check("T16 JSON rusak tidak crash",run(None,raw="{ bukan json"),1,"JSON tidak bisa dibaca")
check("T17 ilustrasi tanpa sumber",run(mut(lambda b:(b["facts"].append({"id":"f2","claim":"adegan","kind":"ilustrasi","status":"terverifikasi","figures":[{"text":"3 detik","value":3}]}),b["scenes"][1].update(voiceoverText="Melayang tiga detik.",factIds=["f2"])))),0)

# ---- caption di layar vs brief (captionSource)
def lines_module(texts):
    p=os.path.join(TMP,"lines.ts"); open(p,"w").write("export const LINES = "+json.dumps([{"text":t} for t in texts])+";\n"); return p
OKTXT=["Gunung itu setinggi 1815 meter.","Satu fakta saja."]
check("C1 caption layar cocok brief",run(mut(lambda b:b.update(captionSource=lines_module(OKTXT)))),0)
check("C2 caption layar memuat angka lain",run(mut(lambda b:b.update(captionSource=lines_module(["Gunung itu setinggi 1900 meter.","Satu fakta saja."])))),1,"1900")
check("C3 jumlah caption != jumlah scene",run(mut(lambda b:b.update(captionSource=lines_module(OKTXT[:1])))),1,"jumlah caption")
check("C4 modul caption tidak ada",run(mut(lambda b:b.update(captionSource=os.path.join(TMP,"tidak-ada.ts")))),1,"tidak bisa dimuat")
d=os.path.join(TMP,"empty"); shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
r=subprocess.run(["node","--no-warnings","--experimental-strip-types","scripts/validate-facts.ts","--dir="+d],cwd=ROOT,capture_output=True,text=True)
check("T18 folder kosong",(r.returncode,r.stdout),0)
shutil.rmtree(TMP,ignore_errors=True)
print("\nGAGAL:",fails); sys.exit(1 if fails else 0)
