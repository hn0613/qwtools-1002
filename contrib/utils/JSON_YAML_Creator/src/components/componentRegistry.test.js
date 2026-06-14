import { READERS, TRANSFORMS, WRITERS, getRegistry, displayNameToClass } from '../components/componentRegistry';

describe('componentRegistry', () => {
  it('READERS has 11 entries', () => {
    expect(Object.keys(READERS)).toHaveLength(11);
  });

  it('TRANSFORMS has 21 entries', () => {
    expect(Object.keys(TRANSFORMS)).toHaveLength(21);
  });

  it('WRITERS has 12 entries', () => {
    expect(Object.keys(WRITERS)).toHaveLength(12);
  });

  it('every entry has a string displayName and an array kwargs', () => {
    const validate = (registry) => {
      Object.entries(registry).forEach(([className, entry]) => {
        expect(typeof entry.displayName).toBe('string');
        expect(entry.displayName.length).toBeGreaterThan(0);
        expect(Array.isArray(entry.kwargs)).toBe(true);
        // class name should be a valid identifier (letters/digits only)
        expect(className).toMatch(/^[A-Za-z]+$/);
      });
    };
    validate(READERS);
    validate(TRANSFORMS);
    validate(WRITERS);
  });

  it('all displayNames are unique within each registry', () => {
    const checkUnique = (registry) => {
      const names = Object.values(registry).map((e) => e.displayName);
      expect(new Set(names).size).toBe(names.length);
    };
    checkUnique(READERS);
    checkUnique(TRANSFORMS);
    checkUnique(WRITERS);
  });
});

describe('getRegistry', () => {
  it('returns READERS for "readers"', () => {
    expect(getRegistry('readers')).toBe(READERS);
  });

  it('returns TRANSFORMS for "transforms"', () => {
    expect(getRegistry('transforms')).toBe(TRANSFORMS);
  });

  it('returns WRITERS for "writers"', () => {
    expect(getRegistry('writers')).toBe(WRITERS);
  });

  it('returns empty object for unknown type', () => {
    expect(getRegistry('unknown')).toEqual({});
  });
});

describe('displayNameToClass', () => {
  it('finds class name from display name', () => {
    expect(displayNameToClass('Serial Reader', READERS)).toBe('SerialReader');
    expect(displayNameToClass('UDP Writer', WRITERS)).toBe('UDPWriter');
    expect(displayNameToClass('Prefix Transform', TRANSFORMS)).toBe('PrefixTransform');
  });

  it('returns null for unknown display name', () => {
    expect(displayNameToClass('Nonexistent Reader', READERS)).toBeNull();
  });
});
