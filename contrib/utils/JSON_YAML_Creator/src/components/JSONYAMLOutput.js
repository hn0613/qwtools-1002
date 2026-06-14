import React, { useMemo } from 'react';
import YAML from 'yaml';
import './index.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';

/**
 * JSONYAMLOutput — preview panel showing the generated JSON and YAML.
 *
 * Props:
 *   config: { readers: [...], transforms: [...], writers: [...] }
 *           Already in output format (no internal id or kwargClass fields).
 */
export default function JSONYAMLOutput({ config }) {
  const jsonStr = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const yamlStr = useMemo(() => YAML.stringify(config), [config]);

  const divStyle = { display: 'flex', alignItems: 'center' };

  return (
    <div data-testid="json-yaml-output">
      <div className="container p-3 my-3 bg-light text-white border">
        <div className="row">
          <div className="text-left col-10">
            <pre style={divStyle} data-testid="json-preview">
              {jsonStr}
            </pre>
          </div>
          <div className="col-2">
            <CopyToClipboard className="copyButton" text={jsonStr}>
              <button data-testid="copy-json-button">Copy JSON</button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
      <div className="container p-3 my-3 bg-light text-white border">
        <div className="row">
          <div className="text-left col-10">
            <pre data-testid="yaml-preview">{yamlStr}</pre>
          </div>
          <div className="col-2">
            <CopyToClipboard className="copyButton" text={yamlStr}>
              <button data-testid="copy-yaml-button">Copy YAML</button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
    </div>
  );
}
