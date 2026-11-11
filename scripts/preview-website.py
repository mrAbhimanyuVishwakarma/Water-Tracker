"""Serve the website locally and open the browser after the server is ready."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import socket
import sys
from urllib.error import URLError
from urllib.request import urlopen
import webbrowser


class PreviewServer(ThreadingHTTPServer):
    def server_bind(self):
        # Windows otherwise allows multiple HTTP servers to share the same port.
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.allow_reuse_address = False
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=3000)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("Choose a port between 1 and 65535.")

    website = Path(__file__).resolve().parent.parent / "website"
    homepage = website / "index.html"
    if not homepage.is_file():
        print("Cannot find website/index.html in the project folder.", file=sys.stderr)
        return 1

    url = f"http://localhost:{args.port}/"
    handler = partial(SimpleHTTPRequestHandler, directory=str(website))
    try:
        server = PreviewServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        # Double-clicking again should reopen our preview, not start another server.
        try:
            with urlopen(f"http://127.0.0.1:{args.port}/", timeout=2) as response:
                matching_preview = response.read(1024 * 1024) == homepage.read_bytes()
        except (OSError, URLError):
            matching_preview = False
        if matching_preview:
            print(f"Brownie preview is already running at {url}", flush=True)
            if not args.no_browser:
                webbrowser.open(url, new=2)
            return 0
        print(f"Cannot start the preview: {error}", file=sys.stderr)
        print("Try a different port: testlocal.bat --port 3001", file=sys.stderr)
        return 1

    with server:
        print(f"Brownie website: {url}", flush=True)
        print("Keep this window open. Save your edits and refresh the browser.", flush=True)
        print("Press Ctrl+C to stop the preview.", flush=True)
        if not args.no_browser:
            webbrowser.open(url, new=2)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nPreview stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
