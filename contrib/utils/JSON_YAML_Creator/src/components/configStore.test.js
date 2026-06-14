import {
  addComponent,
  deleteComponent,
  moveComponent,
  setKwarg,
  deleteKwarg,
  toOutputFormat,
} from '../components/configStore';

describe('addComponent', () => {
  it('appends a component with id, class, and empty kwargs', () => {
    const result = addComponent([], 'r-1', 'SerialReader');
    expect(result).toEqual([{ id: 'r-1', class: 'SerialReader', kwargs: {} }]);
  });

  it('does not mutate the original list', () => {
    const original = [{ id: 'r-1', class: 'SerialReader', kwargs: {} }];
    const result = addComponent(original, 'r-2', 'UDPReader');
    expect(result).toHaveLength(2);
    expect(original).toHaveLength(1);
  });

  it('works on an empty list', () => {
    const result = addComponent([], 't-1', 'PrefixTransform');
    expect(result).toHaveLength(1);
    expect(result[0].class).toBe('PrefixTransform');
  });
});

describe('deleteComponent', () => {
  const list = [
    { id: 'r-1', class: 'SerialReader', kwargs: {} },
    { id: 'r-2', class: 'UDPReader', kwargs: { port: '6224' } },
  ];

  it('removes the component by id', () => {
    const result = deleteComponent(list, 'r-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r-2');
  });

  it('returns equivalent list if id not found', () => {
    const result = deleteComponent(list, 'r-99');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('r-1');
    expect(result[1].id).toBe('r-2');
  });

  it('does not mutate the original list', () => {
    const result = deleteComponent(list, 'r-1');
    expect(result).toHaveLength(1);
    expect(list).toHaveLength(2);
  });
});

describe('moveComponent', () => {
  const list = [
    { id: 'r-1', class: 'SerialReader', kwargs: {} },
    { id: 'r-2', class: 'UDPReader', kwargs: {} },
    { id: 'r-3', class: 'MQTTReader', kwargs: {} },
  ];

  it('moves a component up (swaps with previous)', () => {
    const result = moveComponent(list, 'r-2', -1);
    expect(result[0].id).toBe('r-2');
    expect(result[1].id).toBe('r-1');
    expect(result[2].id).toBe('r-3');
  });

  it('moves a component down (swaps with next)', () => {
    const result = moveComponent(list, 'r-1', 1);
    expect(result[0].id).toBe('r-2');
    expect(result[1].id).toBe('r-1');
    expect(result[2].id).toBe('r-3');
  });

  it('returns same list when moving first item up', () => {
    const result = moveComponent(list, 'r-1', -1);
    expect(result).toBe(list);
  });

  it('returns same list when moving last item down', () => {
    const result = moveComponent(list, 'r-3', 1);
    expect(result).toBe(list);
  });

  it('returns same list for unknown id', () => {
    const result = moveComponent(list, 'r-99', 1);
    expect(result).toBe(list);
  });

  it('does not mutate the original list', () => {
    const result = moveComponent(list, 'r-1', 1);
    expect(result[0].id).toBe('r-2');
    expect(list[0].id).toBe('r-1');
  });
});

describe('setKwarg', () => {
  const list = [
    { id: 'r-1', class: 'SerialReader', kwargs: {} },
    { id: 'r-2', class: 'UDPReader', kwargs: { port: '6224' } },
  ];

  it('adds a new kwarg to a component', () => {
    const result = setKwarg(list, 'r-1', 'baudrate', '9600');
    expect(result[0].kwargs).toEqual({ baudrate: '9600' });
  });

  it('overwrites an existing kwarg', () => {
    const result = setKwarg(list, 'r-2', 'port', '7000');
    expect(result[1].kwargs).toEqual({ port: '7000' });
  });

  it('does not affect other components', () => {
    const result = setKwarg(list, 'r-1', 'baudrate', '9600');
    expect(result[1].kwargs).toEqual({ port: '6224' });
  });

  it('does not mutate the original list', () => {
    const result = setKwarg(list, 'r-1', 'baudrate', '9600');
    expect(result[0].kwargs).toEqual({ baudrate: '9600' });
    expect(list[0].kwargs).toEqual({});
  });
});

describe('deleteKwarg', () => {
  const list = [
    { id: 'r-1', class: 'SerialReader', kwargs: { baudrate: '9600', port: '/dev/ttyUSB0' } },
    { id: 'r-2', class: 'UDPReader', kwargs: { port: '6224' } },
  ];

  it('removes a kwarg from a component', () => {
    const result = deleteKwarg(list, 'r-1', 'baudrate');
    expect(result[0].kwargs).toEqual({ port: '/dev/ttyUSB0' });
  });

  it('does not affect other components', () => {
    const result = deleteKwarg(list, 'r-1', 'baudrate');
    expect(result[1].kwargs).toEqual({ port: '6224' });
  });

  it('returns same kwargs if key not found', () => {
    const result = deleteKwarg(list, 'r-1', 'nonexistent');
    expect(result[0].kwargs).toEqual({ baudrate: '9600', port: '/dev/ttyUSB0' });
  });

  it('does not mutate the original list', () => {
    const result = deleteKwarg(list, 'r-1', 'baudrate');
    expect(result[0].kwargs).toEqual({ port: '/dev/ttyUSB0' });
    expect(list[0].kwargs).toEqual({ baudrate: '9600', port: '/dev/ttyUSB0' });
  });
});

describe('toOutputFormat', () => {
  it('converts components to output format with kwargs as array of single-key objects', () => {
    const readers = [
      { id: 'r-1', class: 'SerialReader', kwargs: { baudrate: '9600', port: '/dev/ttyUSB0' } },
    ];
    const result = toOutputFormat(readers, [], []);
    expect(result.readers).toEqual([
      { class: 'SerialReader', kwargs: [{ baudrate: '9600' }, { port: '/dev/ttyUSB0' }] },
    ]);
  });

  it('omits kwargs field for components with no kwargs', () => {
    const readers = [{ id: 'r-1', class: 'DatabaseReader', kwargs: {} }];
    const result = toOutputFormat(readers, [], []);
    expect(result.readers).toEqual([{ class: 'DatabaseReader' }]);
    expect(result.readers[0]).not.toHaveProperty('kwargs');
  });

  it('handles empty lists', () => {
    const result = toOutputFormat([], [], []);
    expect(result).toEqual({ readers: [], transforms: [], writers: [] });
  });

  it('does not include id in output', () => {
    const readers = [
      { id: 'r-1', class: 'SerialReader', kwargs: { baudrate: '9600' } },
    ];
    const result = toOutputFormat(readers, [], []);
    expect(result.readers[0]).not.toHaveProperty('id');
  });

  it('handles multiple sections at once', () => {
    const readers = [{ id: 'r-1', class: 'SerialReader', kwargs: { baudrate: '9600' } }];
    const transforms = [{ id: 't-1', class: 'PrefixTransform', kwargs: { prefix: 'gyr1' } }];
    const writers = [{ id: 'w-1', class: 'UDPWriter', kwargs: { port: '6224' } }];
    const result = toOutputFormat(readers, transforms, writers);
    expect(result.readers).toHaveLength(1);
    expect(result.transforms).toHaveLength(1);
    expect(result.writers).toHaveLength(1);
  });
});
