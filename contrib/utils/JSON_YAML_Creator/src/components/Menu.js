import React, { useState } from 'react';
import '../App.css';
import './index.css';
import { Dropdown, Button } from 'react-bootstrap';
import JSONYAMLOutput from './JSONYAMLOutput';
import KWArgs from './KWArgs';
import { READERS, TRANSFORMS, WRITERS } from '../componentRegistry';

/** Look up a registry entry by its display name. */
const findComponent = (registry, displayName) =>
  registry.find((c) => c.displayName === displayName);

/**
 * Renders a component-type section (Readers / Transforms / Writers).
 *
 * Each section contains:
 *   1. A dropdown populated from the registry
 *   2. An "Add" button
 *   3. A KWArgs panel when the selected component has been added and has kwargs
 */
function ComponentSection({
  title,
  registry,
  selected,
  onSelect,
  allItems,
  onAdd,
  allKwargs,
  kwargCallback,
}) {
  const entry = findComponent(registry, selected);
  const isAdded = entry && allItems.some((e) => e.class === entry.className);
  const hasKwargs = entry && entry.kwargs.length > 0;

  const divStyle = { display: 'flex', alignItems: 'center' };

  return (
    <>
      <h1 style={divStyle}>{title}</h1>
      <div className='form-group' style={divStyle}>
        <Dropdown>
          <Dropdown.Toggle variant='success' id={`dropdown-${title}`}>
            {selected.length > 0 ? selected : `Please Select a ${title.slice(0, -1)}`}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {registry.map((comp) => (
              <Dropdown.Item
                key={comp.className}
                onClick={(e) => onSelect(e)}
              >
                {comp.displayName}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button
          className='addButton'
          variant='outline-primary'
          onClick={onAdd}
        >
          Add
        </Button>{' '}
      </div>

      {isAdded && hasKwargs ? (
        <KWArgs
          kwargCallback={kwargCallback}
          items={entry.kwargs}
          kwClass={entry.className}
        />
      ) : null}
    </>
  );
}

function YAML() {
  // Chosen items in the dropdown menus (display names)
  const [reader, setReader] = useState('');
  const [transform, setTransform] = useState('');
  const [writer, setWriter] = useState('');

  // Arrays of added components
  const [allReaders, setAllReaders] = useState([]);
  const [allTransforms, setAllTransforms] = useState([]);
  const [allWriters, setAllWriters] = useState([]);

  // KWarg tracking arrays
  const [allReaderKwargs, setReaderAllKwargs] = useState([]);
  const [allTransformKwargs, setTransformAllKwargs] = useState([]);
  const [allWriterKwargs, setWriterAllKwargs] = useState([]);

  // --- kwarg callbacks (unchanged logic) ---

  const readerKwargCallback = (val) => {
    const entry = findComponent(READERS, reader);
    if (!entry) return;
    let obj = allReaders.find((o) => o.class === entry.className);
    let kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = val[0];
    const arrayCopy = allReaderKwargs.filter((ob) => ob.kwargClass === val[0]);
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setReaderAllKwargs(arrayCopy);
  };

  const transformKwargCallback = (val) => {
    const entry = findComponent(TRANSFORMS, transform);
    if (!entry) return;
    let obj = allTransforms.find((o) => o.class === entry.className);
    let kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = val[0];
    const arrayCopy = allTransformKwargs.filter(
      (ob) => ob.kwargClass === val[0]
    );
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setTransformAllKwargs(arrayCopy);
  };

  const writerKwargCallback = (val) => {
    const entry = findComponent(WRITERS, writer);
    if (!entry) return;
    let obj = allWriters.find((o) => o.class === entry.className);
    let kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = val[0];
    const arrayCopy = allWriterKwargs.filter((ob) => ob.kwargClass === val[0]);
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setWriterAllKwargs(arrayCopy);
  };

  // --- dropdown change handlers ---

  const readerChange = (e) => setReader(e.target.innerHTML);
  const transformChange = (e) => setTransform(e.target.innerHTML);
  const writerChange = (e) => setWriter(e.target.innerHTML);

  // --- add handlers (use className from registry) ---

  const handleClickReader = () => {
    const entry = findComponent(READERS, reader);
    if (entry) {
      setAllReaders((arr) => [...arr, { class: entry.className }]);
    }
  };

  const handleClickTransform = () => {
    const entry = findComponent(TRANSFORMS, transform);
    if (entry) {
      setAllTransforms((arr) => [...arr, { class: entry.className }]);
    }
  };

  const handleClickWriter = () => {
    const entry = findComponent(WRITERS, writer);
    if (entry) {
      setAllWriters((arr) => [...arr, { class: entry.className }]);
    }
  };

  const generateJSONXML = async (e) => {
    e.preventDefault();
  };

  return (
    <div className='blue-container p-3 my-3 text-white border'>
      <div className='blue-container-text'>
        <form onSubmit={(e) => generateJSONXML(e)}>
          <div className='container'>
            <div className='row'>
              <div className='col-sm'>
                <ComponentSection
                  title='Readers'
                  registry={READERS}
                  selected={reader}
                  onSelect={readerChange}
                  allItems={allReaders}
                  onAdd={handleClickReader}
                  allKwargs={allReaderKwargs}
                  kwargCallback={readerKwargCallback}
                />

                <ComponentSection
                  title='Transforms'
                  registry={TRANSFORMS}
                  selected={transform}
                  onSelect={transformChange}
                  allItems={allTransforms}
                  onAdd={handleClickTransform}
                  allKwargs={allTransformKwargs}
                  kwargCallback={transformKwargCallback}
                />

                <ComponentSection
                  title='Writers'
                  registry={WRITERS}
                  selected={writer}
                  onSelect={writerChange}
                  allItems={allWriters}
                  onAdd={handleClickWriter}
                  allKwargs={allWriterKwargs}
                  kwargCallback={writerKwargCallback}
                />
              </div>

              <div className='col-sm'>
                <JSONYAMLOutput
                  readers={allReaders}
                  transforms={allTransforms}
                  writers={allWriters}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default YAML;
