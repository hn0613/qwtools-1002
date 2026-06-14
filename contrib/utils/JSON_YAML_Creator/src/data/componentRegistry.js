const COMPONENT_REGISTRY = {
  readers: {
    CachedDataReader: {
      displayName: 'Cached Data Reader',
      kwargs: ['data_server', 'subscription'],
    },
    ComposedReader: {
      displayName: 'Composed Reader',
      kwargs: ['reader', 'readers', 'transforms', 'check_format'],
    },
    DatabaseReader: {
      displayName: 'Database Reader',
      kwargs: [],
    },
    LogfileReader: {
      displayName: 'Logfile Reader',
      kwargs: ['filebase', 'tail', 'refresh_file_spec', 'retry_interval', 'interval'],
    },
    MQTTReader: {
      displayName: 'MQTT Reader',
      kwargs: ['channel'],
    },
    NetworkReader: {
      displayName: 'Network Reader',
      kwargs: [],
    },
    PolledSerialReader: {
      displayName: 'Polled Serial Reader',
      kwargs: ['hello', 'works'],
    },
    RedisReader: {
      displayName: 'Redis Reader',
      kwargs: ['channel'],
    },
    SerialReader: {
      displayName: 'Serial Reader',
      kwargs: ['baudrate', 'port', 'eol'],
    },
    TimeoutReader: {
      displayName: 'Timeout Reader',
      kwargs: ['reader', 'timeout', 'message', 'resume_message', 'empty_is_okay', 'none_is_okay'],
    },
    UDPReader: {
      displayName: 'UDP Reader',
      kwargs: ['port', 'source', 'eol'],
    },
  },
  transforms: {
    CountTransform: {
      displayName: 'Count Transform',
      kwargs: [],
    },
    DerivedDataTransform: {
      displayName: 'Derived Data Transform',
      kwargs: [],
    },
    ExtractFieldTransform: {
      displayName: 'Extract Field Transform',
      kwargs: ['field_name'],
    },
    FormatTransform: {
      displayName: 'Format Transform',
      kwargs: ['format_str', 'defaults'],
    },
    FromJsonTransform: {
      displayName: 'From Json Transform',
      kwargs: ['das_record'],
    },
    InterpolationTransform: {
      displayName: 'Interpolation Transform',
      kwargs: ['field_spec', 'interval', 'window', 'metadata_interval'],
    },
    MaxMinTransform: {
      displayName: 'MaxMin Transform',
      kwargs: [],
    },
    NMEATransform: {
      displayName: 'NMEA Transform',
      kwargs: [],
    },
    ParseNMEATransform: {
      displayName: 'Parse NMEA Transform',
      kwargs: ['json', 'message_path', 'sensor_path', 'sensor_model_path', 'time_format'],
    },
    ParseTransform: {
      displayName: 'Parse Transform',
      kwargs: ['record_format', 'field_patterns', 'metadata', 'definition_path', 'return_json', 'return_das_record', 'metadata_interval', 'quiet'],
    },
    PrefixTransform: {
      displayName: 'Prefix Transform',
      kwargs: ['prefix', 'sep'],
    },
    QCFilterTransform: {
      displayName: 'QC Filter Transform',
      kwargs: ['bounds', 'message'],
    },
    RegexFilterTransform: {
      displayName: 'Regex Filter Transform',
      kwargs: ['pattern', 'flags', 'negate'],
    },
    SelectFieldsTransform: {
      displayName: 'Select Fields Transform',
      kwargs: ['keep', 'delete'],
    },
    SliceTransform: {
      displayName: 'Slice Transform',
      kwargs: ['fields', 'sep'],
    },
    SubsampleTransform: {
      displayName: 'Subsample Transform',
      kwargs: ['field_spec', 'back_seconds', 'metadata_interval'],
    },
    TimestampTransform: {
      displayName: 'Timestamp Transform',
      kwargs: ['time_format', 'sep'],
    },
    ToDASRecordTransform: {
      displayName: 'ToDASRecord Transform',
      kwargs: ['data_id', 'field_name'],
    },
    ToJSONTransform: {
      displayName: 'ToJSON Transform',
      kwargs: ['pretty'],
    },
    TrueWindsTransform: {
      displayName: 'True Winds Transform',
      kwargs: [
        'course_field', 'speed_field', 'heading_field',
        'wind_dir_field', 'wind_speed_field',
        'true_dir_name', 'true_speed_name',
        'apparent_dir_name', 'update_on_fields',
        'zero_line_reference', 'convert_wind_factor',
        'convert_speed_factor', 'metadata_interval',
      ],
    },
    XMLAggregatorTransform: {
      displayName: 'XMLAggregator Transform',
      kwargs: ['input_format', 'output_format'],
    },
  },
  writers: {
    CachedDataWriter: {
      displayName: 'Cached Data Writer',
      kwargs: ['data_server', 'start_server', 'back_seconds', 'cleanup_interval', 'update_interval', 'max_backup'],
    },
    ComposedWriter: {
      displayName: 'Composed Writer',
      kwargs: ['transforms', 'writers', 'check_format'],
    },
    DatabaseWriter: {
      displayName: 'Database Writer',
      kwargs: ['database', 'host', 'user', 'password', 'save_source'],
    },
    EmailWriter: {
      displayName: 'Email Writer',
      kwargs: ['to', 'sender', 'subject', 'max_freq'],
    },
    InfluxdbWriter: {
      displayName: 'Influxdb Writer',
      kwargs: ['bucket_name'],
    },
    LogfileWriter: {
      displayName: 'Logfile Writer',
      kwargs: ['filebase', 'flush', 'time_format', 'date_format', 'suffix', 'rollover_hourly'],
    },
    NetworkWriter: {
      displayName: 'Network Writer',
      kwargs: ['network', 'num_retry', 'eol'],
    },
    RecordScreenWriter: {
      displayName: 'Record Screen Writer',
      kwargs: [],
    },
    RedisWriter: {
      displayName: 'Redis Writer',
      kwargs: ['channel', 'password'],
    },
    TextFileWriter: {
      displayName: 'Text File Writer',
      kwargs: [],
    },
    TimeoutWriter: {
      displayName: 'Timeout Writer',
      kwargs: ['writer', 'timeout', 'message', 'resume_message', 'empty_is_okay', 'none_is_okay'],
    },
    UDPWriter: {
      displayName: 'UDP Writer',
      kwargs: ['port', 'destination', 'interface', 'ttl', 'num_retry', 'eol'],
    },
  },
};

export default COMPONENT_REGISTRY;
