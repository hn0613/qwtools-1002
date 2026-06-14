import React from 'react';
import { render } from '@testing-library/react';
import OutputPanel from '../OutputPanel';

describe('OutputPanel', () => {
  const sampleData = {
    readers: [
      { class: 'SerialReader', kwargs: { baudrate: '9600', port: '/dev/ttyUSB0' } },
    ],
    transforms: [
      { class: 'TimestampTransform', kwargs: {} },
    ],
    writers: [
      { class: 'UDPWriter', kwargs: { port: '6224' } },
    ],
  };

  it('renders valid JSON with three-section structure', () => {
    const { getByTestId } = render(<OutputPanel data={sampleData} />);
    const jsonOutput = getByTestId('json-output');
    const parsed = JSON.parse(jsonOutput.textContent);
    expect(parsed).toHaveProperty('readers');
    expect(parsed).toHaveProperty('transforms');
    expect(parsed).toHaveProperty('writers');
  });

  it('renders kwargs as flat objects', () => {
    const { getByTestId } = render(<OutputPanel data={sampleData} />);
    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.readers[0].kwargs).toEqual({ baudrate: '9600', port: '/dev/ttyUSB0' });
  });

  it('omits kwargs key when kwargs is empty', () => {
    const { getByTestId } = render(<OutputPanel data={sampleData} />);
    const parsed = JSON.parse(getByTestId('json-output').textContent);
    expect(parsed.transforms[0]).toEqual({ class: 'TimestampTransform' });
    expect(parsed.transforms[0]).not.toHaveProperty('kwargs');
  });

  it('does not contain id or kwargClass fields', () => {
    const dataWithId = {
      readers: [{ class: 'SerialReader', kwargs: { baudrate: '9600' } }],
      transforms: [],
      writers: [],
    };
    const { getByTestId } = render(<OutputPanel data={dataWithId} />);
    const jsonText = getByTestId('json-output').textContent;
    expect(jsonText).not.toContain('"id"');
    expect(jsonText).not.toContain('"kwargClass"');
  });

  it('renders YAML output', () => {
    const { getByTestId } = render(<OutputPanel data={sampleData} />);
    const yamlOutput = getByTestId('yaml-output');
    expect(yamlOutput.textContent).toContain('SerialReader');
    expect(yamlOutput.textContent.length).toBeGreaterThan(0);
  });

  it('renders both Copy buttons', () => {
    const { getByText } = render(<OutputPanel data={sampleData} />);
    expect(getByText('Copy JSON')).toBeInTheDocument();
    expect(getByText('Copy YAML')).toBeInTheDocument();
  });
});
