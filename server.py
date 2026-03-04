import http.server
import os

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve actual files (assets, favicon, etc.)
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            return super().do_GET()
        # For all other routes, serve index.html (SPA client-side routing)
        self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('', 8080), SPAHandler)
    print('Serving on http://localhost:8080')
    server.serve_forever()
