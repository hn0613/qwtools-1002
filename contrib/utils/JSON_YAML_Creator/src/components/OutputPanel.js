import React from 'react';
import YAML from 'yaml';
import './index.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function cleanComponent({ class: cls, kwargs }) {
  if (!kwargs || Object.keys(kwargs).length === 0) {
    return { class: cls };
  }
  return { class: cls, kwargs };
}

export default function OutputPanel({ data }) {
  const cleanData = {
    readers: data.readers.map(cleanComponent),
    transforms: data.transforms.map(cleanComponent),
    writers: data.writers.map(cleanComponent),
  };

  const jsonString = JSON.stringify(cleanData, null, 2);
  const yamlString = YAML.stringify(cleanData);

  return (
    <div>
      <div className='container p-3 my-3 bg-light text-white border'>
        <div className='row'>
          <div className='text-left col-10'>
            <pre data-testid='json-output'>{jsonString}</pre>
          </div>
          <div className='col-2'>
            <CopyToClipboard className='copyButton' text={jsonString}>
              <button>Copy JSON</button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
      <div className='container p-3 my-3 bg-light text-white border'>
        <div className='row'>
          <div className='text-left col-10'>
            <pre data-testid='yaml-output'>{yamlString}</pre>
          </div>
          <div className='col-2'>
            <CopyToClipboard className='copyButton' text={yamlString}>
              <button>Copy YAML</button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
    </div>
  );
}
