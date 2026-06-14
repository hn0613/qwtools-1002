import React, { useState } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { WRITERS } from '../componentRegistry';

// Build the list of writers available inside a ComposedWriter (exclude itself).
const subWriters = WRITERS
  .filter((w) => w.className !== 'ComposedWriter')
  .map((w) => w.displayName);

// Composed Writer requires a component on its own because it requires an
// option to add writers inside a writer.
export default function ComposedWriter(props) {
  const [kwargs, setKwargs] = useState('');
  // for transform and check_format
  const [value, setValue] = useState('');

  const [extraWriter, setExtraWriter] = useState('');

  const extraWriterChange = (e) => {
    setExtraWriter(e.target.innerHTML);
  };

  const kwargsChange = (e) => {
    setKwargs(e.target.innerHTML);
  };

  const divStyle = {
    display: 'flex',
    alignItems: 'center',
  };
  const handleTextChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <h1 style={divStyle}>Kwargs</h1>
      <div className='container'>
        <div className='row' id='reader' style={divStyle}>
          <Dropdown>
            <Dropdown.Toggle variant='success' id='dropdown-basic'>
              {kwargs.length > 0 ? kwargs : 'Please Select a Kwarg'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {props.items.map((item) => (
                <Dropdown.Item key={item} onClick={kwargsChange}>{item}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <div>
            {kwargs === 'transforms' ? (
              <input
                type='text'
                placeholder='Value'
                onChange={handleTextChange}
              />
            ) : null}

            {kwargs !== 'writers' ? (
              <Button
                className='addButton'
                variant='outline-primary'
                onClick={() => {
                  let arr = [props.kwClass, kwargs, value];
                  props.kwargCallback(arr);
                }}
              >
                Add
              </Button>
            ) : null}
          </div>
          <div className='col-xl'>
            {kwargs === 'writers' ? (
              <div className='form-group' id='reader' style={divStyle}>
                <Dropdown>
                  <Dropdown.Toggle variant='success' id='dropdown-basic'>
                    {extraWriter.length > 0
                      ? extraWriter
                      : 'Please Select a Writer'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {subWriters.map((item) => (
                      <Dropdown.Item key={item} onClick={extraWriterChange}>
                        {item}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Button
                  className='addButton'
                  variant='outline-primary'
                  onClick={() => {
                    let arr = [props.kwClass, kwargs, value, extraWriter];
                    props.kwargCallback(arr);
                  }}
                >
                  Add
                </Button>{' '}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
