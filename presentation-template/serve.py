"""Serve the portable template locally using only Python's standard library."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8010)
    args = parser.parse_args()
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        print(f'Presentacion: http://127.0.0.1:{server.server_port}/', flush=True)
        print('Ctrl+C para detener.', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
