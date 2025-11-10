from pathlib import Path
import importlib.resources as resources
import json
from http.server import SimpleHTTPRequestHandler
from spotifysaver.ui.i18n import i18n

class UIHandler(SimpleHTTPRequestHandler):
    """Custom HTTP handler for serving the UI files."""

    def __init__(self, *args, **kwargs):
        # Set the directory to serve static files from
        frontend_dir = resources.files("spotifysaver.ui") / "frontend"
        super().__init__(*args, directory=str(frontend_dir), **kwargs)

    def do_GET(self):
        """Handle GET requests with translation support."""
        if self.path == '/translations':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            translations = i18n.get_all_translations()
            translations['current_language'] = i18n.get_current_language()
            self.wfile.write(json.dumps(translations).encode('utf-8'))
            return

        # Serve index.html with language substitution
        if self.path == '/' or self.path == '/index.html':
            # Read the template
            frontend_dir = resources.files("spotifysaver.ui") / "frontend"
            template_path = frontend_dir / "index.html"
            with open(template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()

            # Substitute translations
            translations = i18n.get_all_translations()
            translated_content = template_content
            for key, value in translations.items():
                translated_content = translated_content.replace(f'{{{{{key}}}}}', value)

            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(translated_content.encode('utf-8'))
            return

        # Serve other static files normally
        super().do_GET()

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()