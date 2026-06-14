/**
 * configStore.js
 *
 * Pure functions for manipulating the component list state.
 * Every function returns a new array/object — no in-place mutation.
 *
 * Component shape:
 *   { id: string, class: string, kwargs: { [key]: value } }
 */

/**
 * Append a new component with empty kwargs.
 */
export function addComponent(list, id, className) {
  return [...list, { id, class: className, kwargs: {} }];
}

/**
 * Remove a component by id.
 */
export function deleteComponent(list, id) {
  return list.filter((c) => c.id !== id);
}

/**
 * Move a component up (-1) or down (+1) in the list.
 * Returns the same list reference if the move is out of bounds.
 */
export function moveComponent(list, id, direction) {
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return list;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= list.length) return list;
  const copy = [...list];
  const temp = copy[idx];
  copy[idx] = copy[newIdx];
  copy[newIdx] = temp;
  return copy;
}

/**
 * Add or update a single kwarg on a component.
 */
export function setKwarg(list, id, key, value) {
  return list.map((c) =>
    c.id === id ? { ...c, kwargs: { ...c.kwargs, [key]: value } } : c
  );
}

/**
 * Remove a single kwarg from a component.
 */
export function deleteKwarg(list, id, key) {
  return list.map((c) => {
    if (c.id !== id) return c;
    const { [key]: _, ...rest } = c.kwargs;
    return { ...c, kwargs: rest };
  });
}

/**
 * Convert the internal state arrays to the JSON/YAML output format
 * that matches the original Creator output (and OpenRVDAS config shape).
 *
 * Output shape per component:
 *   { class: "SerialReader", kwargs: [{ baudrate: "9600" }, { port: "/dev/ttyUSB0" }] }
 *
 * If a component has no kwargs, the `kwargs` field is omitted entirely.
 */
export function toOutputFormat(readers, transforms, writers) {
  const convert = (list) =>
    list.map(({ class: cls, kwargs }) => {
      const keys = Object.keys(kwargs);
      if (keys.length === 0) {
        return { class: cls };
      }
      return {
        class: cls,
        kwargs: keys.map((key) => ({ [key]: kwargs[key] })),
      };
    });

  return {
    readers: convert(readers),
    transforms: convert(transforms),
    writers: convert(writers),
  };
}
