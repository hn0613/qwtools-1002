import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

/**
 * Helper: open a section's dropdown and select an item by display name.
 */
function selectFromDropdown(getByTestId, sectionTitle, displayName) {
  const toggle = getByTestId(`${sectionTitle}-dropdown-toggle`);
  fireEvent.click(toggle);
  const items = document.querySelectorAll('[data-testid="dropdown-item"]');
  const target = Array.from(items).find(
    (el) => el.textContent.trim() === displayName
  );
  expect(target).toBeTruthy();
  fireEvent.click(target);
}

/**
 * Helper: click the Add button for a section.
 */
function clickAdd(getByTestId, sectionTitle) {
  fireEvent.click(getByTestId(`${sectionTitle}-add-button`));
}

/**
 * Helper: add a kwarg to a specific card (by card index, 0-based).
 * Returns nothing — asserts internally.
 */
function addKwargToCard(container, cardIndex, kwargName, value) {
  const cards = container.querySelectorAll('[data-testid="component-card"]');
  const card = cards[cardIndex];
  expect(card).toBeTruthy();

  // Click the kwarg dropdown toggle within this card
  const toggle = card.querySelector('[class*="dropdown-toggle"]');
  fireEvent.click(toggle);

  // Find and click the kwarg item
  const kwargItems = card.querySelectorAll(
    '[data-testid="kwarg-dropdown-item"]'
  );
  const target = Array.from(kwargItems).find(
    (el) => el.textContent.trim() === kwargName
  );
  expect(target).toBeTruthy();
  fireEvent.click(target);

  // Fill in value
  const valueInput = card.querySelector('input[placeholder="Value"]');
  fireEvent.change(valueInput, { target: { value } });

  // Click Add button within the card's kwarg form
  const addButtons = card.querySelectorAll('[data-testid$="-kwarg-add-button"]');
  fireEvent.click(addButtons[0]);
}

describe('JSON/YAML Creator Integration', () => {
  it('renders three sections and a preview panel', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('section-readers')).toBeInTheDocument();
    expect(getByTestId('section-transforms')).toBeInTheDocument();
    expect(getByTestId('section-writers')).toBeInTheDocument();
    expect(getByTestId('json-yaml-output')).toBeInTheDocument();
  });

  it('initial preview shows empty arrays', () => {
    const { getByTestId } = render(<App />);
    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed).toEqual({ readers: [], transforms: [], writers: [] });
  });

  it('add a reader and see it in the preview', () => {
    const { getByTestId, getAllByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    const cards = getAllByTestId('component-card');
    expect(cards).toHaveLength(1);
    expect(getByTestId('component-name')).toHaveTextContent('Serial Reader');

    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers).toHaveLength(1);
    expect(parsed.readers[0].class).toBe('SerialReader');
  });

  it('add kwarg to a component and see it in preview', () => {
    const { container, getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    addKwargToCard(container, 0, 'baudrate', '9600');

    // Kwargs table should show the kwarg name; value lives in the input
    const card = container.querySelector('[data-testid="component-card"]');
    const table = card.querySelector('[data-testid="kwargs-table"]');
    expect(table).toBeInTheDocument();
    expect(table.textContent).toContain('baudrate');
    const editInput = card.querySelector('[data-testid="kwarg-edit-input"]');
    expect(editInput.value).toBe('9600');

    // Preview should include the kwarg
    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0].kwargs).toEqual([{ baudrate: '9600' }]);
  });

  it('add multiple kwargs to one component', () => {
    const { container, getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    addKwargToCard(container, 0, 'baudrate', '9600');
    addKwargToCard(container, 0, 'port', '/dev/ttyUSB0');

    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0].kwargs).toEqual([
      { baudrate: '9600' },
      { port: '/dev/ttyUSB0' },
    ]);
  });

  it('duplicate components get separate cards with independent kwargs', () => {
    const { container, getByTestId, getAllByTestId } = render(<App />);

    // Add two Serial Readers
    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');
    clickAdd(getByTestId, 'readers');

    const cards = getAllByTestId('component-card');
    expect(cards).toHaveLength(2);

    // Add kwarg to the FIRST card only
    addKwargToCard(container, 0, 'baudrate', '9600');

    // Preview should show two readers, first with kwargs, second without
    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers).toHaveLength(2);
    expect(parsed.readers[0].kwargs).toEqual([{ baudrate: '9600' }]);
    expect(parsed.readers[1]).toEqual({ class: 'SerialReader' });
  });

  it('edit a kwarg value and see preview update', () => {
    const { container, getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');
    addKwargToCard(container, 0, 'baudrate', '9600');

    // Find the edit input within the card
    const card = container.querySelector('[data-testid="component-card"]');
    const editInput = card.querySelector('[data-testid="kwarg-edit-input"]');

    // Change value and blur
    fireEvent.change(editInput, { target: { value: '115200' } });
    fireEvent.blur(editInput);

    // Preview should show updated value
    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0].kwargs).toEqual([{ baudrate: '115200' }]);
  });

  it('delete a kwarg and see preview update', () => {
    const { container, getByTestId, queryByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');
    addKwargToCard(container, 0, 'baudrate', '9600');

    // Verify kwarg is there
    const card = container.querySelector('[data-testid="component-card"]');
    expect(card.querySelector('[data-testid="kwargs-table"]')).toBeTruthy();

    // Delete the kwarg
    const deleteBtn = card.querySelector(
      '[data-testid="delete-kwarg-button"]'
    );
    fireEvent.click(deleteBtn);

    // Table should be gone (no kwargs left)
    expect(card.querySelector('[data-testid="kwargs-table"]')).toBeNull();

    // Preview should not have kwargs
    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0]).toEqual({ class: 'SerialReader' });
  });

  it('delete a component and see preview update', () => {
    const { getByTestId, queryAllByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');
    clickAdd(getByTestId, 'readers');

    expect(queryAllByTestId('component-card')).toHaveLength(2);

    // Delete the first component
    const deleteButtons = document.querySelectorAll(
      '[data-testid="delete-component-button"]'
    );
    fireEvent.click(deleteButtons[0]);

    expect(queryAllByTestId('component-card')).toHaveLength(1);

    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers).toHaveLength(1);
  });

  it('reorder components and see preview reflect new order', () => {
    const { getByTestId, getAllByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    selectFromDropdown(getByTestId, 'readers', 'UDP Reader');
    clickAdd(getByTestId, 'readers');

    // Verify initial order
    let preview = getByTestId('json-preview');
    let parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0].class).toBe('SerialReader');
    expect(parsed.readers[1].class).toBe('UDPReader');

    // Move first component (Serial Reader) down
    const moveDownButtons = getAllByTestId('move-down-button');
    fireEvent.click(moveDownButtons[0]);

    // Preview should show new order
    preview = getByTestId('json-preview');
    parsed = JSON.parse(preview.textContent);
    expect(parsed.readers[0].class).toBe('UDPReader');
    expect(parsed.readers[1].class).toBe('SerialReader');
  });

  it('move up/down buttons are disabled at boundaries', () => {
    const { getByTestId, getAllByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    const moveUp = getAllByTestId('move-up-button');
    const moveDown = getAllByTestId('move-down-button');

    expect(moveUp[0]).toBeDisabled();
    expect(moveDown[0]).toBeDisabled();
  });

  it('clicking Add without dropdown selection does nothing', () => {
    const { getByTestId, queryAllByTestId } = render(<App />);

    clickAdd(getByTestId, 'readers');

    expect(queryAllByTestId('component-card')).toHaveLength(0);
  });

  it('clicking Add kwarg with empty value does nothing', () => {
    const { container, getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    const card = container.querySelector('[data-testid="component-card"]');

    // Select a kwarg but leave value empty
    const toggle = card.querySelector('[class*="dropdown-toggle"]');
    fireEvent.click(toggle);

    const kwargItems = card.querySelectorAll(
      '[data-testid="kwarg-dropdown-item"]'
    );
    fireEvent.click(
      Array.from(kwargItems).find(
        (el) => el.textContent.trim() === 'baudrate'
      )
    );

    // Don't fill in value — click Add with empty value
    const addButtons = card.querySelectorAll(
      '[data-testid$="-kwarg-add-button"]'
    );
    fireEvent.click(addButtons[0]);

    // No kwargs table should appear
    expect(card.querySelector('[data-testid="kwargs-table"]')).toBeNull();
  });

  it('adding components to different sections works independently', () => {
    const { getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    selectFromDropdown(getByTestId, 'transforms', 'Prefix Transform');
    clickAdd(getByTestId, 'transforms');

    selectFromDropdown(getByTestId, 'writers', 'UDP Writer');
    clickAdd(getByTestId, 'writers');

    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed.readers).toHaveLength(1);
    expect(parsed.transforms).toHaveLength(1);
    expect(parsed.writers).toHaveLength(1);
    expect(parsed.readers[0].class).toBe('SerialReader');
    expect(parsed.transforms[0].class).toBe('PrefixTransform');
    expect(parsed.writers[0].class).toBe('UDPWriter');
  });

  it('YAML preview is in sync with JSON preview', () => {
    const { getByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    const jsonPreview = getByTestId('json-preview');
    const yamlPreview = getByTestId('yaml-preview');

    const parsedJson = JSON.parse(jsonPreview.textContent);
    expect(parsedJson.readers).toHaveLength(1);
    expect(yamlPreview.textContent).toContain('SerialReader');
  });

  it('deleting all components shows empty preview', () => {
    const { getByTestId, queryAllByTestId } = render(<App />);

    selectFromDropdown(getByTestId, 'readers', 'Serial Reader');
    clickAdd(getByTestId, 'readers');

    fireEvent.click(getByTestId('delete-component-button'));

    expect(queryAllByTestId('component-card')).toHaveLength(0);

    const preview = getByTestId('json-preview');
    const parsed = JSON.parse(preview.textContent);
    expect(parsed).toEqual({ readers: [], transforms: [], writers: [] });
  });
});
