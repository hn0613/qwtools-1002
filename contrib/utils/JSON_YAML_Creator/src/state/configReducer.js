export const ADD_COMPONENT = 'ADD_COMPONENT';
export const REMOVE_COMPONENT = 'REMOVE_COMPONENT';
export const UPDATE_KWARG = 'UPDATE_KWARG';
export const REMOVE_KWARG = 'REMOVE_KWARG';
export const MOVE_COMPONENT = 'MOVE_COMPONENT';
export const CLEAR_ALL = 'CLEAR_ALL';

const SECTION_PREFIX = { readers: 'r', transforms: 't', writers: 'w' };

export const initialState = {
  readers: [],
  transforms: [],
  writers: [],
  nextId: 1,
};

export default function configReducer(state, action) {
  switch (action.type) {
    case ADD_COMPONENT: {
      const { section, className } = action.payload;
      if (!className || !state[section]) return state;
      const prefix = SECTION_PREFIX[section] || 'x';
      const newItem = {
        id: `${prefix}_${state.nextId}`,
        class: className,
        kwargs: {},
      };
      return {
        ...state,
        [section]: [...state[section], newItem],
        nextId: state.nextId + 1,
      };
    }

    case REMOVE_COMPONENT: {
      const { section, id } = action.payload;
      if (!state[section]) return state;
      const filtered = state[section].filter((item) => item.id !== id);
      if (filtered.length === state[section].length) return state;
      return { ...state, [section]: filtered };
    }

    case UPDATE_KWARG: {
      const { section, id, key, value } = action.payload;
      if (!state[section] || !key) return state;
      return {
        ...state,
        [section]: state[section].map((item) =>
          item.id === id
            ? { ...item, kwargs: { ...item.kwargs, [key]: value } }
            : item
        ),
      };
    }

    case REMOVE_KWARG: {
      const { section, id, key } = action.payload;
      if (!state[section] || !key) return state;
      return {
        ...state,
        [section]: state[section].map((item) => {
          if (item.id !== id) return item;
          const { [key]: _, ...rest } = item.kwargs;
          return { ...item, kwargs: rest };
        }),
      };
    }

    case MOVE_COMPONENT: {
      const { section, id, direction } = action.payload;
      if (!state[section]) return state;
      const list = [...state[section]];
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return state;
      if (direction === 'up' && index > 0) {
        [list[index - 1], list[index]] = [list[index], list[index - 1]];
      } else if (direction === 'down' && index < list.length - 1) {
        [list[index], list[index + 1]] = [list[index + 1], list[index]];
      } else {
        return state;
      }
      return { ...state, [section]: list };
    }

    case CLEAR_ALL:
      return initialState;

    default:
      return state;
  }
}
