#!/usr/bin/env python3
"""
Regression tests for static resource loading consistency.

These tests verify that all Django templates use the {% static %} template tag
consistently for referencing static resources, avoiding hardcoded paths or
relative paths that break under different URL hierarchies.

Run with: python -m pytest test/django_gui/test_static_resources.py -v
"""

import os
import re
import unittest


# Base directory for the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'django_gui', 'templates', 'django_gui')
STATIC_JS_DIR = os.path.join(BASE_DIR, 'django_gui', 'static', 'django_gui')
DISPLAY_DIR = os.path.join(BASE_DIR, 'display')
SETTINGS_FILE = os.path.join(BASE_DIR, 'django_gui', 'settings.py.dist')


class TestStaticResourceConsistency(unittest.TestCase):
    """Verify that static resources are referenced consistently across templates."""

    def test_base_html_uses_static_tag(self):
        """base.html should use {% static %} for CSS and favicon."""
        with open(os.path.join(TEMPLATE_DIR, 'base.html'), 'r') as f:
            content = f.read()
        self.assertIn('{% load static %}', content)
        self.assertIn("{% static 'django_gui/style.css' %}", content)
        self.assertIn("{% static 'django_gui/favicon.ico' %}", content)

    def test_base_html_no_hardcoded_static_paths(self):
        """base.html should not contain hardcoded /static/ paths."""
        with open(os.path.join(TEMPLATE_DIR, 'base.html'), 'r') as f:
            content = f.read()
        # Check for hardcoded /static/ in href or src attributes
        self.assertNotIn('href="/static/', content)
        self.assertNotIn('src="/static/', content)

    def test_index_html_uses_static_tag(self):
        """index.html should use {% static %} for JavaScript files."""
        with open(os.path.join(TEMPLATE_DIR, 'index.html'), 'r') as f:
            content = f.read()
        self.assertIn('{% load static %}', content)
        self.assertIn("{% static 'django_gui/index.html.js' %}", content)
        self.assertIn("{% static 'django_gui/websocket.js' %}", content)
        self.assertIn("{% static 'django_gui/stderr_log_utils.js' %}", content)

    def test_edit_config_html_uses_static_tag(self):
        """edit_config.html should use {% static %} instead of relative paths."""
        with open(os.path.join(TEMPLATE_DIR, 'edit_config.html'), 'r') as f:
            content = f.read()
        self.assertIn('{% load static %}', content)
        self.assertIn("{% static 'django_gui/edit_config.html.js' %}", content)
        self.assertIn("{% static 'django_gui/json-viewer/json-viewer.css' %}", content)
        self.assertIn("{% static 'django_gui/json-viewer/json-viewer.js' %}", content)

    def test_change_mode_html_uses_static_tag(self):
        """change_mode.html should use {% static %} instead of relative paths."""
        with open(os.path.join(TEMPLATE_DIR, 'change_mode.html'), 'r') as f:
            content = f.read()
        self.assertIn('{% load static %}', content)
        self.assertIn("{% static 'django_gui/change_mode.html.js' %}", content)

    def test_widget_html_uses_static_tag(self):
        """widget.html should load static and use {% static %} tags."""
        with open(os.path.join(TEMPLATE_DIR, 'widget.html'), 'r') as f:
            content = f.read()
        self.assertIn('{% load static %}', content)
        self.assertIn("{% static 'django_gui/widget.html.js' %}", content)
        self.assertIn("{% static 'django_gui/websocket.js' %}", content)

    def test_settings_static_url_has_leading_slash(self):
        """settings.py.dist should define STATIC_URL with a leading slash."""
        with open(SETTINGS_FILE, 'r') as f:
            content = f.read()
        # Match STATIC_URL = '/static/' (with leading slash)
        match = re.search(r"STATIC_URL\s*=\s*['\"]([^'\"]+)['\"]", content)
        self.assertIsNotNone(match, "STATIC_URL not found in settings.py.dist")
        static_url = match.group(1)
        self.assertTrue(static_url.startswith('/'),
                        f"STATIC_URL should start with '/', got: {static_url!r}")

    def test_index_js_uses_absolute_popup_paths(self):
        """index.html.js should use absolute paths for window.open() popups."""
        with open(os.path.join(STATIC_JS_DIR, 'index.html.js'), 'r') as f:
            content = f.read()
        # Check that popup paths are absolute (start with /)
        self.assertIn("window.open('/change_mode/'", content)
        self.assertIn("window.open('/edit_config/'", content)
        self.assertIn("window.open('/choose_file/'", content)
        # Ensure no relative paths remain
        self.assertNotIn("window.open('../change_mode/'", content)
        self.assertNotIn("window.open('../edit_config/'", content)
        self.assertNotIn("window.open('../choose_file/'", content)

    def test_index_js_no_dead_message_window_function(self):
        """index.html.js should not contain the dead message_window() function."""
        with open(os.path.join(STATIC_JS_DIR, 'index.html.js'), 'r') as f:
            content = f.read()
        self.assertNotIn('function message_window()', content)
        self.assertNotIn('/server_messages/', content)

    def test_no_relative_static_paths_in_templates(self):
        """No Django template should use ../static/ relative paths."""
        template_files = [
            'base.html', 'index.html', 'edit_config.html',
            'change_mode.html', 'widget.html', 'login.html', 'choose_file.html'
        ]
        for template_name in template_files:
            template_path = os.path.join(TEMPLATE_DIR, template_name)
            if os.path.exists(template_path):
                with open(template_path, 'r') as f:
                    content = f.read()
                self.assertNotIn('../static/', content,
                                 f"{template_name} contains relative path '../static/'")

    def test_child_templates_no_hardcoded_static_paths(self):
        """Child templates should not have hardcoded /static/ paths (use {% static %} instead)."""
        child_templates = [
            'index.html', 'edit_config.html', 'change_mode.html',
            'widget.html', 'login.html', 'choose_file.html'
        ]
        for template_name in child_templates:
            template_path = os.path.join(TEMPLATE_DIR, template_name)
            if os.path.exists(template_path):
                with open(template_path, 'r') as f:
                    content = f.read()
                # Check for hardcoded /static/ in src or href attributes
                hardcoded_pattern = r'(?:src|href)="/static/'
                matches = re.findall(hardcoded_pattern, content)
                self.assertEqual(len(matches), 0,
                                 f"{template_name} contains {len(matches)} hardcoded /static/ path(s)")

    def test_map_demo_css_paths_correct(self):
        """map_demo.html should use /static/css/ for CSS paths."""
        map_demo_path = os.path.join(DISPLAY_DIR, 'html', 'map_demo.html')
        if os.path.exists(map_demo_path):
            with open(map_demo_path, 'r') as f:
                content = f.read()
            # Should have /static/css/ paths
            self.assertIn('/static/css/leaflet/leaflet.css', content)
            self.assertIn('/static/css/map_demo.css', content)
            # Should NOT have broken /css/ paths
            self.assertNotIn('href="/css/leaflet/', content)
            self.assertNotIn('href="/css/map_demo.css"', content)


if __name__ == '__main__':
    unittest.main()
