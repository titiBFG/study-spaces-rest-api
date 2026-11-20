"""Servidor HTTP local para abrir la presentación de Reveal.js y la demo embebida."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import posixpath
import socket
from urllib.parse import unquote

PRESENTATION_DIR = Path(__file__).resolve().parent
REPO_ROOT = PRESENTATION_DIR.parent
FRONTEND_DIR = REPO_ROOT / "frontend"
DEFAULT_PORT = 8080


class PresentationHandler(SimpleHTTPRequestHandler):
    """Sirve presentation/ en / y frontend/ en /frontend/ bajo el mismo origen."""

    def translate_path(self, path: str) -> str:
        clean = path.split("?", 1)[0].split("#", 1)[0]
        clean = unquote(clean)
        normalized = posixpath.normpath(clean)
        parts = [p for p in normalized.split("/") if p and p not in (".", "..")]

        if parts and parts[0] == "frontend":
            base_dir = FRONTEND_DIR.resolve()
            rel_parts = parts[1:]
        else:
            base_dir = PRESENTATION_DIR.resolve()
            rel_parts = parts

        target = base_dir.joinpath(*rel_parts).resolve()
        try:
            target.relative_to(base_dir)
        except ValueError:
            return str(base_dir / "__forbidden__")

        return str(target)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return


def find_free_port(start_port: int = DEFAULT_PORT) -> int:
    """Busca un puerto libre en 127.0.0.1 a partir de ``start_port``."""
    port = start_port
    while True:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                port += 1


def main() -> None:
    """Inicia el servidor local e imprime el enlace para abrir la presentación."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=None, help="Puerto TCP local")
    args = parser.parse_args()

    port = args.port if args.port is not None else find_free_port(DEFAULT_PORT)

    with ThreadingHTTPServer(("127.0.0.1", port), PresentationHandler) as server:
        url = f"http://127.0.0.1:{port}/"
        print("=" * 64)
        print("  Presentación Study Spaces REST API (UNSAM · Reveal.js 6.0.2)")
        print("=" * 64)
        print(f"  Presentación : {url}")
        print(f"  Demo Frontend: {url}frontend/index.html")
        print("  Atajos       : [←/→/Espacio] Navegar | [O/I] Índice | [F] Fullscreen")
        print("  Presioná Ctrl+C para detener el servidor.")
        print("=" * 64, flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")


if __name__ == "__main__":
    main()
