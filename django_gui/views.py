from django.contrib import auth
from .django_server_api import DjangoServerAPI
from django_gui.settings import FILECHOOSER_DIRS
from django_gui.settings import WEBSOCKET_DATA_SERVER
import json
import logging
import os

from json import JSONDecodeError
from os import listdir
from os.path import dirname, isfile, isdir, abspath, relpath, getsize
from yaml.scanner import ScannerError

from django.shortcuts import render, redirect
from django.http import HttpResponse


# Read in JSON with comments
from logger.utils.read_config import read_config, expand_cruise_definition  # noqa: E402


############################
# We're going to interact with the Django DB via its API class
api = None


def login(request):
    template_vars = {}
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(request, username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('/')
        else:
            if not username:
                template_vars['errors'] = 'Please enter username'
            elif not password:
                template_vars['errors'] = 'Please enter password'
            elif user is None:
                template_vars['errors'] = 'Username and password do not match'

    return render(request, 'django_gui/login.html', template_vars)


def log_request(request, cmd):
    global api
    if api:
        user = request.user
        host = request.get_host()
        elements = ', '.join(['%s:%s' % (k, v) for k, v in request.POST.items()
                              if k not in ['csrfmiddlewaretoken', 'cruise_id']])
        api.message_log(source='Django', user='(%s@%s)' % (user, host),
                        log_level=api.INFO, message=elements)


################################################################################
def index(request):
    """Home page - render logger states and cruise information.
    """
    global api
    if api is None:
        api = DjangoServerAPI()

    ############################
    # If we've gotten a POST request
    # cruise_id = ''
    errors = []
    if request.method == 'POST':
        logging.debug('POST: %s', request.POST)

        # First things first: log the request
        log_request(request, 'index')

        # Are they deleting a cruise?(!)
        if 'delete_cruise' in request.POST:
            logging.info('deleting cruise')
            api.delete_configuration()

        # Did we get a mode selection?
        elif 'select_mode' in request.POST:
            new_mode_name = request.POST['select_mode']
            logging.info('switching to mode "%s"', new_mode_name)
            try:
                api.set_active_mode(new_mode_name)
            except ValueError as e:
                logging.warning('Error trying to set mode to "%s": %s',
                                new_mode_name, str(e))

        elif 'reload_button' in request.POST:
            logging.info('reloading current configuration file')
            try:
                cruise = api.get_configuration()
                filename = cruise['config_filename']

                # Load the file to memory and parse to a dict. Add the name
                # of the file we've just loaded to the dict.
                config = read_config(filename)
                config = expand_cruise_definition(config)

                if 'cruise' in config:
                    config['cruise']['config_filename'] = filename

                # Since we're reloading, we'd like to keep any unchanged
                # loggers running and not revert to the cruise's default
                # mode. Signal this by slipping some side information into
                # the config.
                config['preserve_mode'] = True

                api.load_configuration(config)
            except ValueError as e:
                logging.warning('Error reloading current configuration: %s', str(e))

        # If they canceled the upload
        elif 'cancel' in request.POST:
            logging.warning('User canceled upload')

        # Else unknown post
        else:
            logging.warning('Unknown POST request: %s', request.POST)

    # Assemble information to draw page
    template_vars = {
        'websocket_server': WEBSOCKET_DATA_SERVER,
        'errors': {'django': errors},
    }
    try:
        configuration = api.get_configuration()
        template_vars['cruise_id'] = configuration.get('id', 'Cruise')
        template_vars['filename'] = configuration.get('config_filename', '-none-')
        template_vars['loggers'] = api.get_loggers()
        template_vars['modes'] = api.get_modes()
        template_vars['active_mode'] = api.get_active_mode()
        template_vars['errors'] = errors
    except (ValueError, AttributeError):
        logging.info('No configuration loaded')

    return render(request, 'django_gui/index.html', template_vars)


################################################################################
def change_mode(request):
    """Change logger manager mode and view logger manager stderr.
    """
    global api
    if api is None:
        api = DjangoServerAPI()

    ############################
    # If we've gotten a POST request
    # cruise_id = ''
    if request.method == 'POST':
        logging.debug('POST: %s', request.POST)

        # First things first: log the request
        log_request(request, 'index')

        if 'close' in request.POST:
            return HttpResponse('<script>window.close()</script>')
        # Did we get a mode selection?
        elif 'select_mode' in request.POST:
            new_mode_name = request.POST['select_mode']
            logging.info('switching to mode "%s"', new_mode_name)
            try:
                api.set_active_mode(new_mode_name)
            except ValueError as e:
                logging.warning('Error trying to set mode to "%s": %s',
                                new_mode_name, str(e))
        # Else unknown post
        else:
            logging.warning('Unknown POST request: %s', request.POST)

    # Assemble information to draw page
    template_vars = {
        'websocket_server': WEBSOCKET_DATA_SERVER,
    }
    try:
        template_vars['modes'] = api.get_modes()
        template_vars['active_mode'] = api.get_active_mode()
    except (ValueError, AttributeError) as e:
        logging.info('Unknown error: %s', str(e))

    return render(request, 'django_gui/change_mode.html', template_vars)


################################################################################
def edit_config(request, logger_id):
    global api
    if api is None:
        api = DjangoServerAPI()

    ############################
    # If we've gotten a POST request, they've selected a new config
    if request.method == 'POST':

        # If they've hit the "Update" button
        if 'close' in request.POST:
            return HttpResponse('<script>window.close()</script>')
        elif 'update' in request.POST:
            # First things first: log the request
            log_request(request, '%s edit_config' % logger_id)

            # Now figure out what they selected
            new_config = request.POST['select_config']
            logging.warning('selected config: %s', new_config)
            api.set_active_logger_config(logger_id, new_config)
        else:
            logging.warning('Unrecognized post request?: ' + str(request.POST))

    # If not a POST, render the selector page:
    # What's our current mode? What's the default config for this logger
    # in this mode?
    active_mode = api.get_active_mode()
    config_options = api.get_logger_config_names(logger_id)
    default_config = api.get_logger_config_name(logger_id, active_mode)
    current_config = api.get_logger_config_name(logger_id)

    # dict of config_name: config_json
    config_map = {config_name: api.get_logger_config(config_name)
                  for config_name in config_options}

    return render(request, 'django_gui/edit_config.html',
                  {
                      'logger_id': logger_id,
                      'current_config': current_config,
                      'config_map': json.dumps(config_map),
                      'default_config': default_config,
                      'config_options': config_options,
                      'websocket_server': WEBSOCKET_DATA_SERVER
                  })


################################################################################
def _format_size(size_bytes):
    """Format a file size in bytes to a human-readable string."""
    if size_bytes < 1024:
        return '%d B' % size_bytes
    elif size_bytes < 1024 * 1024:
        return '%.1f KB' % (size_bytes / 1024)
    else:
        return '%.1f MB' % (size_bytes / (1024 * 1024))


def _is_within_allowed_dirs(path):
    """Check whether a path falls under one of the FILECHOOSER_DIRS."""
    real_path = os.path.realpath(path)
    for d in FILECHOOSER_DIRS:
        real_base = os.path.realpath(d)
        if real_path == real_base or real_path.startswith(real_base + '/'):
            return True
    return False


def choose_file(request, selection=None):
    """Render a chooser to pick and load a configuration file from the
    server side.

    Files can be navigated/selected starting at a base defined by the list in
    django_gui.settings.FILECHOOSER_DIRS.
    """
    global api
    if api is None:
        api = DjangoServerAPI()

    ##################
    # Internal function to create listing from dirname
    dir_error = None

    def get_dir_contents(dir_name):
        nonlocal dir_error
        back_path = '' if abspath(dir_name) in FILECHOOSER_DIRS \
            else abspath(dir_name + '/..')
        back_item = {
            'display_name': '↩ ..',
            'abs_path': back_path,
            'is_dir': True,
            'is_back': True,
            'size_display': None,
            'child_count': None,
        }

        dirs_list = []
        files_list = []
        try:
            for filename in sorted(listdir(dir_name)):
                path = dir_name + '/' + filename
                if isdir(path):
                    # Count yaml files + subdirs in this child directory
                    try:
                        child_count = sum(
                            1 for f in listdir(path)
                            if isdir(path + '/' + f)
                            or f.endswith(('.yaml', '.yml'))
                        )
                    except OSError:
                        child_count = None
                    dirs_list.append({
                        'display_name': filename + '/',
                        'abs_path': abspath(path),
                        'is_dir': True,
                        'is_back': False,
                        'size_display': None,
                        'child_count': child_count,
                    })
                elif filename.endswith(('.yaml', '.yml')):
                    try:
                        size_display = _format_size(getsize(path))
                    except OSError:
                        size_display = None
                    files_list.append({
                        'display_name': filename,
                        'abs_path': abspath(path),
                        'is_dir': False,
                        'is_back': False,
                        'size_display': size_display,
                        'child_count': None,
                    })
        except PermissionError:
            dir_error = 'Permission denied: cannot read this directory'
        except OSError as e:
            dir_error = 'Error reading directory: %s' % str(e)

        return [back_item] + dirs_list + files_list

    ##################
    # Build breadcrumbs from dir_name
    def build_breadcrumbs(dir_name, current_abs_path):
        breadcrumbs = []
        if not dir_name:
            return breadcrumbs
        parts = dir_name.strip('./').split('/')
        # Find which FILECHOOSER_DIR base we're under
        base_dir = None
        for base in FILECHOOSER_DIRS:
            parent_dir = dirname(base)
            if current_abs_path and current_abs_path.startswith(parent_dir):
                base_dir = parent_dir
                break
        if base_dir is None:
            return breadcrumbs
        # Build cumulative paths
        for i, part in enumerate(parts):
            cumulative = base_dir + '/' + '/'.join(parts[:i + 1])
            breadcrumbs.append({
                'label': part,
                'path': abspath(cumulative),
            })
        return breadcrumbs

    ##################
    # Start of choose_file() code
    target_file = None  # file we're going to load
    load_errors = []    # where we store any errors
    file_size_display = None

    # If post, figure out what user selected
    if request.method == 'POST':
        dir_name = request.POST.get('dir_name')
        selection = [request.POST.get('select_file', '')]

        # Was this a request to load the target file?
        target_file = request.POST.get('target_file')
        if target_file:
            # Validate path is within allowed directories
            if not _is_within_allowed_dirs(target_file):
                load_errors.append('File is outside allowed directories')
                target_file = None
            else:
                try:
                    # Load the file to memory and parse to a dict. Add the
                    # name of the file we've just loaded to the dict.
                    config = read_config(target_file)
                    config = expand_cruise_definition(config)

                    if 'cruise' in config:
                        config['cruise']['config_filename'] = target_file

                    # Load the config and set to the default mode
                    api.load_configuration(config)
                    default_mode = api.get_default_mode()
                    if default_mode:
                        api.set_active_mode(default_mode)
                except FileNotFoundError:
                    load_errors.append('File not found: "%s"' % target_file)
                except (JSONDecodeError, ScannerError) as e:
                    load_errors.append(
                        'Error loading "%s": %s' % (target_file, str(e)))
                except ValueError as e:
                    load_errors.append(str(e))

            # If no errors, go home; otherwise reset back to previous page
            if not load_errors:
                return HttpResponse('<script>window.close()</script>')
            else:
                logging.warning('Errors loading cruise definition: %s',
                                load_errors)
                target_file = None

        # Okay, it wasn't a request to load a target file. Do we have a
        # selection? If no target and no selection, it means they canceled
        # the choice.
        elif selection is None or selection[0] is None:
            return HttpResponse('<script>window.close()</script>')

        # Validate navigation target is within allowed directories
        if selection and selection[0] and selection[0] != '' \
                and not _is_within_allowed_dirs(selection[0]):
            load_errors.append('Path is outside allowed directories')
            selection = FILECHOOSER_DIRS
            dir_name = ''

    # If we don't have a selection, use the complete listing from our settings.
    if not selection or selection == ['']:
        logging.debug('No selection, so setting up with: %s', FILECHOOSER_DIRS)
        dir_name = ''
        selection = FILECHOOSER_DIRS

    # Here, we should have a selection of *some* sort. Figure out how to
    # display it: if a single element and a directory, expand the
    # directory. If single element and a file, it's our target file. If
    # multiple elements, just display list of elements.
    current_abs_path = None
    if len(selection) == 1:
        # If it's a file, designate it as the target_file; we won't bother
        # with a listing.
        if isfile(selection[0]):
            target_file = selection[0]
            listing = []
            try:
                file_size_display = _format_size(getsize(target_file))
            except OSError:
                file_size_display = None

        # If it's a directory, fetch/expand its contents into the listing
        else:
            for base in FILECHOOSER_DIRS:
                parent_dir = dirname(base)
                if selection[0].startswith(parent_dir):
                    dir_name = './' + relpath(selection[0], parent_dir)
                    break
            current_abs_path = abspath(selection[0])
            listing = get_dir_contents(selection[0])

    # If here, 'selection' is a list of files/dirs; use them as our listing
    else:
        # If selection includes one of our top dirs, use the complete
        # listing from our settings.
        if set(selection).intersection(FILECHOOSER_DIRS):
            dir_name = ''
            selection = FILECHOOSER_DIRS
        listing = [{
            'display_name': f.split('/')[-1] + '/',
            'abs_path': f,
            'is_dir': True,
            'is_back': False,
            'size_display': None,
            'child_count': None,
        } for f in selection]

    # Determine empty_dir status (only back button, no real entries)
    empty_dir = (isinstance(listing, list)
                 and len(listing) <= 1
                 and all(item.get('is_back') for item in listing)
                 and not dir_error)

    # Build breadcrumbs
    breadcrumbs = build_breadcrumbs(dir_name, current_abs_path)

    # Render the page
    return render(request, 'django_gui/choose_file.html',
                  {'target_file': target_file,
                   'dir_name': dir_name,
                   'listing': listing,
                   'load_errors': load_errors,
                   'breadcrumbs': breadcrumbs,
                   'empty_dir': empty_dir,
                   'dir_error': dir_error,
                   'file_size_display': file_size_display})


################################################################################
def widget(request, field_list=''):
    global logger_server

    template_vars = {
        'field_list_string': field_list,
        'field_list': field_list.split(',') if field_list else [],
        'is_superuser': True,
        'websocket_server': WEBSOCKET_DATA_SERVER,
    }

    # Render what we've ended up with
    return render(request, 'django_gui/widget.html', template_vars)


################################################################################
def fields(request):
    global logger_server

    template_vars = {
        'websocket_server': WEBSOCKET_DATA_SERVER,
    }

    # Render what we've ended up with
    return render(request, 'django_gui/fields.html', template_vars)
