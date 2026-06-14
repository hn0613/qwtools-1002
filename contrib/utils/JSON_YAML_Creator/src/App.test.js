import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders application title', () => {
  const { getByText } = render(<App />);
  expect(getByText(/YAML\/JSON Creator/i)).toBeInTheDocument();
});

test('renders all three section headings', () => {
  const { getByText } = render(<App />);
  expect(getByText('Readers')).toBeInTheDocument();
  expect(getByText('Transforms')).toBeInTheDocument();
  expect(getByText('Writers')).toBeInTheDocument();
});
