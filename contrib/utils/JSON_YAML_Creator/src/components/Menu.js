import React, { useState, useRef, useMemo } from 'react';
import '../App.css';
import './index.css';
import ComponentSection from './ComponentSection';
import JSONYAMLOutput from './JSONYAMLOutput';
import { READERS, TRANSFORMS, WRITERS } from './componentRegistry';
import {
  addComponent,
  deleteComponent,
  moveComponent,
  setKwarg,
  deleteKwarg,
  toOutputFormat,
} from './configStore';

export default function Menu() {
  const [readers, setReaders] = useState([]);
  const [transforms, setTransforms] = useState([]);
  const [writers, setWriters] = useState([]);
  const idCounter = useRef(0);

  const nextId = (prefix) => `${prefix}-${++idCounter.current}`;

  const outputConfig = useMemo(
    () => toOutputFormat(readers, transforms, writers),
    [readers, transforms, writers]
  );

  /**
   * Create a set of handler functions for a given section (readers/transforms/writers).
   * All handlers use functional state updaters to guarantee they see the latest state.
   */
  const makeHandlers = (setter, prefix) => ({
    onAdd: (className) =>
      setter((prev) => addComponent(prev, nextId(prefix), className)),
    onDelete: (id) => setter((prev) => deleteComponent(prev, id)),
    onMoveUp: (id) => setter((prev) => moveComponent(prev, id, -1)),
    onMoveDown: (id) => setter((prev) => moveComponent(prev, id, 1)),
    onAddKwarg: (id, key, value) =>
      setter((prev) => setKwarg(prev, id, key, value)),
    onDeleteKwarg: (id, key) =>
      setter((prev) => deleteKwarg(prev, id, key)),
    onUpdateKwarg: (id, key, value) =>
      setter((prev) => setKwarg(prev, id, key, value)),
  });

  const readerHandlers = makeHandlers(setReaders, 'r');
  const transformHandlers = makeHandlers(setTransforms, 't');
  const writerHandlers = makeHandlers(setWriters, 'w');

  return (
    <div className="blue-container p-3 my-3 text-white border">
      <div className="blue-container-text">
        <div className="container">
          <div className="row">
            <div className="col-sm">
              <ComponentSection
                title="Readers"
                registry={READERS}
                components={readers}
                {...readerHandlers}
              />
              <ComponentSection
                title="Transforms"
                registry={TRANSFORMS}
                components={transforms}
                {...transformHandlers}
              />
              <ComponentSection
                title="Writers"
                registry={WRITERS}
                components={writers}
                {...writerHandlers}
              />
            </div>
            <div className="col-sm">
              <JSONYAMLOutput config={outputConfig} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
