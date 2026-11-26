"""Servidor para ver la página en la computadora: python servidor_local.py  →  http://localhost:4180

Es como «python -m http.server», pero acepta pedidos por partes (Range). Sin eso el navegador no puede
saltar dentro del video del showroom (los colores no llevan a su tramo). GitHub Pages ya los acepta.
"""
import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class ConPartes(SimpleHTTPRequestHandler):
    def send_head(self):
        rango = self.headers.get("Range")
        ruta = self.translate_path(self.path)
        if not rango or not os.path.isfile(ruta):
            return super().send_head()
        m = re.fullmatch(r"bytes=(\d*)-(\d*)", rango.strip())
        tam = os.path.getsize(ruta)
        if not m or (m.group(1) == "" and m.group(2) == ""):
            return super().send_head()
        if m.group(1) == "":
            inicio, fin = max(0, tam - int(m.group(2))), tam - 1
        else:
            inicio = int(m.group(1))
            fin = min(int(m.group(2)) if m.group(2) else tam - 1, tam - 1)
        if inicio >= tam or inicio > fin:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{tam}")
            self.end_headers()
            return None
        f = open(ruta, "rb")
        f.seek(inicio)
        self._quedan = fin - inicio + 1
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(ruta))
        self.send_header("Content-Range", f"bytes {inicio}-{fin}/{tam}")
        self.send_header("Content-Length", str(self._quedan))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return f

    def copyfile(self, origen, destino):
        quedan = getattr(self, "_quedan", None)
        if quedan is None:
            return super().copyfile(origen, destino)
        while quedan > 0:
            trozo = origen.read(min(64 * 1024, quedan))
            if not trozo:
                break
            destino.write(trozo)
            quedan -= len(trozo)
        self._quedan = None

    def end_headers(self):
        if not self.headers.get("Range"):
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 4180
    carpeta = os.path.dirname(os.path.abspath(__file__))
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), partial(ConPartes, directory=carpeta))
    print(f"La Reina Mercería en http://localhost:{puerto}  (Ctrl+C para salir)")
    servidor.serve_forever()
