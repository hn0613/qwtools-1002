import React from 'react';
import { Button } from 'react-bootstrap';
import KWArgForm from './KWArgForm';

/**
 * ComponentCard — renders a single added component (reader/transform/writer).
 *
 * Shows the component name, existing kwargs in an editable table,
 * reorder/delete buttons, and a form to add new kwargs.
 *
 * Props:
 *   component: { id, class, kwargs }
 *   index: number
 *   totalCount: number
 *   displayName: string
 *   availableKwargs: string[]
 *   onDelete: () => void
 *   onMoveUp: () => void
 *   onMoveDown: () => void
 *   onAddKwarg: (key, value) => void
 *   onDeleteKwarg: (key) => void
 *   onUpdateKwarg: (key, value) => void
 */
export default function ComponentCard({
  component,
  index,
  totalCount,
  displayName,
  availableKwargs,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddKwarg,
  onDeleteKwarg,
  onUpdateKwarg,
}) {
  const kwargEntries = Object.entries(component.kwargs);
  const usedKeys = new Set(Object.keys(component.kwargs));
  const unusedKwargs = availableKwargs.filter((k) => !usedKeys.has(k));

  return (
    <div
      className="p-2 mb-2 bg-white text-dark rounded"
      style={{ border: '1px solid #ccc' }}
      data-testid="component-card"
    >
      {/* Header: component name + action buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong data-testid="component-name">{displayName}</strong>
        <div>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onMoveUp}
            disabled={index === 0}
            data-testid="move-up-button"
          >
            ↑
          </Button>{' '}
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            data-testid="move-down-button"
          >
            ↓
          </Button>{' '}
          <Button
            size="sm"
            variant="outline-danger"
            onClick={onDelete}
            data-testid="delete-component-button"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Kwargs table */}
      {kwargEntries.length > 0 && (
        <table className="table table-sm mt-2 mb-1" data-testid="kwargs-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Value</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {kwargEntries.map(([key, value]) => (
              <tr key={key} data-testid="kwarg-row">
                <td>{key}</td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    defaultValue={value}
                    onBlur={(e) => {
                      if (e.target.value !== value) {
                        onUpdateKwarg(key, e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                      }
                    }}
                    data-testid="kwarg-edit-input"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDeleteKwarg(key)}
                    data-testid="delete-kwarg-button"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add kwarg form */}
      {unusedKwargs.length > 0 && (
        <KWArgForm
          items={unusedKwargs}
          onAdd={onAddKwarg}
          testIdPrefix={component.id}
        />
      )}
    </div>
  );
}
