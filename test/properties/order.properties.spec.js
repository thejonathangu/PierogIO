const fc = require('fast-check');
const { total } = require('../../src/total');
const { referenceTotal } = require('../../src/reference');

/**
 * Property-Based Testing for PierogIO
 * 
 * Properties to test:
 * - Preservation: non-negative, integers, bounded tax/discounts
 * - Metamorphic: monotonicity, commutativity, scaling
 * - Differential: matches reference implementation
 * - Invariants: business rules (thresholds, discounts, tax rates)
 * - Boundaries: threshold behavior at $20, $30, $40, $50, $100
 */
describe('Property-Based Tests for Orders', () => {
  
  // Arbitrary generators
  const addOnArb = fc.constantFrom('sour-cream', 'fried-onion', 'bacon-bits');
  const fillingArb = fc.constantFrom('potato', 'sauerkraut', 'sweet-cheese', 'mushroom');
  const kindArb = fc.constantFrom('hot', 'frozen');
  const tierArb = fc.constantFrom('guest', 'regular', 'vip');
  const zoneArb = fc.constantFrom('local', 'outer');
  
  const orderItemArb = fc.record({
    sku: fc.constantFrom('P6-POTATO', 'P12-POTATO', 'P24-POTATO', 'P6-SAUER', 'P12-SAUER'),
    title: fc.string(),
    kind: kindArb,
    filling: fillingArb,
    qty: fc.constantFrom(6, 12, 24),
    unitPriceCents: fc.integer({ min: 500, max: 3000 }),
    addOns: fc.array(addOnArb, { maxLength: 3 })
  });
  
  const orderArb = fc.record({
    items: fc.array(orderItemArb, { minLength: 1, maxLength: 5 })
  });
  
  const profileArb = fc.record({
    tier: tierArb
  });
  
  const deliveryArb = fc.record({
    zone: zoneArb,
    rush: fc.boolean()
  });
  
  const contextArb = fc.record({
    profile: profileArb,
    delivery: deliveryArb,
    coupon: fc.option(fc.constantFrom('PIEROGI-BOGO', 'FIRST10'), { nil: null })
  });
  
  describe('Invariants', () => {
    
    it('total should always be non-negative integer', () => {
      fc.assert(
        fc.property(orderArb, contextArb, (order, context) => {
          const result = total(order, context);
          return result >= 0 && Number.isInteger(result);
        }),
        { numRuns: 50 }
      );
    });

  });
});
