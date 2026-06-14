#!/usr/bin/env python3
"""Convenience wrapper to run choose_file regression tests.

    python django_gui/tests/run_tests.py
"""
import os
import sys

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_gui.tests.test_settings')

import django  # noqa: E402
django.setup()

from django.test.utils import get_runner  # noqa: E402
from django.conf import settings  # noqa: E402

if __name__ == '__main__':
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(['django_gui.tests.test_choose_file'])
    sys.exit(bool(failures))
