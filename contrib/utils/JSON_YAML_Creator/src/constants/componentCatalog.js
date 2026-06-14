/**
 * OpenRVDAS Component Catalog
 *
 * Single source of truth for all Reader, Transform, and Writer components
 * available in the JSON/YAML Creator. Each entry maps a human-readable
 * dropdown label to the exact Python class name and its __init__ parameters
 * as defined in the OpenRVDAS repository (logger/readers/, logger/transforms/,
 * logger/writers/).
 *
 * To add a new component:
 *   1. Add an entry to the appropriate array below.
 *   2. Set `label` to the display name shown in the dropdown.
 *   3. Set `className` to the exact Python class name (used in JSON/YAML output).
 *   4. Set `params` to the list of __init__ parameter names (excluding **kwargs).
 *      Use an empty array for components with no configurable parameters.
 */

// ─── Readers ──────────────────────────────────────────────────────────────────
// Source: logger/readers/*.py
export const readers = [
  {
    label: 'Cached Data Reader',
    className: 'CachedDataReader',
    params: [
      'subscription', 'data_server', 'bundle_seconds',
      'return_das_record', 'data_id', 'use_wss', 'check_cert',
    ],
  },
  {
    label: 'Composed Reader',
    className: 'ComposedReader',
    params: ['readers', 'transforms'],
  },
  {
    label: 'Database Reader',
    className: 'DatabaseReader',
    params: [
      'fields', 'database', 'host', 'user', 'password',
      'tail', 'sleep_interval',
    ],
  },
  {
    label: 'HTTP Reader',
    className: 'HTTPReader',
    params: ['url', 'method', 'headers', 'payload', 'interval', 'timeout'],
  },
  {
    label: 'Logfile Reader',
    className: 'LogfileReader',
    params: [
      'filebase', 'tail', 'refresh_file_spec', 'retry_interval',
      'interval', 'use_timestamps', 'time_acceleration_factor',
      'record_format', 'time_format', 'date_format', 'eol',
    ],
  },
  {
    label: 'ModBus Serial Reader',
    className: 'ModBusSerialReader',
    params: [
      'registers', 'port', 'baudrate', 'parity', 'stopbits', 'bytesize',
      'scan_file', 'slave', 'function', 'interval', 'sep', 'timeout',
    ],
  },
  {
    label: 'ModBus TCP Reader',
    className: 'ModBusTCPReader',
    params: [
      'registers', 'host', 'port', 'scan_file', 'slave',
      'function', 'interval', 'sep',
    ],
  },
  {
    label: 'MQTT Reader',
    className: 'MQTTReader',
    params: [
      'broker', 'channel', 'client_name', 'port',
      'clean_start', 'qos', 'return_as_bytes',
    ],
  },
  {
    label: 'Polled Serial Reader',
    className: 'PolledSerialReader',
    params: [
      'port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout',
      'eol', 'start_cmd', 'pre_read_cmd', 'stop_cmd',
    ],
  },
  {
    label: 'Redis Reader',
    className: 'RedisReader',
    params: ['channel', 'password'],
  },
  {
    label: 'Sealog Reader',
    className: 'SealogReader',
    params: ['uri', 'client_wsid', 'subs', 'check_cert'],
  },
  {
    label: 'Serial Reader',
    className: 'SerialReader',
    params: [
      'port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout',
      'eol', 'max_bytes', 'allow_empty',
    ],
  },
  {
    label: 'Socket Reader',
    className: 'SocketReader',
    params: ['channel', 'timeout', 'buffer_size', 'keep_binary'],
  },
  {
    label: 'TCP Reader',
    className: 'TCPReader',
    params: ['interface', 'port', 'eol', 'reuseaddr', 'reuseport'],
  },
  {
    label: 'Text File Reader',
    className: 'TextFileReader',
    params: [
      'file_spec', 'tail', 'refresh_file_spec', 'retry_interval',
      'interval', 'eol',
    ],
  },
  {
    label: 'Timeout Reader',
    className: 'TimeoutReader',
    params: [
      'reader', 'timeout', 'message', 'resume_message',
      'empty_is_okay', 'none_is_okay',
    ],
  },
  {
    label: 'UDP Reader',
    className: 'UDPReader',
    params: [
      'interface', 'port', 'mc_group', 'reuseaddr', 'reuseport',
      'eol', 'allow_empty',
    ],
  },
  {
    label: 'Websocket Reader',
    className: 'WebsocketReader',
    params: ['uri', 'check_cert'],
  },
];

// ─── Transforms ───────────────────────────────────────────────────────────────
// Source: logger/transforms/*.py
export const transforms = [
  {
    label: 'Convert Fields Transform',
    className: 'ConvertFieldsTransform',
    params: ['fields', 'delete_source_fields', 'delete_unconverted_fields'],
  },
  {
    label: 'Count Transform',
    className: 'CountTransform',
    params: [],
  },
  {
    label: 'Delta Transform',
    className: 'DeltaTransform',
    params: ['rate', 'field_type'],
  },
  {
    label: 'Derived Data Transform',
    className: 'DerivedDataTransform',
    params: [],
  },
  {
    label: 'Extract Field Transform',
    className: 'ExtractFieldTransform',
    params: ['field_name'],
  },
  {
    label: 'Format Transform',
    className: 'FormatTransform',
    params: ['format_str', 'defaults', 'use_iso_timestamp'],
  },
  {
    label: 'From JSON Transform',
    className: 'FromJSONTransform',
    params: ['das_record'],
  },
  {
    label: 'Geofence Transform',
    className: 'GeofenceTransform',
    params: [
      'latitude_field_name', 'longitude_field_name',
      'boundary_file_name', 'boundary_dir_name',
      'distance_from_boundary_in_degrees',
      'leaving_boundary_message', 'entering_boundary_message',
      'seconds_between_checks',
    ],
  },
  {
    label: 'Interpolation Transform',
    className: 'InterpolationTransform',
    params: ['field_spec', 'interval', 'window', 'data_id', 'metadata_interval'],
  },
  {
    label: 'MaxMin Transform',
    className: 'MaxMinTransform',
    params: [],
  },
  {
    label: 'Modify Value Transform',
    className: 'ModifyValueTransform',
    params: ['fields', 'data_id', 'delete_unmatched', 'quiet', 'metadata_interval'],
  },
  {
    label: 'NMEA Checksum Transform',
    className: 'NMEAChecksumTransform',
    params: ['checksum_optional', 'error_message', 'writer'],
  },
  {
    label: 'NMEA Transform',
    className: 'NMEATransform',
    params: ['nmea_list'],
  },
  {
    label: 'Parse NMEA Transform',
    className: 'ParseNMEATransform',
    params: ['json', 'message_path', 'sensor_path', 'sensor_model_path', 'time_format'],
  },
  {
    label: 'Parse Transform',
    className: 'ParseTransform',
    params: [
      'record_format', 'field_patterns', 'metadata', 'definition_path',
      'return_json', 'return_das_record', 'metadata_interval',
      'strip_unprintable', 'quiet', 'prepend_data_id', 'delimiter',
    ],
  },
  {
    label: 'Prefix Transform',
    className: 'PrefixTransform',
    params: ['prefix', 'sep'],
  },
  {
    label: 'QC Filter Transform',
    className: 'QCFilterTransform',
    params: ['bounds', 'message'],
  },
  {
    label: 'Regex Filter Transform',
    className: 'RegexFilterTransform',
    params: ['pattern', 'flags', 'negate'],
  },
  {
    label: 'Regex Parse Transform',
    className: 'RegexParseTransform',
    params: [
      'record_format', 'field_patterns', 'data_id', 'definition_path',
      'metadata', 'metadata_interval', 'fields',
      'delete_source_fields', 'delete_unconverted_fields',
    ],
  },
  {
    label: 'Regex Replace Transform',
    className: 'RegexReplaceTransform',
    params: ['patterns', 'count', 'flags'],
  },
  {
    label: 'Sealog Control Transform',
    className: 'SealogControlTransform',
    params: ['event_value', 'event_option_name', 'event_author'],
  },
  {
    label: 'Select Fields Transform',
    className: 'SelectFieldsTransform',
    params: ['keep', 'delete'],
  },
  {
    label: 'Slice Transform',
    className: 'SliceTransform',
    params: ['fields', 'sep'],
  },
  {
    label: 'Split Transform',
    className: 'SplitTransform',
    params: ['sep'],
  },
  {
    label: 'Strip Transform',
    className: 'StripTransform',
    params: ['chars', 'unprintable', 'strip_prefix', 'strip_suffix'],
  },
  {
    label: 'Subsample Transform',
    className: 'SubsampleTransform',
    params: ['field_spec', 'back_seconds', 'metadata_interval'],
  },
  {
    label: 'Timestamp Transform',
    className: 'TimestampTransform',
    params: [
      'time_format', 'time_zone', 'sep', 'use_nmea_timestamp',
      'nmea_timestamp_timeout', 'nmea_time_drift_threshold',
    ],
  },
  {
    label: 'ToDASRecord Transform',
    className: 'ToDASRecordTransform',
    params: ['data_id', 'field_name'],
  },
  {
    label: 'ToJSON Transform',
    className: 'ToJSONTransform',
    params: ['pretty'],
  },
  {
    label: 'To Sealog Transform',
    className: 'ToSealogTransform',
    params: ['config_file'],
  },
  {
    label: 'True Winds Transform',
    className: 'TrueWindsTransform',
    params: [
      'course_field', 'speed_field', 'heading_field',
      'wind_dir_field', 'wind_speed_field',
      'true_dir_name', 'true_speed_name', 'apparent_dir_name',
      'update_on_fields', 'max_field_age',
      'zero_line_reference', 'convert_wind_factor', 'convert_speed_factor',
      'data_id', 'metadata_interval',
    ],
  },
  {
    label: 'Unique Transform',
    className: 'UniqueTransform',
    params: [],
  },
  {
    label: 'Value Filter Transform',
    className: 'ValueFilterTransform',
    params: ['bounds', 'log_level'],
  },
  {
    label: 'XML Aggregator Transform',
    className: 'XMLAggregatorTransform',
    params: ['tag'],
  },
];

// ─── Writers ──────────────────────────────────────────────────────────────────
// Source: logger/writers/*.py
export const writers = [
  {
    label: 'Cached Data Writer',
    className: 'CachedDataWriter',
    params: [
      'data_server', 'start_server', 'back_seconds', 'cleanup_interval',
      'update_interval', 'max_backup', 'use_wss', 'check_cert',
    ],
  },
  {
    label: 'Composed Writer',
    className: 'ComposedWriter',
    params: ['transforms', 'writers'],
  },
  {
    label: 'Database Writer',
    className: 'DatabaseWriter',
    params: ['database', 'host', 'user', 'password', 'save_source'],
  },
  {
    label: 'Email Writer',
    className: 'EmailWriter',
    params: ['to', 'sender', 'subject', 'max_freq'],
  },
  {
    label: 'File Writer',
    className: 'FileWriter',
    params: [
      'filebase', 'filename', 'mode', 'delimiter', 'flush',
      'split_by_time', 'split_interval', 'header', 'header_file',
      'time_format', 'date_format', 'suffix', 'time_zone', 'create_path',
    ],
  },
  {
    label: 'Grafana Live Writer',
    className: 'GrafanaLiveWriter',
    params: [
      'host', 'stream_id', 'api_token', 'token_file', 'secure',
      'measurement_name', 'batch_size', 'queue_size',
    ],
  },
  {
    label: 'Google Sheets Writer',
    className: 'GoogleSheetsWriter',
    params: [
      'sheet_name_or_id', 'auth_key_path', 'use_service_account',
      'worksheet_name', 'force_create',
    ],
  },
  {
    label: 'InfluxDB Writer',
    className: 'InfluxDBWriter',
    params: [
      'bucket_name', 'measurement_name', 'tags', 'auth_token',
      'org', 'url', 'verify_ssl',
    ],
  },
  {
    label: 'Logfile Writer',
    className: 'LogfileWriter',
    params: [
      'filebase', 'delimiter', 'flush', 'split_interval', 'header',
      'header_file', 'time_format', 'date_format', 'time_zone',
      'suffix', 'split_char',
    ],
  },
  {
    label: 'Logger Manager Writer',
    className: 'LoggerManagerWriter',
    params: ['database', 'api', 'allowed_prefixes'],
  },
  {
    label: 'MQTT Writer',
    className: 'MQTTWriter',
    params: ['broker', 'channel', 'client_name', 'qos'],
  },
  {
    label: 'Redis Writer',
    className: 'RedisWriter',
    params: ['channel', 'password'],
  },
  {
    label: 'Record Screen Writer',
    className: 'RecordScreenWriter',
    params: [],
  },
  {
    label: 'Regex Logfile Writer',
    className: 'RegexLogfileWriter',
    params: [
      'filebase', 'flush', 'time_format', 'date_format', 'split_char',
      'suffix', 'header', 'header_file', 'rollover_hourly',
    ],
  },
  {
    label: 'Sealog Writer',
    className: 'SealogWriter',
    params: ['url', 'token', 'config_file'],
  },
  {
    label: 'Serial Writer',
    className: 'SerialWriter',
    params: ['port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout', 'eol'],
  },
  {
    label: 'Socket Writer',
    className: 'SocketWriter',
    params: ['channel'],
  },
  {
    label: 'TCP Writer',
    className: 'TCPWriter',
    params: ['destination', 'port', 'num_retry', 'warning_limit', 'eol', 'reuseaddr', 'reuseport'],
  },
  {
    label: 'Text File Writer',
    className: 'TextFileWriter',
    params: ['filename', 'flush', 'truncate', 'split_by_date', 'create_path', 'header', 'header_file'],
  },
  {
    label: 'Timeout Writer',
    className: 'TimeoutWriter',
    params: ['writer', 'timeout', 'message', 'resume_message', 'empty_is_okay', 'none_is_okay'],
  },
  {
    label: 'UDP Writer',
    className: 'UDPWriter',
    params: [
      'destination', 'port', 'mc_interface', 'mc_ttl', 'num_retry',
      'warning_limit', 'eol', 'reuseaddr', 'reuseport',
    ],
  },
  {
    label: 'Websocket Writer',
    className: 'WebsocketWriter',
    params: ['uri', 'cert_file', 'key_file', 'max_queue_size'],
  },
];
