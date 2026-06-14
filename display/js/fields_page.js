////////////////////////////////////////////////////////////////////////////////
// fields_page.js
//
// Page-specific script for display/html/fields.html.
// Wires together ConnectionManager, StatusBar, and DataTable to display
// real-time field metadata from the CachedDataServer's "describe" protocol.
//
// Dependencies (must be loaded before this script):
//   - settings.js         (defines WEBSOCKET_DATA_SERVER)
//   - jquery-3.6.3.min.js (optional, used only for DOM ready convenience)
//   - connection_manager.js
//   - status_bar.js
//   - data_table.js
//
// This script runs automatically on page load and requires no manual init.
////////////////////////////////////////////////////////////////////////////////

(function() {
  'use strict';

  // Column definitions matching the CachedDataServer describe response
  var COLUMNS = [
    {key: 'field_name',        label: '字段名 Field Name',       sortable: true},
    {key: 'description',       label: '描述 Description',       sortable: true},
    {key: 'units',             label: '单位 Units',             sortable: true},
    {key: 'device',            label: '设备 Device',            sortable: true},
    {key: 'device_type',       label: '设备类型 Device Type',    sortable: true},
    {key: 'device_type_field', label: '设备字段 Device Field',   sortable: true}
  ];

  // Describe request interval (ms) — matches original fields.html behavior
  var DESCRIBE_INTERVAL = 3000;

  // State
  var status_bar = null;
  var data_table = null;
  var conn_mgr   = null;
  var describe_timer = null;

  ////////////////////////////////////////////////////////////////////////////
  // describe_to_rows — convert CachedDataServer describe response to
  //                    an array of row objects suitable for DataTable.
  //
  // Input (describe response data):
  //   { "S330Latitude": {"description":"...","units":"...","device":"...", ...}, ... }
  //
  // Output:
  //   [ {field_name:"S330Latitude", description:"...", units:"...", ...}, ... ]
  function describe_to_rows(data_dict) {
    if (!data_dict || typeof data_dict !== 'object') return [];

    var field_names = Object.keys(data_dict);
    field_names.sort();

    var rows = [];
    for (var i = 0; i < field_names.length; i++) {
      var fname = field_names[i];
      var meta  = data_dict[fname] || {};
      rows.push({
        field_name:        fname,
        description:       meta.description       || null,
        units:             meta.units             || null,
        device:            meta.device            || null,
        device_type:       meta.device_type       || null,
        device_type_field: meta.device_type_field  || null
      });
    }
    return rows;
  }

  ////////////////////////////////////////////////////////////////////////////
  // init — called when DOM is ready
  function init() {
    // Resolve WebSocket URL
    var ws_url = (typeof WEBSOCKET_DATA_SERVER !== 'undefined')
      ? WEBSOCKET_DATA_SERVER
      : 'ws://' + (window.location.hostname || 'localhost') + ':80/cds-ws';

    // Fix empty hostname (e.g. ws://:80/cds-ws)
    if (ws_url.indexOf('//:') > 0) {
      ws_url = ws_url.replace('//:', '//' + window.location.hostname + ':');
    }

    // ---- StatusBar ----
    status_bar = new StatusBar('status-bar-container', {
      title: 'Data Server Fields',
      stale_threshold: 10,
      dead_threshold: 30
    });

    // ---- DataTable ----
    data_table = new DataTable('field-table-container', COLUMNS, {
      row_id_key: 'field_name',
      search_placeholder: '搜索字段名、描述、设备…',
      groupable: true,
      group_key: 'device',
      on_filter_change: function(shown, total) {
        status_bar.set_field_count(shown, total);
      }
    });

    // ---- Group button ----
    var group_btn = document.getElementById('group-by-device-btn');
    if (group_btn) {
      group_btn.addEventListener('click', function() {
        var active = group_btn.classList.toggle('rvdas-active');
        data_table.set_grouping(active);
        // Refresh count after grouping toggle
        status_bar.set_field_count(
          data_table.get_filtered_count(),
          data_table.get_total_count()
        );
      });
    }

    // ---- ConnectionManager ----
    conn_mgr = new ConnectionManager(ws_url, {
      retry_interval: 3000,

      on_open: function() {
        status_bar.set_connection_state('connected');
        // Send first describe request
        conn_mgr.send({'type': 'describe'});
        // Set up polling: re-send describe every DESCRIBE_INTERVAL ms
        clearInterval(describe_timer);
        describe_timer = setInterval(function() {
          if (conn_mgr.get_state() === 'connected') {
            conn_mgr.send({'type': 'describe'});
          }
        }, DESCRIBE_INTERVAL);
      },

      on_close: function() {
        status_bar.set_connection_state('reconnecting');
        // Stop describe polling while disconnected
        clearInterval(describe_timer);
        describe_timer = null;
      },

      on_message: function(raw) {
        try {
          var msg = JSON.parse(raw);
        } catch (e) {
          console.warn('[fields_page] Failed to parse message: ' + raw);
          return;
        }

        if (msg.type === 'describe') {
          if (msg.status === 200 && msg.data) {
            var rows = describe_to_rows(msg.data);
            data_table.set_data(rows);
            status_bar.mark_updated();
            status_bar.set_field_count(
              data_table.get_filtered_count(),
              data_table.get_total_count()
            );
          } else {
            console.warn('[fields_page] Describe response with status ' + msg.status);
          }
        }

        // Flow control: tell server we're ready for next message
        conn_mgr.send({'type': 'ready'});
      },

      on_error: function() {
        // Error is usually followed by onclose, which handles UI
      },

      on_state_change: function(state) {
        status_bar.set_connection_state(state);
      }
    });

    // Start connecting
    conn_mgr.connect();

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
      clearInterval(describe_timer);
      if (conn_mgr) conn_mgr.close();
    });
  }

  ////////////////////////////////////////////////////////////////////////////
  // Boot — wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
