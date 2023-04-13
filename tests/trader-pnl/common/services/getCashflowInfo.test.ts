// import { getCashflowInfo } from '../../../../src/common';

// describe('cashflow info', () => {
//   it('vt, vt', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: 1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: 1000,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(2000);
//     expect(netFixedRateLocked).toBeCloseTo(0.075);
//   });

//   it('vt, small ft', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: 1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: -500,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(500);
//     expect(netFixedRateLocked).toBeCloseTo(0.05);
//   });

//   it('vt, large ft', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: 1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: -1500,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(-500);
//     expect(netFixedRateLocked).toBeCloseTo(0.1);
//   });

//   it('ft, ft', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: -1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: -1000,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(-2000);
//     expect(netFixedRateLocked).toBeCloseTo(0.075);
//   });

//   it('ft, small vt', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: -1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: 500,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(-500);
//     expect(netFixedRateLocked).toBeCloseTo(0.05);
//   });

//   it('ft, large vt', () => {
//     const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
//       {
//         notional: -1000,
//         fixedRate: 0.05,
//       },
//       {
//         notional: 1500,
//         fixedRate: 0.1,
//       },
//     );

//     expect(netNotionalLocked).toBeCloseTo(500);
//     expect(netFixedRateLocked).toBeCloseTo(0.1);
//   });
// });
