"""Servidor HTTP local para abrir la presentación de Reveal.js."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket

PRESENTATION_DIR = Path(__file__).resolve().parent
DEFAULT_PORT = 8080


class QuietHandler(SimpleHTTPRequestHandler):
    """Handler HTTP que omite logs por cada archivo estático."""

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
    port = find_free_port(DEFAULT_PORT)
    handler = partial(QuietHandler, directory=str(PRESENTATION_DIR))

    with ThreadingHTTPServer(("127.0.0.1", port), handler) as server:
        url = f"http://127.0.0.1:{port}/"
        print("=" * 60)
        print("  Presentación Study Spaces REST API (UNSAM)")
        print("=" * 60)
        print(f"  Abrí este enlace en tu navegador: {url}")
        print("  Atajos: [S] Notas del orador | [F] Pantalla completa | [O] Vista general")
        print("  Presioná Ctrl+C para detener el servidor.")
        print("=" * 60, flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")


if __name__ == "__main__":
    main()
