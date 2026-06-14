import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';
import { READERS, TRANSFORMS, WRITERS } from './componentRegistry';

// ---------------------------------------------------------------------------
// 1. App smoke test
// ---------------------------------------------------------------------------

test('renders the application title', () => {
  const { getByText } = render(<App />);
  expect(getByText(/YAML\/JSON Creator/i)).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 2. Component registry integrity
// ---------------------------------------------------------------------------

describe('componentRegistry', () => {
  const ALL_ENTRIES = [
    ...READERS.map((r) => ({ ...r, _type: 'reader' })),
    ...TRANSFORMS.map((t) => ({ ...t, _type: 'transform' })),
    ...WRITERS.map((w) => ({ ...w, _type: 'writer' })),
  ];

  test('every entry has className, displayName, and kwargs', () => {
    ALL_ENTRIES.forEach((entry) => {
      expect(entry).toHaveProperty('className');
      expect(entry).toHaveProperty('displayName');
      expect(entry).toHaveProperty('kwargs');
      expect(typeof entry.className).toBe('string');
      expect(typeof entry.displayName).toBe('string');
      expect(Array.isArray(entry.kwargs)).toBe(true);
    });
  });

  test('classNames are unique across all registries', () => {
    const names = ALL_ENTRIES.map((e) => e.className);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  test('displayName with spaces removed equals className', () => {
    ALL_ENTRIES.forEach((entry) => {
      expect(entry.displayName.replace(/\s/g, '')).toBe(entry.className);
    });
  });

  test('kwargs entries are all strings', () => {
    ALL_ENTRIES.forEach((entry) => {
      entry.kwargs.forEach((kw) => {
        expect(typeof kw).toBe('string');
      });
    });
  });

  test('readers registry is non-empty', () => {
    expect(READERS.length).toBeGreaterThan(0);
  });

  test('transforms registry is non-empty', () => {
    expect(TRANSFORMS.length).toBeGreaterThan(0);
  });

  test('writers registry is non-empty', () => {
    expect(WRITERS.length).toBeGreaterThan(0);
  });

  test('deprecated components are excluded', () => {
    const allNames = ALL_ENTRIES.map((e) => e.className);
    expect(allNames).not.toContain('NetworkReader');
    expect(allNames).not.toContain('NetworkWriter');
    expect(allNames).not.toContain('SubsampleTransform');
  });
});

// ---------------------------------------------------------------------------
// 3. Menu section rendering
// ---------------------------------------------------------------------------

describe('Menu sections', () => {
  test('renders Readers, Transforms, and Writers headings', () => {
    const { getByText } = render(<App />);
    expect(getByText('Readers')).toBeInTheDocument();
    expect(getByText('Transforms')).toBeInTheDocument();
    expect(getByText('Writers')).toBeInTheDocument();
  });

  test('renders default dropdown placeholders', () => {
    const { getByText } = render(<App />);
    expect(getByText('Please Select a Reader')).toBeInTheDocument();
    expect(getByText('Please Select a Transform')).toBeInTheDocument();
    expect(getByText('Please Select a Writer')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 4. Output area rendering
// ---------------------------------------------------------------------------

describe('JSON/YAML output', () => {
  test('renders empty output structure on initial load', () => {
    const { getByText } = render(<App />);
    expect(getByText('Copy JSON')).toBeInTheDocument();
    expect(getByText('Copy YAML')).toBeInTheDocument();
  });
});
