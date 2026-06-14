import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';

export default function KWArgEditor({
  item,
  sectionKey,
  availableKwargs,
  onUpdateKwarg,
  onRemoveKwarg,
}) {
  const [selectedKwarg, setSelectedKwarg] = useState('');
  const [newValue, setNewValue] = useState('');

  const existingKeys = Object.keys(item.kwargs || {});
  const remainingKwargs = availableKwargs.filter(
    (k) => !existingKeys.includes(k)
  );

  const handleAdd = () => {
    if (!selectedKwarg) return;
    onUpdateKwarg(sectionKey, item.id, selectedKwarg, newValue);
    setSelectedKwarg('');
    setNewValue('');
  };

  return (
    <div className='kwarg-editor'>
      {existingKeys.map((key) => (
        <div key={key} className='kwarg-row'>
          <span className='kwarg-label'>{key}:</span>
          <input
            type='text'
            className='kwarg-input'
            value={item.kwargs[key]}
            aria-label={`${key} value`}
            onChange={(e) =>
              onUpdateKwarg(sectionKey, item.id, key, e.target.value)
            }
          />
          <Button
            variant='outline-danger'
            size='sm'
            className='kwarg-delete-btn'
            aria-label={`Delete ${key}`}
            onClick={() => onRemoveKwarg(sectionKey, item.id, key)}
          >
            x
          </Button>
        </div>
      ))}

      {remainingKwargs.length > 0 && (
        <div className='kwarg-add-row'>
          <Dropdown>
            <Dropdown.Toggle variant='success' size='sm' id={`kwarg-add-${item.id}`}>
              {selectedKwarg || 'Select a kwarg'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {remainingKwargs.map((k) => (
                <Dropdown.Item key={k} onClick={() => setSelectedKwarg(k)}>
                  {k}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <input
            type='text'
            className='kwarg-input'
            placeholder='Value'
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Button
            className='addButton'
            variant='outline-primary'
            size='sm'
            disabled={!selectedKwarg}
            onClick={handleAdd}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
