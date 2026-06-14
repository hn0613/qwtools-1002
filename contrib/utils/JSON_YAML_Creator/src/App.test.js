import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders the YAML/JSON Creator heading', () => {
  const { getByText } = render(<App />);
  expect(getByText(/YAML\/JSON Creator/i)).toBeInTheDocument();
});

test('renders Readers, Transforms, and Writers section headings', () => {
  const { getAllByText } = render(<App />);
  expect(getAllByText(/Readers/i).length).toBeGreaterThan(0);
  expect(getAllByText(/Transforms/i).length).toBeGreaterThan(0);
  expect(getAllByText(/Writers/i).length).toBeGreaterThan(0);
});

test('renders Copy JSON and Copy YAML buttons', () => {
  const { getByText } = render(<App />);
  expect(getByText('Copy JSON')).toBeInTheDocument();
  expect(getByText('Copy YAML')).toBeInTheDocument();
});
