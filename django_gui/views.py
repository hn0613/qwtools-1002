from django.contrib import auth
from .django_server_api import DjangoServerAPI
from django_gui.settings import FILECHOOSER_DIRS
from django_gui.settings import WEBSOCKET_DATA_SERVER
import json
import logging

from json import JSONDecodeError
from os import listdir
from os.path import dirname, isfile, isdir, abspath, relpath, realpath, basename
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
def is_path_allowed(path):
    """Check whether *path* resolves inside one of FILECHOOSER_DIRS.

    An empty string is always allowed (it signals root-level navigation).
    Uses ``os.path.realpath`` so that symlinks cannot escape the boundary.
    """
    if not path:
        return True
    real_path = realpath(path)
    for d in FILECHOOSER_DIRS:
        real_d = realpath(d)
        if real_path == real_d or real_path.startswith(real_d + '/'):
            return True
    return False


################################################################################
def _build_breadcrumbs(dir_path):
    """Return a list of breadcrumb dicts ``[{name, path, active}]``.

    The first crumb always represents the base directory and links back to
    the root listing (``path=''``).  Intermediate crumbs link to their
    absolute directory path.  The last crumb is marked *active* and has
    ``path=None`` (not clickable).
    """
    if not dir_path:
        return []

    abs_path = abspath(dir_path)
    base_dir = None
    for base in FILECHOOSER_DIRS:
        real_base = realpath(base)
        real_abs = realpath(abs_path)
        if real_abs == real_base or real_abs.startswith(real_base + '/'):
            base_dir = base
            break

    if base_dir is None:
        return []

    base_name = basename(abspath(base_dir))
    rel = relpath(abs_path, abspath(base_dir))

    crumbs = [{'name': base_name, 'path': '', 'active': False}]

    if rel != '.':
        parts = rel.split('/')
        for i, part in enumerate(parts):
            is_last = (i == len(parts) - 1)
            crumbs.append({
                'name': part,
                'path': abspath(abspath(base_dir) + '/' + '/'.join(parts[:i + 1])),
                'active': is_last,
            })
    else:
        crumbs[0]['active'] = True

    return crumbs


################################################################################
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
    def get_dir_contents(dir_name):
        """Return an ordered dict of enriched listing items.

        Each value is a dict with keys: name, path, type.
        On error, returns ``{'__error__': {name, path, type}}``.
        """
        # If at root, set empty selection; otherwise allow pop back up a level
        at_root = abspath(dir_name) in FILECHOOSER_DIRS
        contents = {
            'back': {
                'name': '\u21a9\ufe0f Back',
                'path': '' if at_root else abspath(dir_name + '/..'),
                'type': 'back',
            }
        }

        try:
            filenames = listdir(dir_name)
        except PermissionError:
            return {'__error__': {
                'name': 'Cannot read directory: permission denied',
                'path': '', 'type': 'error',
            }}
        except FileNotFoundError:
            return {'__error__': {
                'name': 'Directory not found',
                'path': '', 'type': 'error',
            }}
        except Exception as e:
            return {'__error__': {
                'name': 'Error reading directory: %s' % str(e),
                'path': '', 'type': 'error',
            }}

        for filename in sorted(filenames):
            path = dir_name + '/' + filename
            abs_path = abspath(path)
            if isdir(path):
                contents['dir_' + filename] = {
                    'name': filename + '/',
                    'path': abs_path,
                    'type': 'dir',
                }
            elif filename.endswith(('.yaml', '.yml')):
                contents['file_' + filename] = {
                    'name': filename,
                    'path': abs_path,
                    'type': 'yaml',
                }
            # Skip all other file types

        return contents

    ##################
    # Start of choose_file() code
    target_file = None   # file we're going to load
    load_errors = []     # where we store any errors
    dir_name = ''        # display-friendly directory name
    breadcrumbs = []     # breadcrumb trail for navigation
    empty_directory = False  # flag for empty directory state

    # If post, figure out what user selected
    if request.method == 'POST':
        selection = [request.POST.get('select_file', '')]

        # --- Server-side path validation for navigation ---
        if selection[0] and not is_path_allowed(selection[0]):
            load_errors.append(
                'Access denied: path is outside allowed directories.')
            selection = ['']

        # Was this a request to load the target file?
        target_file = request.POST.get('target_file')
        if target_file:
            # --- Server-side path validation for loading ---
            if not is_path_allowed(target_file):
                load_errors.append(
                    'Access denied: path is outside allowed directories.')
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
                except (JSONDecodeError, ScannerError) as e:
                    load_errors.append(
                        'Error loading "%s": %s' % (target_file, str(e)))
                except ValueError as e:
                    load_errors.append(str(e))
                except PermissionError:
                    load_errors.append(
                        'Cannot read file "%s": permission denied' % target_file)
                except FileNotFoundError:
                    load_errors.append(
                        'File not found: "%s"' % target_file)

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

    # If we don't have a selection, use the complete listing from our settings.
    if not selection or selection == ['']:
        logging.debug('No selection, so setting up with: %s', FILECHOOSER_DIRS)
        dir_name = ''
        selection = FILECHOOSER_DIRS

    # Here, we should have a selection of *some* sort. Figure out how to
    # display it: if a single element and a directory, expand the
    # directory. If single element and a file, it's our target file. If
    # multiple elements, just display list of elements.
    if len(selection) == 1:
        # If it's a file, designate it as the target_file; we won't bother
        # with a listing.
        if isfile(selection[0]):
            target_file = selection[0]
            listing = {}

        # If it's a directory, fetch/expand its contents into the listing
        else:
            for base in FILECHOOSER_DIRS:
                parent_dir = dirname(base)
                if selection[0].startswith(parent_dir):
                    dir_name = './' + relpath(selection[0], parent_dir)
                    break
            breadcrumbs = _build_breadcrumbs(selection[0])
            listing = get_dir_contents(selection[0])

    # If here, 'selection' is a list of files/dirs; use them as our listing
    else:
        # If selection includes one of our top dirs, use the complete
        # listing from our settings.
        if set(selection).intersection(FILECHOOSER_DIRS):
            dir_name = ''
            selection = FILECHOOSER_DIRS
        listing = {
            'dir_' + f.split('/')[-1]: {
                'name': f.split('/')[-1] + '/',
                'path': f,
                'type': 'dir',
            } for f in selection
        }

    # Detect empty directory: listing has only the back button and no
    # error entry
    if (not target_file
            and isinstance(listing, dict)
            and '__error__' not in listing
            and len(listing) <= 1):
        empty_directory = True

    # Build display-friendly path for the confirmation page
    target_display = ''
    if target_file:
        for base in FILECHOOSER_DIRS:
            parent_dir = dirname(base)
            if target_file.startswith(parent_dir):
                target_display = './' + relpath(target_file, parent_dir)
                break
        if not target_display:
            target_display = target_file

    # Render the page
    return render(request, 'django_gui/choose_file.html',
                  {'target_file': target_file,
                   'target_display': target_display,
                   'dir_name': dir_name,
                   'listing': listing,
                   'load_errors': load_errors,
                   'breadcrumbs': breadcrumbs,
                   'empty_directory': empty_directory})


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
