import { readers, transforms, writers } from '../constants/componentCatalog';

describe('Component Catalog — Data Integrity', () => {
  const allCategories = [
    { name: 'readers', items: readers },
    { name: 'transforms', items: transforms },
    { name: 'writers', items: writers },
  ];

  allCategories.forEach(({ name, items }) => {
    describe(name, () => {
      test('every entry has a non-empty label', () => {
        items.forEach((entry) => {
          expect(entry.label).toBeTruthy();
          expect(typeof entry.label).toBe('string');
        });
      });

      test('every entry has a non-empty className without spaces', () => {
        items.forEach((entry) => {
          expect(entry.className).toBeTruthy();
          expect(entry.className).not.toMatch(/\s/);
        });
      });

      test('every entry has params as an array', () => {
        items.forEach((entry) => {
          expect(Array.isArray(entry.params)).toBe(true);
        });
      });

      test('no duplicate labels', () => {
        const labels = items.map((e) => e.label);
        expect(new Set(labels).size).toBe(labels.length);
      });

      test('no duplicate classNames', () => {
        const classNames = items.map((e) => e.className);
        expect(new Set(classNames).size).toBe(classNames.length);
      });

      test('className matches label with spaces removed', () => {
        items.forEach((entry) => {
          // The className should be the label with spaces stripped,
          // ensuring the dropdown-to-class mapping is consistent.
          expect(entry.className).toBe(entry.label.replace(/\s/g, ''));
        });
      });
    });
  });

  test('catalog is not empty', () => {
    expect(readers.length).toBeGreaterThan(0);
    expect(transforms.length).toBeGreaterThan(0);
    expect(writers.length).toBeGreaterThan(0);
  });
});

describe('Component Catalog — Naming Correctness', () => {
  test('FromJSONTransform uses all-caps JSON (not FromJsonTransform)', () => {
    const entry = transforms.find((t) => t.label === 'From JSON Transform');
    expect(entry).toBeDefined();
    expect(entry.className).toBe('FromJSONTransform');
  });

  test('InfluxDBWriter uses capital DB (not InfluxdbWriter)', () => {
    const entry = writers.find((w) => w.label === 'InfluxDB Writer');
    expect(entry).toBeDefined();
    expect(entry.className).toBe('InfluxDBWriter');
  });

  test('XMLAggregatorTransform has tag as its only param (not input_format/output_format)', () => {
    const entry = transforms.find((t) => t.label === 'XML Aggregator Transform');
    expect(entry).toBeDefined();
    expect(entry.className).toBe('XMLAggregatorTransform');
    expect(entry.params).toEqual(['tag']);
  });

  test('NetworkReader (deprecated) is not in the catalog', () => {
    const entry = readers.find((r) => r.className === 'NetworkReader');
    expect(entry).toBeUndefined();
  });

  test('NetworkWriter (deprecated) is not in the catalog', () => {
    const entry = writers.find((w) => w.className === 'NetworkWriter');
    expect(entry).toBeUndefined();
  });

  test('PolledSerialReader has real params (not hello/works placeholder)', () => {
    const entry = readers.find((r) => r.className === 'PolledSerialReader');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('hello');
    expect(entry.params).not.toContain('works');
    expect(entry.params).toContain('port');
    expect(entry.params).toContain('baudrate');
  });

  test('UDPReader has interface and mc_group (not source)', () => {
    const entry = readers.find((r) => r.className === 'UDPReader');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('source');
    expect(entry.params).toContain('interface');
    expect(entry.params).toContain('mc_group');
  });

  test('UDPWriter uses mc_interface and mc_ttl (not interface and ttl)', () => {
    const entry = writers.find((w) => w.className === 'UDPWriter');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('interface');
    expect(entry.params).not.toContain('ttl');
    expect(entry.params).toContain('mc_interface');
    expect(entry.params).toContain('mc_ttl');
  });

  test('ComposedReader has only readers and transforms (no reader singular, no check_format)', () => {
    const entry = readers.find((r) => r.className === 'ComposedReader');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('reader');
    expect(entry.params).not.toContain('check_format');
    expect(entry.params).toContain('readers');
    expect(entry.params).toContain('transforms');
  });

  test('ComposedWriter has only transforms and writers (no check_format)', () => {
    const entry = writers.find((w) => w.className === 'ComposedWriter');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('check_format');
    expect(entry.params).toContain('transforms');
    expect(entry.params).toContain('writers');
  });

  test('LogfileWriter does not have rollover_hourly (that belongs to RegexLogfileWriter)', () => {
    const entry = writers.find((w) => w.className === 'LogfileWriter');
    expect(entry).toBeDefined();
    expect(entry.params).not.toContain('rollover_hourly');
  });

  test('RegexLogfileWriter has rollover_hourly', () => {
    const entry = writers.find((w) => w.className === 'RegexLogfileWriter');
    expect(entry).toBeDefined();
    expect(entry.params).toContain('rollover_hourly');
  });
});
