import React from 'react';
import ComponentSelector from './ComponentSelector';
import ComponentCard from './ComponentCard';

function getInstanceLabels(items) {
  const counts = {};
  items.forEach((item) => {
    counts[item.class] = (counts[item.class] || 0) + 1;
  });

  const seen = {};
  return items.map((item) => {
    seen[item.class] = (seen[item.class] || 0) + 1;
    if (counts[item.class] > 1) {
      return `${item.class} #${seen[item.class]}`;
    }
    return item.class;
  });
}

export default function ComponentSection({
  title,
  sectionKey,
  items,
  registry,
  onAdd,
  onRemove,
  onUpdateKwarg,
  onRemoveKwarg,
  onMove,
}) {
  const labels = getInstanceLabels(items);

  return (
    <div className='component-section'>
      <h1 style={{ display: 'flex', alignItems: 'center' }}>{title}</h1>
      <ComponentSelector
        sectionKey={sectionKey}
        registry={registry}
        onAdd={onAdd}
      />
      {items.map((item, index) => (
        <ComponentCard
          key={item.id}
          item={item}
          sectionKey={sectionKey}
          onUpdateKwarg={onUpdateKwarg}
          onRemoveKwarg={onRemoveKwarg}
          onRemove={onRemove}
          onMove={onMove}
          isFirst={index === 0}
          isLast={index === items.length - 1}
          instanceLabel={labels[index]}
        />
      ))}
    </div>
  );
}
