import configReducer, {
  initialState,
  ADD_COMPONENT,
  REMOVE_COMPONENT,
  UPDATE_KWARG,
  REMOVE_KWARG,
  MOVE_COMPONENT,
  CLEAR_ALL,
} from '../configReducer';

describe('configReducer', () => {
  it('ADD_COMPONENT appends item with correct id and empty kwargs', () => {
    const state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    expect(state.readers).toHaveLength(1);
    expect(state.readers[0]).toEqual({
      id: 'r_1',
      class: 'SerialReader',
      kwargs: {},
    });
  });

  it('ADD_COMPONENT increments nextId', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'UDPReader' },
    });
    expect(state.readers[0].id).toBe('r_1');
    expect(state.readers[1].id).toBe('r_2');
    expect(state.nextId).toBe(3);
  });

  it('ADD_COMPONENT uses different prefixes per section', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'transforms', className: 'PrefixTransform' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'writers', className: 'UDPWriter' },
    });
    expect(state.readers[0].id).toMatch(/^r_/);
    expect(state.transforms[0].id).toMatch(/^t_/);
    expect(state.writers[0].id).toMatch(/^w_/);
  });

  it('ADD_COMPONENT with empty className is a no-op', () => {
    const state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: '' },
    });
    expect(state).toBe(initialState);
  });

  it('REMOVE_COMPONENT removes the correct item by id', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'UDPReader' },
    });
    state = configReducer(state, {
      type: REMOVE_COMPONENT,
      payload: { section: 'readers', id: 'r_1' },
    });
    expect(state.readers).toHaveLength(1);
    expect(state.readers[0].class).toBe('UDPReader');
  });

  it('REMOVE_COMPONENT with non-existent id returns same state', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    const result = configReducer(state, {
      type: REMOVE_COMPONENT,
      payload: { section: 'readers', id: 'r_999' },
    });
    expect(result).toBe(state);
  });

  it('UPDATE_KWARG sets a kwarg on the correct item', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate', value: '9600' },
    });
    expect(state.readers[0].kwargs).toEqual({ baudrate: '9600' });
  });

  it('UPDATE_KWARG overwrites existing value', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate', value: '9600' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate', value: '4800' },
    });
    expect(state.readers[0].kwargs.baudrate).toBe('4800');
  });

  it('REMOVE_KWARG deletes a single kwarg key', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate', value: '9600' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'port', value: '/dev/ttyUSB0' },
    });
    state = configReducer(state, {
      type: REMOVE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate' },
    });
    expect(state.readers[0].kwargs).toEqual({ port: '/dev/ttyUSB0' });
  });

  it('MOVE_COMPONENT up swaps with predecessor', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'transforms', className: 'TimestampTransform' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'transforms', className: 'PrefixTransform' },
    });
    state = configReducer(state, {
      type: MOVE_COMPONENT,
      payload: { section: 'transforms', id: 't_2', direction: 'up' },
    });
    expect(state.transforms[0].class).toBe('PrefixTransform');
    expect(state.transforms[1].class).toBe('TimestampTransform');
  });

  it('MOVE_COMPONENT down swaps with successor', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'transforms', className: 'TimestampTransform' },
    });
    state = configReducer(state, {
      type: ADD_COMPONENT,
      payload: { section: 'transforms', className: 'PrefixTransform' },
    });
    state = configReducer(state, {
      type: MOVE_COMPONENT,
      payload: { section: 'transforms', id: 't_1', direction: 'down' },
    });
    expect(state.transforms[0].class).toBe('PrefixTransform');
    expect(state.transforms[1].class).toBe('TimestampTransform');
  });

  it('MOVE_COMPONENT up on first item is a no-op', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    const result = configReducer(state, {
      type: MOVE_COMPONENT,
      payload: { section: 'readers', id: 'r_1', direction: 'up' },
    });
    expect(result).toBe(state);
  });

  it('MOVE_COMPONENT down on last item is a no-op', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    const result = configReducer(state, {
      type: MOVE_COMPONENT,
      payload: { section: 'readers', id: 'r_1', direction: 'down' },
    });
    expect(result).toBe(state);
  });

  it('CLEAR_ALL resets to initial state', () => {
    let state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    state = configReducer(state, {
      type: UPDATE_KWARG,
      payload: { section: 'readers', id: 'r_1', key: 'baudrate', value: '9600' },
    });
    state = configReducer(state, { type: CLEAR_ALL });
    expect(state).toEqual(initialState);
  });

  it('returns new state references on mutating actions', () => {
    const state = configReducer(initialState, {
      type: ADD_COMPONENT,
      payload: { section: 'readers', className: 'SerialReader' },
    });
    expect(state).not.toBe(initialState);
    expect(state.readers).not.toBe(initialState.readers);
  });
});
