import { Packr, Unpackr } from 'msgpackr';

const packr = new Packr({
  structuredClone: true, // Handle recursive/cyclical references
  useRecords: true, // For better compression of repeated object structures
  variableMapSize: true, // For optimizing small objects
});

const unpackr = new Unpackr({
  structuredClone: true,
  useRecords: true,
  variableMapSize: true,
});

export const serialize = <T>(data: T): Buffer => {
  try {
    return packr.pack(data);
  } catch (error) {
    throw new Error(
      `Failed to serialize data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

export const deserialize = <T>(buffer: Buffer): T => {
  try {
    return unpackr.unpack(buffer) as T;
  } catch (error) {
    throw new Error(
      `Failed to deserialize data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};
