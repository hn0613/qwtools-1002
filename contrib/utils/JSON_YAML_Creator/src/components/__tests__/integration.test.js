import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('Integration: full workflow', () => {
  it('adds a reader and it appears in JSON output', () => {
    const { getByText, getByTestId } = render(<App />);
    // Open readers dropdown
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    // Click Add (first enabled one in the readers section)
    const addButtons = document.querySelectorAll('.addButton');
    fireEvent.click(addButtons[0]);
    // Verify JSON output contains SerialReader
    const jsonOutput = getByTestId('json-output');
    const parsed = JSON.parse(jsonOutput.textContent);
    expect(parsed.readers).toHaveLength(1);
    expect(parsed.readers[0].class).toBe('SerialReader');
  });

  it('adds kwargs to a reader and they appear in JSON', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(<App />);
    // Add a SerialReader
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.form-group > .addButton')[0]);

    // Open kwarg dropdown and add baudrate
    fireEvent.click(getByText('Select a kwarg'));
    fireEvent.click(getByText('baudrate'));
    const valueInput = getByPlaceholderText('Value');
    fireEvent.change(valueInput, { target: { value: '9600' } });
    // Click the kwarg Add button (inside .kwarg-add-row)
    fireEvent.click(document.querySelector('.kwarg-add-row .addButton'));

    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers[0].kwargs).toHaveProperty('baudrate', '9600');
  });

  it('modifies a kwarg value and JSON updates', () => {
    const { getByText, getByTestId, getByPlaceholderText, getByLabelText } = render(<App />);
    // Add SerialReader
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.form-group > .addButton')[0]);

    // Add kwarg
    fireEvent.click(getByText('Select a kwarg'));
    fireEvent.click(getByText('baudrate'));
    fireEvent.change(getByPlaceholderText('Value'), { target: { value: '9600' } });
    fireEvent.click(document.querySelector('.kwarg-add-row .addButton'));

    // Modify the kwarg value
    const baudrateInput = getByLabelText('baudrate value');
    fireEvent.change(baudrateInput, { target: { value: '4800' } });

    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers[0].kwargs.baudrate).toBe('4800');
  });

  it('deletes a component and JSON updates', () => {
    const { getByText, getByTestId, getByLabelText } = render(<App />);
    // Add SerialReader
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.addButton')[0]);

    // Verify it exists
    let parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers).toHaveLength(1);

    // Delete it
    fireEvent.click(getByLabelText('Delete component'));

    parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers).toHaveLength(0);
  });

  it('reorders components and JSON reflects new order', () => {
    const { getByText, getByTestId, getAllByLabelText } = render(<App />);
    // Add two readers
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.addButton')[0]);

    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('UDP Reader'));
    fireEvent.click(document.querySelectorAll('.addButton')[0]);

    // Verify initial order
    let parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers[0].class).toBe('SerialReader');
    expect(parsed.readers[1].class).toBe('UDPReader');

    // Move second item up
    const moveUpButtons = getAllByLabelText('Move up');
    fireEvent.click(moveUpButtons[1]); // second move-up button

    parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers[0].class).toBe('UDPReader');
    expect(parsed.readers[1].class).toBe('SerialReader');
  });

  it('handles duplicate types with independent kwargs', () => {
    const { getByText, getByTestId, getAllByText, getByPlaceholderText } = render(<App />);
    // Add two SerialReaders
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.addButton')[0]);

    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(document.querySelectorAll('.addButton')[0]);

    // Add kwarg to first one
    const kwargDropdowns = getAllByText('Select a kwarg');
    fireEvent.click(kwargDropdowns[0]);
    // Find first baudrate option
    const baudrateOptions = getAllByText('baudrate');
    fireEvent.click(baudrateOptions[0]);
    const valueInputs = document.querySelectorAll('.kwarg-add-row input[type="text"]');
    fireEvent.change(valueInputs[0], { target: { value: '9600' } });
    const kwargAddBtns = document.querySelectorAll('.kwarg-add-row .addButton');
    fireEvent.click(kwargAddBtns[0]);

    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers).toHaveLength(2);
    expect(parsed.readers[0].kwargs).toHaveProperty('baudrate', '9600');
    // Second reader should have no kwargs
    expect(parsed.readers[1]).toEqual({ class: 'SerialReader' });
  });

  it('complete workflow: reader + transform + writer', () => {
    const { getByText, getByTestId } = render(<App />);
    // Section-level Add buttons are always inside .form-group
    const sectionAddBtns = () => document.querySelectorAll('.form-group > .addButton');

    // Add a reader
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(sectionAddBtns()[0]);

    // Add a transform
    fireEvent.click(getByText('Please Select a Transform'));
    fireEvent.click(getByText('Timestamp Transform'));
    fireEvent.click(sectionAddBtns()[1]);

    // Add a writer
    fireEvent.click(getByText('Please Select a Writer'));
    fireEvent.click(getByText('UDP Writer'));
    fireEvent.click(sectionAddBtns()[2]);

    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers).toHaveLength(1);
    expect(parsed.readers[0].class).toBe('SerialReader');
    expect(parsed.transforms).toHaveLength(1);
    expect(parsed.transforms[0].class).toBe('TimestampTransform');
    expect(parsed.writers).toHaveLength(1);
    expect(parsed.writers[0].class).toBe('UDPWriter');
  });
});
