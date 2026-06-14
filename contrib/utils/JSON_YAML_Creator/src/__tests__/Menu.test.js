import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';
import { readers, transforms, writers } from '../constants/componentCatalog';

/**
 * Helper: open a dropdown by clicking its toggle button,
 * then return all visible dropdown items.
 */
function openDropdown(getByText, toggleText) {
  const toggle = getByText(toggleText);
  fireEvent.click(toggle);
}

/**
 * Helper: find all Add buttons (there are 3: readers, transforms, writers)
 */
function getAddButtons(container) {
  return container.querySelectorAll('button.addButton');
}

describe('Menu — Catalog-Driven Rendering', () => {
  test('renders three dropdown toggles with correct placeholder text', () => {
    const { getByText } = render(<App />);
    expect(getByText('Please Select a Reader')).toBeInTheDocument();
    expect(getByText('Please Select a Transform')).toBeInTheDocument();
    expect(getByText('Please Select a Writer')).toBeInTheDocument();
  });

  test('renders three Add buttons', () => {
    const { container } = render(<App />);
    expect(getAddButtons(container).length).toBe(3);
  });

  test('reader dropdown contains all catalog reader labels', () => {
    const { getByText } = render(<App />);
    openDropdown(getByText, 'Please Select a Reader');
    readers.forEach((entry) => {
      expect(getByText(entry.label)).toBeInTheDocument();
    });
  });

  test('transform dropdown contains all catalog transform labels', () => {
    const { getByText } = render(<App />);
    openDropdown(getByText, 'Please Select a Transform');
    transforms.forEach((entry) => {
      expect(getByText(entry.label)).toBeInTheDocument();
    });
  });

  test('writer dropdown contains all catalog writer labels', () => {
    const { getByText } = render(<App />);
    openDropdown(getByText, 'Please Select a Writer');
    writers.forEach((entry) => {
      expect(getByText(entry.label)).toBeInTheDocument();
    });
  });

  test('deprecated NetworkReader is not in the reader dropdown', () => {
    const { queryByText } = render(<App />);
    openDropdown(queryByText, 'Please Select a Reader');
    expect(queryByText('Network Reader')).toBeNull();
  });

  test('deprecated NetworkWriter is not in the writer dropdown', () => {
    const { queryByText, getByText } = render(<App />);
    openDropdown(getByText, 'Please Select a Writer');
    expect(queryByText('Network Writer')).toBeNull();
  });
});

describe('Menu — Add Flow and Output Consistency', () => {
  test('adding a reader shows the correct class name in JSON output', () => {
    const { getByText, container } = render(<App />);

    // Open reader dropdown and select "Serial Reader"
    openDropdown(getByText, 'Please Select a Reader');
    fireEvent.click(getByText('Serial Reader'));

    // Click the reader Add button (first one)
    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[0]);

    // Check JSON output contains SerialReader
    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).toContain('SerialReader');
  });

  test('From JSON Transform outputs FromJSONTransform (all-caps JSON)', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Transform');
    fireEvent.click(getByText('From JSON Transform'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[1]); // second Add = transforms

    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).toContain('FromJSONTransform');
  });

  test('InfluxDB Writer outputs InfluxDBWriter (capital DB)', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Writer');
    fireEvent.click(getByText('InfluxDB Writer'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[2]); // third Add = writers

    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).toContain('InfluxDBWriter');
  });

  test('output JSON does not contain kwargClass key', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Reader');
    fireEvent.click(getByText('Redis Reader'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[0]);

    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).not.toContain('kwargClass');
    expect(jsonOutput.textContent).toContain('RedisReader');
  });

  test('component with no params still appears in output', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Transform');
    fireEvent.click(getByText('Count Transform'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[1]);

    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).toContain('CountTransform');
  });

  test('XML Aggregator Transform outputs XMLAggregatorTransform', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Transform');
    fireEvent.click(getByText('XML Aggregator Transform'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[1]);

    const jsonOutput = container.querySelector('pre');
    expect(jsonOutput.textContent).toContain('XMLAggregatorTransform');
  });

  test('adding a reader shows Kwargs panel with correct params', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Reader');
    fireEvent.click(getByText('Serial Reader'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[0]);

    // After adding, a Kwargs section should appear
    expect(getByText('Kwargs')).toBeInTheDocument();

    // Open the parameter dropdown to see available params
    fireEvent.click(getByText('Please Select a Parameter'));

    // "port" and "baudrate" are SerialReader params
    expect(getByText('port')).toBeInTheDocument();
    expect(getByText('baudrate')).toBeInTheDocument();
  });

  test('YAML output section contains correct data', () => {
    const { getByText, container } = render(<App />);

    openDropdown(getByText, 'Please Select a Writer');
    fireEvent.click(getByText('UDP Writer'));

    const addButtons = getAddButtons(container);
    fireEvent.click(addButtons[2]);

    // There are two <pre> blocks: JSON and YAML
    const preBlocks = container.querySelectorAll('pre');
    expect(preBlocks.length).toBe(2);

    // Both should contain UDPWriter
    expect(preBlocks[0].textContent).toContain('UDPWriter');
    expect(preBlocks[1].textContent).toContain('UDPWriter');
  });
});
