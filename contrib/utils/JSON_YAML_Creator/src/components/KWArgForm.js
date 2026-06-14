import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';

/**
 * KWArgForm — a form for adding a single kwarg (key-value pair) to a component.
 *
 * Props:
 *   items: string[] — available kwarg names to choose from
 *   onAdd: (key: string, value: string) => void
 */
export default function KWArgForm({ items, onAdd, testIdPrefix }) {
  const [selectedKey, setSelectedKey] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!selectedKey || !value.trim()) return;
    onAdd(selectedKey, value.trim());
    setSelectedKey('');
    setValue('');
  };

  const divStyle = { display: 'flex', alignItems: 'center', gap: '4px' };
  const prefix = testIdPrefix || 'global';

  return (
    <div style={divStyle} className="mt-1">
      <Dropdown>
        <Dropdown.Toggle
          variant="success"
          size="sm"
          id={`${prefix}-kwarg-dropdown`}
          data-testid={`${prefix}-kwarg-dropdown`}
        >
          {selectedKey || 'Select Parameter'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {items.map((item) => (
            <Dropdown.Item
              key={item}
              onClick={() => setSelectedKey(item)}
              data-testid="kwarg-dropdown-item"
            >
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <input
        type="text"
        className="form-control form-control-sm"
        style={{ width: '120px' }}
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        data-testid={`${prefix}-kwarg-value-input`}
      />
      <Button
        className="addButton"
        variant="outline-primary"
        size="sm"
        onClick={handleAdd}
        data-testid={`${prefix}-kwarg-add-button`}
      >
        Add
      </Button>
    </div>
  );
}
