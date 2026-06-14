import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ComponentSelector from '../ComponentSelector';
import COMPONENT_REGISTRY from '../../data/componentRegistry';

describe('ComponentSelector', () => {
  const mockOnAdd = jest.fn();
  const defaultProps = {
    sectionKey: 'readers',
    registry: COMPONENT_REGISTRY.readers,
    onAdd: mockOnAdd,
  };

  beforeEach(() => {
    mockOnAdd.mockClear();
  });

  it('renders correct placeholder text for readers', () => {
    const { getByText } = render(<ComponentSelector {...defaultProps} />);
    expect(getByText('Please Select a Reader')).toBeInTheDocument();
  });

  it('renders correct placeholder text for transforms', () => {
    const { getByText } = render(
      <ComponentSelector
        {...defaultProps}
        sectionKey='transforms'
        registry={COMPONENT_REGISTRY.transforms}
      />
    );
    expect(getByText('Please Select a Transform')).toBeInTheDocument();
  });

  it('renders correct placeholder text for writers', () => {
    const { getByText } = render(
      <ComponentSelector
        {...defaultProps}
        sectionKey='writers'
        registry={COMPONENT_REGISTRY.writers}
      />
    );
    expect(getByText('Please Select a Writer')).toBeInTheDocument();
  });

  it('Add button is disabled when no type is selected', () => {
    const { getByText } = render(<ComponentSelector {...defaultProps} />);
    const addBtn = getByText('Add');
    expect(addBtn).toBeDisabled();
  });

  it('selecting a type and clicking Add calls onAdd with correct args', () => {
    const { getByText } = render(<ComponentSelector {...defaultProps} />);
    // Open the dropdown
    fireEvent.click(getByText('Please Select a Reader'));
    // Select Serial Reader
    fireEvent.click(getByText('Serial Reader'));
    // Now the Add button should be enabled
    const addBtn = getByText('Add');
    expect(addBtn).not.toBeDisabled();
    fireEvent.click(addBtn);
    expect(mockOnAdd).toHaveBeenCalledWith('readers', 'SerialReader');
  });

  it('resets selection after Add is clicked', () => {
    const { getByText } = render(<ComponentSelector {...defaultProps} />);
    fireEvent.click(getByText('Please Select a Reader'));
    fireEvent.click(getByText('Serial Reader'));
    fireEvent.click(getByText('Add'));
    expect(getByText('Please Select a Reader')).toBeInTheDocument();
  });
});
