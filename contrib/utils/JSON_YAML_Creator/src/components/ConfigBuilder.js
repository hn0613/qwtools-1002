import React from 'react';
import '../App.css';
import './index.css';
import useConfig from '../state/useConfig';
import COMPONENT_REGISTRY from '../data/componentRegistry';
import ComponentSection from './ComponentSection';
import OutputPanel from './OutputPanel';

export default function ConfigBuilder() {
  const {
    state,
    exportData,
    addComponent,
    removeComponent,
    updateKwarg,
    removeKwarg,
    moveComponent,
  } = useConfig();

  return (
    <div className='blue-container p-3 my-3 text-white border'>
      <div className='blue-container-text'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm'>
              <ComponentSection
                title='Readers'
                sectionKey='readers'
                items={state.readers}
                registry={COMPONENT_REGISTRY.readers}
                onAdd={addComponent}
                onRemove={removeComponent}
                onUpdateKwarg={updateKwarg}
                onRemoveKwarg={removeKwarg}
                onMove={moveComponent}
              />
              <ComponentSection
                title='Transforms'
                sectionKey='transforms'
                items={state.transforms}
                registry={COMPONENT_REGISTRY.transforms}
                onAdd={addComponent}
                onRemove={removeComponent}
                onUpdateKwarg={updateKwarg}
                onRemoveKwarg={removeKwarg}
                onMove={moveComponent}
              />
              <ComponentSection
                title='Writers'
                sectionKey='writers'
                items={state.writers}
                registry={COMPONENT_REGISTRY.writers}
                onAdd={addComponent}
                onRemove={removeComponent}
                onUpdateKwarg={updateKwarg}
                onRemoveKwarg={removeKwarg}
                onMove={moveComponent}
              />
            </div>
            <div className='col-sm'>
              <OutputPanel data={exportData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
