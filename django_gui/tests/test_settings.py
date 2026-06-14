"""Minimal Django settings for running choose_file tests.

Usage::

    python -m django test django_gui.tests.test_choose_file \
        --settings=django_gui.tests.test_settings -v2
"""
import os
import tempfile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

SECRET_KEY = 'test-secret-key-not-for-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django_gui',
]

MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'django_gui.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    },
}

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'django_gui/static'),
]

# Use temp dirs for FILECHOOSER_DIRS during tests; individual tests
# override via @override_settings.
_tmp1 = tempfile.mkdtemp(prefix='fc_settings_')
_tmp2 = tempfile.mkdtemp(prefix='fc_settings_')
FILECHOOSER_DIRS = [_tmp1, _tmp2]

WEBSOCKET_DATA_SERVER = 'ws://localhost:80/cds-ws'

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
