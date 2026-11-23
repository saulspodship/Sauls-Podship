#!/usr/bin/env python3
"""Serve the book folder and force PDF downloads with Content-Disposition."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import urllib.parse

ROOT = Path(__file__).resolve().parent
PDF_NAME = "Sauls-Podship-Compendium.pdf"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # disable caching so re-downloads always get the current file
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path in ("/", "/index.html"):
            return super().do_GET()
        if path == f"/{PDF_NAME}" or path == "/download":
            return self._send_pdf()
        return super().do_GET()

    def do_HEAD(self):
        path = urllib.parse.urlparse(self.path).path
        if path == f"/{PDF_NAME}" or path == "/download":
            fp = ROOT / PDF_NAME
            if not fp.exists():
                self.send_error(404, "PDF not found")
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition",
                             f'attachment; filename="{PDF_NAME}"')
            self.send_header("Content-Length", str(fp.stat().st_size))
            self.end_headers()
            return
        return super().do_HEAD()

    def _send_pdf(self):
        fp = ROOT / PDF_NAME
        if not fp.exists():
            self.send_error(404, "PDF not found")
            return
        data = fp.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition",
                         f'attachment; filename="{PDF_NAME}"')
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        chunk = 1024 * 256
        try:
            for i in range(0, len(data), chunk):
                self.wfile.write(data[i:i + chunk])
        except (BrokenPipeError, ConnectionResetError):
            pass  # client cancelled the download

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} - {fmt % args}", flush=True)


def main():
    port = 8080
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Serving {ROOT} on 0.0.0.0:{port}", flush=True)
    print(f"PDF: /{PDF_NAME} (attachment)", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
