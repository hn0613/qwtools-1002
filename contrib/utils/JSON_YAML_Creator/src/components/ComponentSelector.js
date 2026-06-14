import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';

const SECTION_LABELS = {
  readers: 'Reader',
  transforms: 'Transform',
  writers: 'Writer',
};

export default function ComponentSelector({ sectionKey, registry, onAdd }) {
  const [selected, setSelected] = useState('');

  const label = SECTION_LABELS[sectionKey] || 'Component';
  const entries = Object.entries(registry);

  const handleAdd = () => {
    if (!selected) return;
    onAdd(sectionKey, selected);
    setSelected('');
  };

  const selectedDisplay = selected
    ? registry[selected].displayName
    : `Please Select a ${label}`;

  return (
    <div className='form-group' style={{ display: 'flex', alignItems: 'center' }}>
      <Dropdown>
        <Dropdown.Toggle variant='success' id={`dropdown-${sectionKey}`}>
          {selectedDisplay}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {entries.map(([className, meta]) => (
            <Dropdown.Item key={className} onClick={() => setSelected(className)}>
              {meta.displayName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <Button
        className='addButton'
        variant='outline-primary'
        disabled={!selected}
        onClick={handleAdd}
      >
        Add
      </Button>
    </div>
  );
}
