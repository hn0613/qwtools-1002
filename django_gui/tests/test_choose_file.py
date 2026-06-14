"""Regression tests for the choose_file view and its helpers.

Run with::

    python -m django test django_gui.tests.test_choose_file \
        --settings=django_gui.tests.test_settings -v2

Or via the convenience wrapper::

    python django_gui/tests/run_tests.py
"""
import os
import sys
import tempfile
import shutil

from django.test import TestCase, RequestFactory, override_settings

# ---------------------------------------------------------------------------
# Helpers are imported from views; FILECHOOSER_DIRS is overridden per test
# via @override_settings so that we can point at temp directories.
# ---------------------------------------------------------------------------
from django_gui.views import is_path_allowed, _build_breadcrumbs


def _make_tmpdir():
    """Create a temp dir and return its absolute path."""
    return tempfile.mkdtemp(prefix='fc_test_')


class _BaseChooserTest(TestCase):
    """Common setup: two temp dirs that stand in for FILECHOOSER_DIRS."""

    def setUp(self):
        self.tmp1 = _make_tmpdir()
        self.tmp2 = _make_tmpdir()
        self._dirs = [self.tmp1, self.tmp2]

    def tearDown(self):
        shutil.rmtree(self.tmp1, ignore_errors=True)
        shutil.rmtree(self.tmp2, ignore_errors=True)


# ===========================================================================
# is_path_allowed
# ===========================================================================
@override_settings(FILECHOOSER_DIRS=[])
class IsPathAllowedTest(_BaseChooserTest):

    def _check(self, path, expected):
        from django_gui import views
        from django.conf import settings
        settings.FILECHOOSER_DIRS = self._dirs
        result = views.is_path_allowed(path)
        self.assertEqual(result, expected,
                         f'is_path_allowed({path!r}) = {result}, want {expected}')

    def test_empty_string_allowed(self):
        """Empty string signals root navigation and is always allowed."""
        self._check('', True)

    def test_inside_allowed_dir(self):
        self._check(self.tmp1, True)

    def test_subdir_of_allowed(self):
        sub = os.path.join(self.tmp1, 'subdir')
        os.makedirs(sub, exist_ok=True)
        self._check(sub, True)

    def test_outside_path_rejected(self):
        self._check('/tmp', False)

    def test_traversal_rejected(self):
        evil = os.path.join(self.tmp1, '..', '..')
        self._check(evil, False)

    def test_realpath_normalization(self):
        """A path with redundant components still resolves correctly."""
        redundant = os.path.join(self.tmp1, '.', 'subdir', '..')
        self._check(redundant, True)

    def test_prefix_dir_not_confused(self):
        """A dir whose name is a prefix of an allowed dir is rejected.

        e.g. if /tmp/fc_test_abc is allowed, /tmp/fc_test_abcXYZ is not.
        """
        # Create a sibling dir whose name starts with self.tmp1
        sibling = self.tmp1 + '_extra'
        os.makedirs(sibling, exist_ok=True)
        try:
            self._check(sibling, False)
        finally:
            os.rmdir(sibling)


# ===========================================================================
# _build_breadcrumbs
# ===========================================================================
class BuildBreadcrumbsTest(_BaseChooserTest):

    def setUp(self):
        super().setUp()
        from django.conf import settings
        settings.FILECHOOSER_DIRS = self._dirs

    def test_empty_path(self):
        self.assertEqual(_build_breadcrumbs(''), [])

    def test_root_dir_single_crumb(self):
        crumbs = _build_breadcrumbs(self.tmp1)
        self.assertEqual(len(crumbs), 1)
        self.assertTrue(crumbs[0]['active'])
        self.assertEqual(crumbs[0]['path'], '')

    def test_nested_path(self):
        sub = os.path.join(self.tmp1, 'a', 'b')
        os.makedirs(sub, exist_ok=True)
        crumbs = _build_breadcrumbs(sub)
        # base + a + b = 3 crumbs
        self.assertEqual(len(crumbs), 3)
        # first crumb is the base, not active
        self.assertFalse(crumbs[0]['active'])
        self.assertEqual(crumbs[0]['path'], '')
        # last crumb is active
        self.assertTrue(crumbs[-1]['active'])
        self.assertEqual(crumbs[-1]['name'], 'b')

    def test_outside_path_returns_empty(self):
        crumbs = _build_breadcrumbs('/tmp')
        self.assertEqual(crumbs, [])


# ===========================================================================
# get_dir_contents (internal to choose_file, tested via view response)
# ===========================================================================
class GetDirContentsViaViewTest(_BaseChooserTest):
    """Test directory listing behaviour by calling the view directly."""

    def setUp(self):
        super().setUp()
        from django.conf import settings
        settings.FILECHOOSER_DIRS = self._dirs
        self.factory = RequestFactory()

    def _get_listing(self, dir_path):
        """POST a select_file for *dir_path* and return the context listing."""
        from django_gui import views
        request = self.factory.post('/choose_file/', {'select_file': dir_path})
        response = views.choose_file(request)
        if hasattr(response, 'context_data'):
            return response.context_data.get('listing', {})
        # Django render() response stores context differently
        return response.context.get('listing', {}) if response.context else {}

    def test_dirs_and_yaml_listed(self):
        sub = os.path.join(self.tmp1, 'mydir')
        os.makedirs(sub, exist_ok=True)
        with open(os.path.join(self.tmp1, 'test.yaml'), 'w') as f:
            f.write('cruise: {}')
        with open(os.path.join(self.tmp1, 'data.yml'), 'w') as f:
            f.write('cruise: {}')

        listing = self._get_listing(self.tmp1)
        names = [v['name'] for v in listing.values() if v.get('type') != 'back']
        self.assertIn('mydir/', names)
        self.assertIn('test.yaml', names)
        self.assertIn('data.yml', names)

    def test_non_yaml_skipped(self):
        with open(os.path.join(self.tmp1, 'notes.txt'), 'w') as f:
            f.write('hello')
        with open(os.path.join(self.tmp1, 'script.py'), 'w') as f:
            f.write('print("x")')

        listing = self._get_listing(self.tmp1)
        names = [v['name'] for v in listing.values() if v.get('type') != 'back']
        self.assertNotIn('notes.txt', names)
        self.assertNotIn('script.py', names)

    def test_empty_directory_flag(self):
        empty_sub = os.path.join(self.tmp1, 'empty_sub')
        os.makedirs(empty_sub, exist_ok=True)

        from django_gui import views
        request = self.factory.post('/choose_file/', {'select_file': empty_sub})
        response = views.choose_file(request)
        ctx = response.context if hasattr(response, 'context') else {}
        self.assertTrue(ctx.get('empty_directory', False))

    def test_nonexistent_directory_error(self):
        fake = os.path.join(self.tmp1, 'does_not_exist')
        listing = self._get_listing(fake)
        self.assertIn('__error__', listing)
        self.assertEqual(listing['__error__']['type'], 'error')

    def test_path_outside_dirs_rejected(self):
        """POSTing a path outside FILECHOOSER_DIRS should fall back to root."""
        from django_gui import views
        request = self.factory.post('/choose_file/', {'select_file': '/tmp'})
        response = views.choose_file(request)
        ctx = response.context if hasattr(response, 'context') else {}
        errors = ctx.get('load_errors', [])
        self.assertTrue(any('Access denied' in e for e in errors))


# ===========================================================================
# Root listing (GET /choose_file/)
# ===========================================================================
class RootListingTest(_BaseChooserTest):

    def setUp(self):
        super().setUp()
        from django.conf import settings
        settings.FILECHOOSER_DIRS = self._dirs
        self.factory = RequestFactory()

    def test_root_shows_base_dirs(self):
        from django_gui import views
        request = self.factory.get('/choose_file/')
        response = views.choose_file(request)
        ctx = response.context if hasattr(response, 'context') else {}
        listing = ctx.get('listing', {})
        # Should have one entry per FILECHOOSER_DIRS base
        dir_items = [v for v in listing.values()
                     if isinstance(v, dict) and v.get('type') == 'dir']
        self.assertEqual(len(dir_items), len(self._dirs))

    def test_root_has_no_breadcrumbs(self):
        from django_gui import views
        request = self.factory.get('/choose_file/')
        response = views.choose_file(request)
        ctx = response.context if hasattr(response, 'context') else {}
        self.assertEqual(ctx.get('breadcrumbs', None), [])


# ===========================================================================
# File selection shows confirmation
# ===========================================================================
class FileSelectionTest(_BaseChooserTest):

    def setUp(self):
        super().setUp()
        from django.conf import settings
        settings.FILECHOOSER_DIRS = self._dirs
        self.factory = RequestFactory()
        self.yaml_path = os.path.join(self.tmp1, 'cruise.yaml')
        with open(self.yaml_path, 'w') as f:
            f.write('cruise: {}')

    def test_select_file_shows_target(self):
        from django_gui import views
        request = self.factory.post('/choose_file/', {'select_file': self.yaml_path})
        response = views.choose_file(request)
        ctx = response.context if hasattr(response, 'context') else {}
        self.assertEqual(ctx.get('target_file'), self.yaml_path)
        # target_display should be a relative path
        self.assertIn('cruise.yaml', ctx.get('target_display', ''))

    def test_target_outside_dirs_rejected(self):
        """POSTing target_file outside allowed dirs is rejected."""
        outside = '/tmp/evil.yaml'
        with open(outside, 'w') as f:
            f.write('cruise: {}')
        try:
            from django_gui import views
            request = self.factory.post('/choose_file/', {'target_file': outside})
            response = views.choose_file(request)
            ctx = response.context if hasattr(response, 'context') else {}
            errors = ctx.get('load_errors', [])
            self.assertTrue(any('Access denied' in e for e in errors))
        finally:
            os.remove(outside)
