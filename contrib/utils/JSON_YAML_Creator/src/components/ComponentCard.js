import React from 'react';
import { Card, Button } from 'react-bootstrap';
import KWArgEditor from './KWArgEditor';
import COMPONENT_REGISTRY from '../data/componentRegistry';

export default function ComponentCard({
  item,
  sectionKey,
  onUpdateKwarg,
  onRemoveKwarg,
  onRemove,
  onMove,
  isFirst,
  isLast,
  instanceLabel,
}) {
  const regEntry = COMPONENT_REGISTRY[sectionKey]?.[item.class];
  const availableKwargs = regEntry ? regEntry.kwargs : [];

  return (
    <Card className='component-card mb-2'>
      <Card.Header className='component-card-header'>
        <span className='component-card-title'>{instanceLabel}</span>
        <span className='component-card-actions'>
          <Button
            variant='outline-secondary'
            size='sm'
            disabled={isFirst}
            aria-label='Move up'
            onClick={() => onMove(sectionKey, item.id, 'up')}
          >
            &#9650;
          </Button>
          <Button
            variant='outline-secondary'
            size='sm'
            disabled={isLast}
            aria-label='Move down'
            onClick={() => onMove(sectionKey, item.id, 'down')}
          >
            &#9660;
          </Button>
          <Button
            variant='outline-danger'
            size='sm'
            aria-label='Delete component'
            onClick={() => onRemove(sectionKey, item.id)}
          >
            &#10005;
          </Button>
        </span>
      </Card.Header>
      <Card.Body>
        <KWArgEditor
          item={item}
          sectionKey={sectionKey}
          availableKwargs={availableKwargs}
          onUpdateKwarg={onUpdateKwarg}
          onRemoveKwarg={onRemoveKwarg}
        />
      </Card.Body>
    </Card>
  );
}
