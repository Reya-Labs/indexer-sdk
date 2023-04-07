import { getNetFixedRateLocked } from '../../../../src/common';

describe('net fixed rate locked', () => {
  it('vt, vt', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        1000,
        0.01,
        1000
    );

    expect(netFixedRateLocked).toBeCloseTo(0.0075);
  });

  it('vt, small ft', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        1000,
        0.01,
        -500
    );

    expect(netFixedRateLocked).toBeCloseTo(0.005);
  });
  
  it('vt, large ft', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        1000,
        0.01,
        -1500
    );

    expect(netFixedRateLocked).toBeCloseTo(0.01);
  });

  it('ft, ft', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        -1000,
        0.01,
        -1000
    );

    expect(netFixedRateLocked).toBeCloseTo(0.0075);
  });

  it('ft, small vt', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        -1000,
        0.01,
        500
    );

    expect(netFixedRateLocked).toBeCloseTo(0.005);
  });

  it('ft, large vt', () => {
    const netFixedRateLocked = getNetFixedRateLocked(
        0.005,
        -1000,
        0.01,
        1500
    );

    expect(netFixedRateLocked).toBeCloseTo(0.01);
  });
});
