import { describe, it, expect } from 'vitest';
import { uuid } from '../src/utils';

describe('Uid', () => {
  it('should return string', () => {
    const uid = uuid();
    expect(typeof uid).toEqual('string');
  });
});
