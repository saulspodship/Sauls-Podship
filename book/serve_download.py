#!/usr/bin/env python3
"""Serve the book folder and force PDF downloads with Content-Disposition."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import urllib.parse

ROOT = Path(__file__).resolve().parent

# edition key -> (filename, download name)
EDITIONS = {
    "en": ("Sauls-Podship-Compendium.pdf", "Sauls-Podship-Compendium-English.pdf"),
    "ur": ("Sauls-Podship-Compendium-Urdu.pdf", "Sauls-Podship-Compendium-Urdu.pdf"),
    "hi": ("Sauls-Podship-Compendium-Hindi.pdf", "Sauls-Podship-Compendium-Hindi.pdf"),
}
BY_FILE = {v[0]: v for v in EDITIONS.values()}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def _target(self):
        """Return (path_on_disk, download_name) for a PDF request, else None."""
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/download":
            qs = urllib.parse.parse_qs(parsed.query)
            lang = (qs.get("lang", ["en"])[0] or "en").lower()
            entry = EDITIONS.get(lang)
            return (ROOT / entry[0], entry[1]) if entry else None
        name = path.lstrip("/")
        entry = BY_FILE.get(name)
        if entry:
            return ROOT / entry[0], entry[1]
        return None

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path in ("/", "/index.html"):
            return super().do_GET()
        target = self._target()
        if target:
            return self._send_pdf(*target)
        return super().do_GET()

    def do_HEAD(self):
        path = urllib.parse.urlparse(self.path).path
        if path in ("/", "/index.html"):
            return super().do_HEAD()
        target = self._target()
        if not target:
            return super().do_HEAD()
        fp, dname = target
        if not fp.exists():
            self.send_error(404, "PDF not found")
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{dname}"')
        self.send_header("Content-Length", str(fp.stat().st_size))
        self.end_headers()

    def _send_pdf(self, fp: Path, dname: str):
        if not fp.exists():
            self.send_error(404, "PDF not found")
            return
        size = fp.stat().st_size
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", f'attachment; filename="{dname}"')
        self.send_header("Content-Length", str(size))
        self.end_headers()
        chunk = 1024 * 256
        try:
            with fp.open("rb") as fh:
                while True:
                    block = fh.read(chunk)
                    if not block:
                        break
                    self.wfile.write(block)
        except (BrokenPipeError, ConnectionResetError):
            pass  # client cancelled the download

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}", flush=True)


def main():
    port = 8080
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Serving {ROOT} on 0.0.0.0:{port}", flush=True)
    for k, (fn, _) in EDITIONS.items():
        exists = "ok" if (ROOT / fn).exists() else "missing"
        print(f"  [{k}] /download?lang={k} → {fn} ({exists})", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
