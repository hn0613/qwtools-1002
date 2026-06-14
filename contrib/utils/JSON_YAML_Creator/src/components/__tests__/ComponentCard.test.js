import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ComponentCard from '../ComponentCard';

describe('ComponentCard', () => {
  const mockItem = {
    id: 'r_1',
    class: 'SerialReader',
    kwargs: { baudrate: '9600', port: '/dev/ttyUSB0' },
  };

  const mockOnUpdateKwarg = jest.fn();
  const mockOnRemoveKwarg = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnMove = jest.fn();

  const defaultProps = {
    item: mockItem,
    sectionKey: 'readers',
    onUpdateKwarg: mockOnUpdateKwarg,
    onRemoveKwarg: mockOnRemoveKwarg,
    onRemove: mockOnRemove,
    onMove: mockOnMove,
    isFirst: false,
    isLast: false,
    instanceLabel: 'SerialReader',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the instance label in the header', () => {
    const { getByText } = render(<ComponentCard {...defaultProps} />);
    expect(getByText('SerialReader')).toBeInTheDocument();
  });

  it('renders existing kwargs as input fields', () => {
    const { getByLabelText } = render(<ComponentCard {...defaultProps} />);
    const baudrateInput = getByLabelText('baudrate value');
    expect(baudrateInput.value).toBe('9600');
    const portInput = getByLabelText('port value');
    expect(portInput.value).toBe('/dev/ttyUSB0');
  });

  it('changing a kwarg input fires onUpdateKwarg', () => {
    const { getByLabelText } = render(<ComponentCard {...defaultProps} />);
    const baudrateInput = getByLabelText('baudrate value');
    fireEvent.change(baudrateInput, { target: { value: '4800' } });
    expect(mockOnUpdateKwarg).toHaveBeenCalledWith('readers', 'r_1', 'baudrate', '4800');
  });

  it('clicking kwarg delete fires onRemoveKwarg', () => {
    const { getByLabelText } = render(<ComponentCard {...defaultProps} />);
    fireEvent.click(getByLabelText('Delete baudrate'));
    expect(mockOnRemoveKwarg).toHaveBeenCalledWith('readers', 'r_1', 'baudrate');
  });

  it('Move up button is disabled when isFirst', () => {
    const { getByLabelText } = render(
      <ComponentCard {...defaultProps} isFirst={true} />
    );
    expect(getByLabelText('Move up')).toBeDisabled();
  });

  it('Move down button is disabled when isLast', () => {
    const { getByLabelText } = render(
      <ComponentCard {...defaultProps} isLast={true} />
    );
    expect(getByLabelText('Move down')).toBeDisabled();
  });

  it('clicking Move up calls onMove with up direction', () => {
    const { getByLabelText } = render(<ComponentCard {...defaultProps} />);
    fireEvent.click(getByLabelText('Move up'));
    expect(mockOnMove).toHaveBeenCalledWith('readers', 'r_1', 'up');
  });

  it('clicking Delete calls onRemove', () => {
    const { getByLabelText } = render(<ComponentCard {...defaultProps} />);
    fireEvent.click(getByLabelText('Delete component'));
    expect(mockOnRemove).toHaveBeenCalledWith('readers', 'r_1');
  });
});
