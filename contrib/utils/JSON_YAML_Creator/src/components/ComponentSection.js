import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import ComponentCard from './ComponentCard';
import { displayNameToClass } from './componentRegistry';

/**
 * ComponentSection — a reusable section for Readers, Transforms, or Writers.
 *
 * Renders a title, a dropdown to select a component type, an Add button,
 * and a list of ComponentCards for each added component.
 *
 * Props:
 *   title: string — "Readers" | "Transforms" | "Writers"
 *   registry: { ClassName: { displayName, kwargs } }
 *   components: [{ id, class, kwargs }]
 *   onAdd: (className) => void
 *   onDelete: (id) => void
 *   onMoveUp: (id) => void
 *   onMoveDown: (id) => void
 *   onAddKwarg: (id, key, value) => void
 *   onDeleteKwarg: (id, key) => void
 *   onUpdateKwarg: (id, key, value) => void
 */
export default function ComponentSection({
  title,
  registry,
  components,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddKwarg,
  onDeleteKwarg,
  onUpdateKwarg,
}) {
  const [selected, setSelected] = useState('');

  const divStyle = { display: 'flex', alignItems: 'center' };

  const handleAdd = () => {
    if (!selected) return;
    const className = displayNameToClass(selected, registry);
    if (className) {
      onAdd(className);
    }
  };

  return (
    <div data-testid={`section-${title.toLowerCase()}`}>
      <h1 style={divStyle}>{title}</h1>
      <div className="form-group" style={divStyle}>
        <Dropdown>
          <Dropdown.Toggle
            variant="success"
            id={`dropdown-${title.toLowerCase()}`}
            data-testid={`${title.toLowerCase()}-dropdown-toggle`}
          >
            {selected || `Please Select a ${title.slice(0, -1)}`}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {Object.values(registry).map(({ displayName }) => (
              <Dropdown.Item
                key={displayName}
                href={`#/${displayName.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setSelected(displayName)}
                data-testid="dropdown-item"
              >
                {displayName}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button
          className="addButton"
          variant="outline-primary"
          onClick={handleAdd}
          data-testid={`${title.toLowerCase()}-add-button`}
        >
          Add
        </Button>{' '}
      </div>

      {/* Render added components */}
      {components.map((comp, idx) => (
        <ComponentCard
          key={comp.id}
          component={comp}
          index={idx}
          totalCount={components.length}
          displayName={
            registry[comp.class]
              ? registry[comp.class].displayName
              : comp.class
          }
          availableKwargs={
            registry[comp.class] ? registry[comp.class].kwargs : []
          }
          onDelete={() => onDelete(comp.id)}
          onMoveUp={() => onMoveUp(comp.id)}
          onMoveDown={() => onMoveDown(comp.id)}
          onAddKwarg={(key, value) => onAddKwarg(comp.id, key, value)}
          onDeleteKwarg={(key) => onDeleteKwarg(comp.id, key)}
          onUpdateKwarg={(key, value) => onUpdateKwarg(comp.id, key, value)}
        />
      ))}
    </div>
  );
}
