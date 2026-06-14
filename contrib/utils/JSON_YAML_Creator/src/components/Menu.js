import React, { useState } from 'react';
import '../App.css';
import './index.css';
import { Dropdown, Button } from 'react-bootstrap';
import JSONYAMLOutput from './JSONYAMLOutput';
import KWArgs from './KWArgs';
import { readers, transforms, writers } from '../constants/componentCatalog';

/**
 * Look up the Python class name for a given dropdown label.
 * Falls back to stripping whitespace if no catalog match is found.
 */
function getClassName(catalog, label) {
  const entry = catalog.find((e) => e.label === label);
  return entry ? entry.className : label.replace(/\s/g, '');
}

/**
 * Look up the parameter list for a given Python class name.
 */
function getParams(catalog, className) {
  const entry = catalog.find((e) => e.className === className);
  return entry ? entry.params : [];
}

function YAML() {
  // Currently selected label in each dropdown
  const [reader, setReader] = useState('');
  const [transform, setTransform] = useState('');
  const [writer, setWriter] = useState('');

  // Arrays of added components: [{ class: 'ClassName', kwargs: [...] }, ...]
  const [allReaders, setAllReaders] = useState([]);
  const [allTransforms, setAllTransforms] = useState([]);
  const [allWriters, setAllWriters] = useState([]);

  // Kwarg tracking arrays (used for re-render triggers)
  const [allReaderKwargs, setReaderAllKwargs] = useState([]);
  const [allTransformKwargs, setTransformAllKwargs] = useState([]);
  const [allWriterKwargs, setWriterAllKwargs] = useState([]);

  // ─── Callbacks for adding kwargs ──────────────────────────────────────────

  const readerKwargCallback = (val) => {
    const className = val[0];
    const obj = allReaders.find((o) => o.class === className);
    if (!obj) return;
    const kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = className;
    const arrayCopy = allReaderKwargs.filter((ob) => ob.kwargClass === className);
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setReaderAllKwargs([...arrayCopy]);
  };

  const transformKwargCallback = (val) => {
    const className = val[0];
    const obj = allTransforms.find((o) => o.class === className);
    if (!obj) return;
    const kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = className;
    const arrayCopy = allTransformKwargs.filter((ob) => ob.kwargClass === className);
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setTransformAllKwargs([...arrayCopy]);
  };

  const writerKwargCallback = (val) => {
    const className = val[0];
    const obj = allWriters.find((o) => o.class === className);
    if (!obj) return;
    const kw = {};
    kw[val[1]] = val[2];
    kw.kwargClass = className;
    const arrayCopy = allWriterKwargs.filter((ob) => ob.kwargClass === className);
    arrayCopy.push(kw);
    obj.kwargs = arrayCopy;
    setWriterAllKwargs([...arrayCopy]);
  };

  // ─── Dropdown change handlers ─────────────────────────────────────────────

  const readerChange = (e) => setReader(e.target.innerHTML);
  const transformChange = (e) => setTransform(e.target.innerHTML);
  const writerChange = (e) => setWriter(e.target.innerHTML);

  // ─── Add button handlers ──────────────────────────────────────────────────

  const handleClickReader = () => {
    if (!reader) return;
    const className = getClassName(readers, reader);
    setAllReaders((arr) => [...arr, { class: className, kwargs: [] }]);
  };

  const handleClickTransform = () => {
    if (!transform) return;
    const className = getClassName(transforms, transform);
    setAllTransforms((arr) => [...arr, { class: className, kwargs: [] }]);
  };

  const handleClickWriter = () => {
    if (!writer) return;
    const className = getClassName(writers, writer);
    setAllWriters((arr) => [...arr, { class: className, kwargs: [] }]);
  };

  // ─── Helper: render a dropdown section ────────────────────────────────────

  const renderDropdown = (catalog, selectedLabel, changeHandler, placeholder) => (
    <Dropdown>
      <Dropdown.Toggle variant='success' id='dropdown-basic'>
        {selectedLabel || placeholder}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {catalog.map((entry) => (
          <Dropdown.Item
            href={`#/${entry.className}`}
            onClick={changeHandler}
            key={entry.className}
          >
            {entry.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  // ─── Helper: render KWArgs panel for a selected component ─────────────────

  const renderKwargsPanel = (
    catalog,
    addedItems,
    selectedLabel,
    callback,
    categoryKwargs,
  ) => {
    const className = getClassName(catalog, selectedLabel);
    const params = getParams(catalog, className);
    const isSelected = !!selectedLabel;
    const isAdded = addedItems.some((e) => e.class === className);

    if (!isSelected || !isAdded) return null;

    return (
      <KWArgs
        kwargCallback={callback}
        items={params}
        kwClass={className}
      />
    );
  };

  // Suppress unused form submit — the Add buttons handle component creation
  const generateJSONXML = (e) => e.preventDefault();

  const divStyle = { display: 'flex', alignItems: 'center' };

  return (
    <div className='blue-container p-3 my-3 text-white border'>
      <div className='blue-container-text'>
        <form onSubmit={generateJSONXML}>
          <div className='container'>
            <div className='row'>
              <div className='col-sm'>
                {/* ─── Readers Section ──────────────────────────────── */}
                <h1 style={divStyle}>Readers</h1>
                <div className='form-group' id='reader' style={divStyle}>
                  {renderDropdown(readers, reader, readerChange, 'Please Select a Reader')}
                  <Button
                    className='addButton'
                    variant='outline-primary'
                    onClick={handleClickReader}
                  >
                    Add
                  </Button>{' '}
                </div>
                {renderKwargsPanel(
                  readers, allReaders, reader, readerKwargCallback, allReaderKwargs,
                )}

                {/* ─── Transforms Section ───────────────────────────── */}
                <h1 style={divStyle}>Transforms</h1>
                <div className='form-group' style={divStyle}>
                  {renderDropdown(transforms, transform, transformChange, 'Please Select a Transform')}
                  <Button
                    className='addButton'
                    variant='outline-primary'
                    onClick={handleClickTransform}
                  >
                    Add
                  </Button>{' '}
                </div>
                {renderKwargsPanel(
                  transforms, allTransforms, transform, transformKwargCallback, allTransformKwargs,
                )}

                {/* ─── Writers Section ──────────────────────────────── */}
                <h1 style={divStyle}>Writers</h1>
                <div className='form-group' style={divStyle}>
                  {renderDropdown(writers, writer, writerChange, 'Please Select a Writer')}
                  <Button
                    className='addButton'
                    variant='outline-primary'
                    onClick={handleClickWriter}
                  >
                    Add
                  </Button>{' '}
                </div>
                {renderKwargsPanel(
                  writers, allWriters, writer, writerKwargCallback, allWriterKwargs,
                )}
              </div>

              {/* ─── Output Preview ─────────────────────────────────── */}
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
