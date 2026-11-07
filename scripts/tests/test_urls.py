import json, copy, subprocess, os, shutil, sys, ssl, threading, time, tempfile
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),"..",".."))
TMP=tempfile.mkdtemp(prefix="sefakta_url_")
subprocess.run(["openssl","req","-x509","-newkey","rsa:2048","-nodes","-keyout",TMP+"/k.pem","-out",TMP+"/c.pem","-days","1","-subj","/CN=localhost"],check=True,capture_output=True)
OK1='<html><body><p>The participants fell 31&nbsp;m in a free fall and overestimated duration by 36%.<sup>12</sup> They could <b>not</b> read the digits [3].</p><script>var x="fake quote"</script></body></html>'
OK2='<html><body><p>Researchers reported that a &ldquo;richer&rdquo; memory &ndash; not faster perception &ndash; explains why a 31 m fall seemed longer.</p></body></html>'
class H(BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def handle_one_request(self):
        try: super().handle_one_request()
        except (ConnectionResetError, ssl.SSLError, BrokenPipeError): pass
    def do_GET(self):
        p=self.path
        if p=="/ok": self.send(200,OK1)
        elif p=="/ok2": self.send(200,OK2)
        elif p=="/404": self.send(404,"nope")
        elif p=="/500": self.send(500,"boom")
        elif p=="/403": self.send(403,"blocked")
        elif p=="/redir": self.send_response(302); self.send_header("Location","/ok"); self.end_headers()
        elif p=="/redir-other": self.send_response(302); self.send_header("Location",f"https://127.0.0.1:{self.server.server_address[1]}/ok"); self.end_headers()
        elif p=="/pdf": self.send(200,"%PDF-1.4 ...","application/pdf")
        elif p=="/slow": time.sleep(2.5); self.send(200,OK1)
        else: self.send(404,"?")
    def send(self,code,body,ct="text/html; charset=utf-8"):
        b=body.encode(); self.send_response(code); self.send_header("Content-Type",ct); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
srv=ThreadingHTTPServer(("127.0.0.1",0),H); port=srv.server_address[1]
ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain(TMP+"/c.pem",TMP+"/k.pem"); srv.socket=ctx.wrap_socket(srv.socket,server_side=True)
threading.Thread(target=srv.serve_forever,daemon=True).start()
U=lambda path:f"https://localhost:{port}{path}"
def src(origin,url,quote): return {"title":"T","url":url,"publisher":"P","origin":origin,"accessed":"2026-11-01","quote":quote}
Q1="participants fell 31 m in a free fall and overestimated duration by 36%."
Q1b="fell 31 m in a free fall and overestimated duration by 36%. They could not read the digits."
Q2="a “richer” memory - not faster perception - explains why a 31 m fall seemed longer."
def brief(a_path,qa=Q1,status="terverifikasi",a_url=None):
    return {"projectId":"t","title":"t","series":"Sains","status":"draft","captionMode":"subtitle","visualStyle":{"name":"x","reason":"y"},
     "scenes":[{"id":"a","durationSeconds":60,"voiceoverText":"Jatuh tiga puluh satu meter.","factIds":["f1"]}],
     "facts":[{"id":"f1","claim":"jatuh 31 m","kind":"fakta","status":status,"figures":[{"text":"31 m","value":31}],
       "sources":[src("Studi A",a_url or U(a_path),qa),src("Liputan B",U("/ok2"),Q2)]}],"numbersIgnored":[]}
def run(b,*flags):
    d=os.path.join(TMP,"case"); shutil.rmtree(d,ignore_errors=True); os.makedirs(d); open(d+"/t.json","w").write(json.dumps(b))
    r=subprocess.run(["node","--no-warnings","--experimental-strip-types","scripts/validate-facts.ts","--dir="+d,*flags],cwd=ROOT,capture_output=True,text=True,env={**os.environ,"NODE_TLS_REJECT_UNAUTHORIZED":"0"})
    return r.returncode,r.stdout
fails=0
def check(name,res,code,*needles,absent=()):
    global fails
    ok=res[0]==code and all(n in res[1] for n in needles) and not any(n in res[1] for n in absent)
    print(("PASS" if ok else "FAIL"),name,"" if ok else f"\n   exit {res[0]} (mau {code}) butuh {needles} tanpa {absent}\n{res[1]}"); fails+=(not ok)
O="--check-urls"
check("U0 offline (tanpa flag): tidak ada pemeriksaan URL",run(brief("/404")),0,absent=("URL:",))
check("U1 halaman ok, kutipan verbatim (nbsp, sup, kutip lengkung, strip)",run(brief("/ok"),O),0,"kutipan cocok 2","0 error")
check("U1b kutipan melewati penanda rujukan [3] dan <b>",run(brief("/ok",Q1b),O),0,"kutipan cocok 2","0 error")
check("U2 kutipan tidak ada di halaman (terverifikasi) = error",run(brief("/ok","participants fell 31 m in a parachute"),O),1,"TIDAK ditemukan","tidak cocok 1")
check("U2b teks di <script> tidak dihitung sebagai halaman",run(brief("/ok","fake quote 31"),O),1,"TIDAK ditemukan")
check("U3 404 = link mati (error)",run(brief("/404"),O),1,"link mati (HTTP 404)")
check("U4 500 = peringatan",run(brief("/500"),O),0,"HTTP 500")
check("U5 403 diblokir = peringatan, tidak gagal",run(brief("/403"),O),0,"HTTP 403","1 diblokir")
check("U6 redirect diikuti, host sama tanpa peringatan",run(brief("/redir"),O),0,"kutipan cocok 2",absent=("dialihkan",))
check("U7 PDF = peringatan tidak bisa diperiksa otomatis",run(brief("/pdf"),O),0,"bukan halaman teks")
check("U8 timeout = peringatan",run(brief("/slow"),O,"--url-timeout=500"),0,"timeout")
check("U9 port tertutup = tidak terjangkau (peringatan)",run(brief("/x",a_url="https://localhost:1/x"),O),0,"tidak bisa dijangkau")
check("U10 fakta belum-terverifikasi: kutipan tidak cocok = peringatan saja",run(brief("/ok","participants fell 31 m in a parachute","belum-terverifikasi"),O),0,"TIDAK ditemukan")
check("U12 redirect ke domain lain = peringatan, kutipan tetap diperiksa di halaman tujuan",run(brief("/redir-other"),O),0,"dialihkan ke domain lain: localhost → 127.0.0.1","kutipan cocok 2")
check("U11 http (non-https) tetap ditolak validasi struktur",run(brief("/ok",a_url=f"http://localhost:{port}/ok"),O),1,"https")
shutil.rmtree(TMP,ignore_errors=True)
print("\nGAGAL:",fails); sys.exit(1 if fails else 0)
