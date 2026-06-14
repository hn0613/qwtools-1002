#!/usr/bin/env python3
"""
Unit tests for the django_gui choose_file view.

Run with: ./manage.py test test.django_gui.test_choose_file
Or: python -m pytest test/django_gui/test_choose_file.py
"""

import django
import os
import shutil
import tempfile
import unittest
from unittest import mock

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_gui.settings')
django.setup()

from django.test import TestCase, Client, override_settings  # noqa: E402
from django.contrib.auth.models import User  # noqa: E402
from yaml.scanner import ScannerError  # noqa: E402


SAMPLE_CRUISE_CONFIG = {
    'cruise': {
        'id': 'test_cruise',
        'start': '2024-01-01',
        'end': '2024-02-01'
    },
    'loggers': {
        'test_logger': {
            'configs': ['off', 'test->net']
        }
    },
    'modes': {
        'off': {'test_logger': 'off'},
        'running': {'test_logger': 'test->net'}
    },
    'default_mode': 'off',
    'configs': {
        'off': {},
        'test->net': {'test_logger': 'config test->net'}
    }
}


class TestChooseFileView(TestCase):
    """Tests for the choose_file view."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create a persistent temp directory structure for all tests
        cls.base_dir = tempfile.mkdtemp()
        cls.file_dir = os.path.join(cls.base_dir, 'configs')
        os.makedirs(cls.file_dir)

        # Create test files
        cls.yaml_file = os.path.join(cls.file_dir, 'cruise.yaml')
        with open(cls.yaml_file, 'w') as f:
            f.write('cruise:\n  id: test\n')

        cls.yaml_file2 = os.path.join(cls.file_dir, 'backup.yml')
        with open(cls.yaml_file2, 'w') as f:
            f.write('cruise:\n  id: backup\n')

        # Create a subdirectory with files
        cls.sub_dir = os.path.join(cls.file_dir, 'subdir')
        os.makedirs(cls.sub_dir)
        cls.sub_yaml = os.path.join(cls.sub_dir, 'nested.yaml')
        with open(cls.sub_yaml, 'w') as f:
            f.write('cruise:\n  id: nested\n')

        # Create an empty subdirectory
        cls.empty_dir = os.path.join(cls.file_dir, 'empty')
        os.makedirs(cls.empty_dir)

        # Create a non-yaml file (should be filtered out)
        with open(os.path.join(cls.file_dir, 'readme.txt'), 'w') as f:
            f.write('not a yaml file')

        cls.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.base_dir, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.client = Client()
        self.client.login(username='testuser', password='testpass123')

    def _get_settings(self):
        return {
            'FILECHOOSER_DIRS': [self.file_dir],
            'ALLOWED_HOSTS': ['testserver', 'localhost'],
        }

    ########################################
    # Test 1: GET renders root listing
    ########################################
    def test_get_root_listing(self):
        """GET /choose_file/ returns 200 with FILECHOOSER_DIRS entries."""
        with self.settings(**self._get_settings()):
            # Reset the module-level import of FILECHOOSER_DIRS
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.get('/choose_file/')

        self.assertEqual(response.status_code, 200)
        listing = response.context['listing']
        self.assertTrue(len(listing) > 0)
        # Root listing should contain our file_dir as a directory entry
        dir_names = [item['display_name'] for item in listing]
        expected_name = os.path.basename(self.file_dir) + '/'
        self.assertIn(expected_name, dir_names)
        # Should not have a target_file
        self.assertIsNone(response.context['target_file'])

    ########################################
    # Test 2: Navigate into directory
    ########################################
    def test_navigate_into_directory(self):
        """POST select_file with a directory path shows its contents."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'select_file': self.file_dir,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        listing = response.context['listing']
        names = [item['display_name'] for item in listing]
        # Should contain our yaml files
        self.assertIn('cruise.yaml', names)
        self.assertIn('backup.yml', names)
        # Should contain subdirectory
        self.assertIn('subdir/', names)
        # Should NOT contain readme.txt
        self.assertNotIn('readme.txt', names)
        # Should have breadcrumbs
        breadcrumbs = response.context['breadcrumbs']
        self.assertTrue(len(breadcrumbs) > 0)

    ########################################
    # Test 3: Select file shows confirmation
    ########################################
    def test_select_file_shows_confirmation(self):
        """POST select_file pointing to a .yaml file shows confirmation."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'select_file': self.yaml_file,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['target_file'], self.yaml_file)
        self.assertIsNotNone(response.context['file_size_display'])
        self.assertContains(response, 'Load')
        self.assertContains(response, 'Cancel')

    ########################################
    # Test 4: Load success
    ########################################
    @mock.patch('django_gui.views.api')
    @mock.patch('django_gui.views.read_config')
    @mock.patch('django_gui.views.expand_cruise_definition')
    def test_load_success(self, mock_expand, mock_read, mock_api):
        """POST target_file loads config and returns window.close()."""
        mock_read.return_value = SAMPLE_CRUISE_CONFIG.copy()
        mock_expand.return_value = SAMPLE_CRUISE_CONFIG.copy()
        mock_api.get_default_mode.return_value = 'off'

        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'target_file': self.yaml_file,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertIn(b'window.close()', response.content)
        mock_read.assert_called_once_with(self.yaml_file)
        mock_expand.assert_called_once()
        mock_api.load_configuration.assert_called_once()

    ########################################
    # Test 5: Load YAML error
    ########################################
    @mock.patch('django_gui.views.api')
    @mock.patch('django_gui.views.read_config')
    def test_load_yaml_error(self, mock_read, mock_api):
        """YAML parse error shows error banner and returns to listing."""
        mock_read.side_effect = ScannerError(
            'mapping', None, 'unexpected', None)

        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'target_file': self.yaml_file,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Error loading')
        # target_file should be reset (back to listing mode)
        self.assertIsNone(response.context['target_file'])

    ########################################
    # Test 6: Load ValueError
    ########################################
    @mock.patch('django_gui.views.api')
    @mock.patch('django_gui.views.expand_cruise_definition')
    @mock.patch('django_gui.views.read_config')
    def test_load_value_error(self, mock_read, mock_expand, mock_api):
        """ValueError from load_configuration shows error."""
        mock_read.return_value = SAMPLE_CRUISE_CONFIG.copy()
        mock_expand.return_value = SAMPLE_CRUISE_CONFIG.copy()
        mock_api.load_configuration.side_effect = ValueError(
            'Missing loggers section')

        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'target_file': self.yaml_file,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Missing loggers section')
        self.assertIsNone(response.context['target_file'])

    ########################################
    # Test 7: Load FileNotFoundError
    ########################################
    @mock.patch('django_gui.views.api')
    @mock.patch('django_gui.views.read_config')
    def test_load_file_not_found(self, mock_read, mock_api):
        """FileNotFoundError shows error message."""
        mock_read.side_effect = FileNotFoundError('No such file')

        missing_file = os.path.join(self.file_dir, 'gone.yaml')
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'target_file': missing_file,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'File not found')
        self.assertIsNone(response.context['target_file'])

    ########################################
    # Test 8: Path traversal blocked
    ########################################
    def test_path_traversal_blocked(self):
        """target_file outside FILECHOOSER_DIRS is rejected."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'target_file': '/etc/passwd',
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'outside allowed directories')
        # Should NOT contain window.close()
        self.assertNotIn(b'window.close()', response.content)

    ########################################
    # Test 9: Empty directory
    ########################################
    def test_empty_directory(self):
        """Empty directory shows empty_dir=True."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'select_file': self.empty_dir,
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context['empty_dir'])
        self.assertContains(response, 'No YAML files')

    ########################################
    # Test 10: Back at root returns to multi-root listing
    ########################################
    def test_back_at_root(self):
        """At a FILECHOOSER_DIR root, back button path is empty string."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'select_file': self.file_dir,
                    'dir_name': '',
                })

        listing = response.context['listing']
        back_items = [item for item in listing if item.get('is_back')]
        self.assertEqual(len(back_items), 1)
        self.assertEqual(back_items[0]['abs_path'], '')

    ########################################
    # Test 11: POST with no selection falls back to root
    ########################################
    def test_no_selection_shows_root(self):
        """POST with no select_file and no target_file shows root listing."""
        with self.settings(**self._get_settings()):
            with mock.patch('django_gui.views.FILECHOOSER_DIRS',
                            [self.file_dir]):
                response = self.client.post('/choose_file/', {
                    'dir_name': '',
                })

        self.assertEqual(response.status_code, 200)
        # Should fall back to showing root listing (FILECHOOSER_DIRS)
        listing = response.context['listing']
        self.assertTrue(len(listing) > 0)
        dir_names = [item['display_name'] for item in listing]
        expected_name = os.path.basename(self.file_dir) + '/'
        self.assertIn(expected_name, dir_names)


if __name__ == '__main__':
    unittest.main()
