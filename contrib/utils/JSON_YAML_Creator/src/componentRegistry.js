/**
 * OpenRVDAS Component Registry
 *
 * Central catalog of readers, transforms, and writers aligned with the
 * actual Python classes in the OpenRVDAS repository.  Every entry keeps
 * three fields:
 *
 *   className   – the Python class name used in config files
 *   displayName – the human-readable label shown in the UI
 *   kwargs      – the __init__ parameters exposed to the user
 *
 * Deprecated components (NetworkReader, NetworkWriter, SubsampleTransform)
 * and contrib-only / Sealog-specific components are intentionally excluded.
 */

export const READERS = [
  {
    className: 'CachedDataReader',
    displayName: 'Cached Data Reader',
    kwargs: ['data_server', 'subscription', 'bundle_seconds', 'return_das_record', 'data_id'],
  },
  {
    className: 'ComposedReader',
    displayName: 'Composed Reader',
    kwargs: ['readers', 'transforms'],
  },
  {
    className: 'DatabaseReader',
    displayName: 'Database Reader',
    kwargs: ['fields', 'database', 'host', 'user', 'password', 'tail'],
  },
  {
    className: 'HTTPReader',
    displayName: 'HTTP Reader',
    kwargs: ['url', 'method', 'headers', 'payload', 'interval', 'timeout', 'encoding'],
  },
  {
    className: 'LogfileReader',
    displayName: 'Logfile Reader',
    kwargs: [
      'filebase', 'tail', 'refresh_file_spec', 'retry_interval', 'interval',
      'use_timestamps', 'record_format', 'time_format', 'date_format', 'eol',
    ],
  },
  {
    className: 'ModBusTCPReader',
    displayName: 'ModBus TCP Reader',
    kwargs: ['registers', 'host', 'port', 'scan_file', 'slave', 'function', 'interval', 'sep'],
  },
  {
    className: 'ModBusSerialReader',
    displayName: 'ModBus Serial Reader',
    kwargs: [
      'registers', 'port', 'baudrate', 'parity', 'stopbits', 'bytesize',
      'scan_file', 'slave', 'function', 'interval',
    ],
  },
  {
    className: 'MQTTReader',
    displayName: 'MQTT Reader',
    kwargs: ['broker', 'channel', 'client_name', 'port', 'qos'],
  },
  {
    className: 'PolledSerialReader',
    displayName: 'Polled Serial Reader',
    kwargs: [
      'port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout',
      'max_bytes', 'eol', 'start_cmd', 'pre_read_cmd', 'stop_cmd',
    ],
  },
  {
    className: 'RedisReader',
    displayName: 'Redis Reader',
    kwargs: ['channel', 'password'],
  },
  {
    className: 'SerialReader',
    displayName: 'Serial Reader',
    kwargs: ['port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout', 'max_bytes', 'eol'],
  },
  {
    className: 'SocketReader',
    displayName: 'Socket Reader',
    kwargs: ['channel', 'timeout', 'buffer_size'],
  },
  {
    className: 'TCPReader',
    displayName: 'TCP Reader',
    kwargs: ['interface', 'port', 'eol', 'reuseaddr', 'reuseport'],
  },
  {
    className: 'TextFileReader',
    displayName: 'Text File Reader',
    kwargs: ['file_spec', 'tail', 'refresh_file_spec', 'retry_interval', 'interval', 'eol'],
  },
  {
    className: 'TimeoutReader',
    displayName: 'Timeout Reader',
    kwargs: ['reader', 'timeout', 'message', 'resume_message', 'empty_is_okay', 'none_is_okay'],
  },
  {
    className: 'UDPReader',
    displayName: 'UDP Reader',
    kwargs: ['interface', 'port', 'mc_group', 'reuseaddr', 'reuseport', 'eol'],
  },
  {
    className: 'WebsocketReader',
    displayName: 'Websocket Reader',
    kwargs: ['uri', 'check_cert'],
  },
];

export const TRANSFORMS = [
  {
    className: 'ConvertFieldsTransform',
    displayName: 'Convert Fields Transform',
    kwargs: ['fields', 'delete_source_fields', 'delete_unconverted_fields'],
  },
  {
    className: 'CountTransform',
    displayName: 'Count Transform',
    kwargs: [],
  },
  {
    className: 'DeltaTransform',
    displayName: 'Delta Transform',
    kwargs: ['rate', 'field_type'],
  },
  {
    className: 'ExtractFieldTransform',
    displayName: 'Extract Field Transform',
    kwargs: ['field_name'],
  },
  {
    className: 'FormatTransform',
    displayName: 'Format Transform',
    kwargs: ['format_str', 'defaults'],
  },
  {
    className: 'FromJSONTransform',
    displayName: 'From JSON Transform',
    kwargs: ['das_record'],
  },
  {
    className: 'GeofenceTransform',
    displayName: 'Geofence Transform',
    kwargs: [
      'latitude_field_name', 'longitude_field_name',
      'boundary_file_name', 'boundary_dir_name',
      'distance_from_boundary_in_degrees',
      'leaving_boundary_message', 'entering_boundary_message',
    ],
  },
  {
    className: 'InterpolationTransform',
    displayName: 'Interpolation Transform',
    kwargs: ['field_spec', 'interval', 'window', 'data_id', 'metadata_interval'],
  },
  {
    className: 'MaxMinTransform',
    displayName: 'MaxMin Transform',
    kwargs: [],
  },
  {
    className: 'ModifyValueTransform',
    displayName: 'Modify Value Transform',
    kwargs: ['fields', 'data_id', 'delete_unmatched'],
  },
  {
    className: 'NMEAChecksumTransform',
    displayName: 'NMEA Checksum Transform',
    kwargs: ['checksum_optional', 'error_message'],
  },
  {
    className: 'NMEATransform',
    displayName: 'NMEA Transform',
    kwargs: ['nmea_list'],
  },
  {
    className: 'ParseNMEATransform',
    displayName: 'Parse NMEA Transform',
    kwargs: ['json', 'message_path', 'sensor_path', 'sensor_model_path', 'time_format'],
  },
  {
    className: 'ParseTransform',
    displayName: 'Parse Transform',
    kwargs: [
      'record_format', 'field_patterns', 'metadata', 'definition_path',
      'return_json', 'return_das_record', 'metadata_interval', 'quiet',
      'prepend_data_id', 'delimiter',
    ],
  },
  {
    className: 'PrefixTransform',
    displayName: 'Prefix Transform',
    kwargs: ['prefix', 'sep'],
  },
  {
    className: 'QCFilterTransform',
    displayName: 'QC Filter Transform',
    kwargs: ['bounds', 'message'],
  },
  {
    className: 'RegexFilterTransform',
    displayName: 'Regex Filter Transform',
    kwargs: ['pattern', 'flags', 'negate'],
  },
  {
    className: 'RegexParseTransform',
    displayName: 'Regex Parse Transform',
    kwargs: [
      'record_format', 'field_patterns', 'data_id', 'definition_path',
      'metadata', 'metadata_interval', 'fields', 'delete_source_fields',
    ],
  },
  {
    className: 'RegexReplaceTransform',
    displayName: 'Regex Replace Transform',
    kwargs: ['patterns', 'count', 'flags'],
  },
  {
    className: 'SelectFieldsTransform',
    displayName: 'Select Fields Transform',
    kwargs: ['keep', 'delete'],
  },
  {
    className: 'SliceTransform',
    displayName: 'Slice Transform',
    kwargs: ['fields', 'sep'],
  },
  {
    className: 'SplitTransform',
    displayName: 'Split Transform',
    kwargs: ['sep'],
  },
  {
    className: 'StripTransform',
    displayName: 'Strip Transform',
    kwargs: ['chars', 'unprintable', 'strip_prefix', 'strip_suffix'],
  },
  {
    className: 'TimestampTransform',
    displayName: 'Timestamp Transform',
    kwargs: ['time_format', 'time_zone', 'sep'],
  },
  {
    className: 'ToDASRecordTransform',
    displayName: 'ToDASRecord Transform',
    kwargs: ['data_id', 'field_name'],
  },
  {
    className: 'ToJSONTransform',
    displayName: 'ToJSON Transform',
    kwargs: ['pretty'],
  },
  {
    className: 'TrueWindsTransform',
    displayName: 'True Winds Transform',
    kwargs: [
      'course_field', 'speed_field', 'heading_field',
      'wind_dir_field', 'wind_speed_field',
      'true_dir_name', 'true_speed_name', 'apparent_dir_name',
      'update_on_fields', 'zero_line_reference',
      'convert_wind_factor', 'convert_speed_factor', 'metadata_interval',
    ],
  },
  {
    className: 'UniqueTransform',
    displayName: 'Unique Transform',
    kwargs: [],
  },
  {
    className: 'ValueFilterTransform',
    displayName: 'Value Filter Transform',
    kwargs: ['bounds', 'log_level'],
  },
  {
    className: 'XMLAggregatorTransform',
    displayName: 'XML Aggregator Transform',
    kwargs: ['tag'],
  },
];

export const WRITERS = [
  {
    className: 'CachedDataWriter',
    displayName: 'Cached Data Writer',
    kwargs: ['data_server', 'start_server', 'back_seconds', 'cleanup_interval', 'update_interval', 'max_backup'],
  },
  {
    className: 'ComposedWriter',
    displayName: 'Composed Writer',
    kwargs: ['transforms', 'writers'],
  },
  {
    className: 'DatabaseWriter',
    displayName: 'Database Writer',
    kwargs: ['database', 'host', 'user', 'password', 'save_source'],
  },
  {
    className: 'EmailWriter',
    displayName: 'Email Writer',
    kwargs: ['to', 'sender', 'subject', 'max_freq'],
  },
  {
    className: 'FileWriter',
    displayName: 'File Writer',
    kwargs: [
      'filebase', 'filename', 'mode', 'delimiter', 'flush',
      'split_by_time', 'split_interval', 'header',
      'time_format', 'date_format', 'suffix', 'create_path',
    ],
  },
  {
    className: 'GoogleSheetsWriter',
    displayName: 'Google Sheets Writer',
    kwargs: ['sheet_name_or_id', 'auth_key_path', 'use_service_account', 'worksheet_name'],
  },
  {
    className: 'GrafanaLiveWriter',
    displayName: 'Grafana Live Writer',
    kwargs: ['host', 'stream_id', 'api_token', 'token_file', 'secure', 'measurement_name', 'batch_size'],
  },
  {
    className: 'InfluxDBWriter',
    displayName: 'InfluxDB Writer',
    kwargs: ['bucket_name', 'measurement_name', 'tags', 'auth_token', 'org', 'url', 'verify_ssl'],
  },
  {
    className: 'LogfileWriter',
    displayName: 'Logfile Writer',
    kwargs: [
      'filebase', 'delimiter', 'flush', 'split_interval',
      'header', 'header_file', 'time_format', 'date_format', 'suffix', 'split_char',
    ],
  },
  {
    className: 'LoggerManagerWriter',
    displayName: 'Logger Manager Writer',
    kwargs: ['database', 'api', 'allowed_prefixes'],
  },
  {
    className: 'MQTTWriter',
    displayName: 'MQTT Writer',
    kwargs: ['broker', 'channel', 'client_name', 'qos'],
  },
  {
    className: 'RecordScreenWriter',
    displayName: 'Record Screen Writer',
    kwargs: [],
  },
  {
    className: 'RedisWriter',
    displayName: 'Redis Writer',
    kwargs: ['channel', 'password'],
  },
  {
    className: 'RegexLogfileWriter',
    displayName: 'Regex Logfile Writer',
    kwargs: [
      'filebase', 'flush', 'time_format', 'date_format',
      'split_char', 'suffix', 'header', 'header_file', 'rollover_hourly',
    ],
  },
  {
    className: 'SerialWriter',
    displayName: 'Serial Writer',
    kwargs: ['port', 'baudrate', 'bytesize', 'parity', 'stopbits', 'timeout', 'eol'],
  },
  {
    className: 'SocketWriter',
    displayName: 'Socket Writer',
    kwargs: ['channel'],
  },
  {
    className: 'TCPWriter',
    displayName: 'TCP Writer',
    kwargs: ['destination', 'port', 'num_retry', 'warning_limit', 'eol'],
  },
  {
    className: 'TextFileWriter',
    displayName: 'Text File Writer',
    kwargs: ['filename', 'flush', 'truncate', 'split_by_date', 'create_path', 'header'],
  },
  {
    className: 'TimeoutWriter',
    displayName: 'Timeout Writer',
    kwargs: ['writer', 'timeout', 'message', 'resume_message', 'empty_is_okay', 'none_is_okay'],
  },
  {
    className: 'UDPWriter',
    displayName: 'UDP Writer',
    kwargs: ['destination', 'port', 'mc_interface', 'mc_ttl', 'num_retry', 'warning_limit', 'eol'],
  },
  {
    className: 'WebsocketWriter',
    displayName: 'Websocket Writer',
    kwargs: ['uri', 'cert_file', 'key_file', 'max_queue_size'],
  },
];
