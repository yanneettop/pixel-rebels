import http.server
import socketserver
import os

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Serve actual files (assets, favicon, etc.)
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            return super().do_GET()
        # For all other routes, serve index.html (SPA client-side routing)
        self.path = '/index.html'
        return super().do_GET()

    def log_message(self, format, *args):
        # Only log actual requests, suppress noise
        super().log_message(format, *args)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadedHTTPServer(('', 8080), SPAHandler)
    print('Serving on http://localhost:8080')
    server.serve_forever()
