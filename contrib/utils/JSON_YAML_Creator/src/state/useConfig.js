import { useReducer, useMemo } from 'react';
import configReducer, {
  initialState,
  ADD_COMPONENT,
  REMOVE_COMPONENT,
  UPDATE_KWARG,
  REMOVE_KWARG,
  MOVE_COMPONENT,
  CLEAR_ALL,
} from './configReducer';

function stripIds(items) {
  return items.map(({ id, ...rest }) => rest);
}

export default function useConfig() {
  const [state, dispatch] = useReducer(configReducer, initialState);

  const addComponent = (section, className) => {
    dispatch({ type: ADD_COMPONENT, payload: { section, className } });
  };

  const removeComponent = (section, id) => {
    dispatch({ type: REMOVE_COMPONENT, payload: { section, id } });
  };

  const updateKwarg = (section, id, key, value) => {
    dispatch({ type: UPDATE_KWARG, payload: { section, id, key, value } });
  };

  const removeKwarg = (section, id, key) => {
    dispatch({ type: REMOVE_KWARG, payload: { section, id, key } });
  };

  const moveComponent = (section, id, direction) => {
    dispatch({ type: MOVE_COMPONENT, payload: { section, id, direction } });
  };

  const clearAll = () => {
    dispatch({ type: CLEAR_ALL });
  };

  const exportData = useMemo(
    () => ({
      readers: stripIds(state.readers),
      transforms: stripIds(state.transforms),
      writers: stripIds(state.writers),
    }),
    [state.readers, state.transforms, state.writers]
  );

  return {
    state,
    exportData,
    addComponent,
    removeComponent,
    updateKwarg,
    removeKwarg,
    moveComponent,
    clearAll,
  };
}
