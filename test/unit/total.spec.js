const { total } = require('../../src/total');
const { subtotal } = require('../../src/subtotal');
const { discounts } = require('../../src/discounts');
const { deliveryFee } = require('../../src/delivery');
const { tax } = require('../../src/tax');

describe('Order Calculations', () => {
  
  describe('total', () => {
    it('should calculate complete order total', () => {
      const order = {
        items: [
          {
            sku: 'P6-POTATO', // could be any valid SKU (see README.md for examples)
            title: '6-pack Potato',
            kind: 'hot', // could be 'hot' or 'frozen'
            filling: 'potato', // could be 'potato', 'cheese', 'meat', etc.
            qty: 6, // quantity of this item
            unitPriceCents: 699, // price per unit in cents
            addOns: [], // could include 'sour-cream', 'fried-onion', 'bacon-bits'
          }
        ]
      };
      
      const context = {
        profile: { tier: 'guest' }, // could be 'guest', 'regular', or 'vip'
        delivery: {
          zone: 'local', // could be 'local' or 'outer'
          rush: false, // boolean indicating rush delivery
        },
        // coupon is optional and omitted here
      };
      
      const orderTotal = total(order, context);
      expect(orderTotal).toBeGreaterThan(0);
      expect(Number.isInteger(orderTotal)).toBe(true);
    });

    it('should truncate large totals (>$100) to whole dollars', () => {
      // Large order that should be truncated to whole dollars
      const order = {
        items: [
          {
            sku: 'P24-POTATO',
            title: '24-pack Potato',
            kind: 'hot',
            filling: 'potato',
            qty: 24,
            unitPriceCents: 2399, // $23.99
            addOns: ['sour-cream', 'fried-onion', 'bacon-bits'], // adds $4.47 per pack
          },
          {
            sku: 'P12-POTATO',
            title: '12-pack Potato',
            kind: 'hot',
            filling: 'potato',
            qty: 12,
            unitPriceCents: 1299, // $12.99
            addOns: [],
          }
        ]
      };
      
      const context = {
        profile: { tier: 'guest' },
        delivery: {
          zone: 'outer',
          rush: true,
        },
      };
      
      const orderTotal = total(order, context);
      
      // Total should be > $100 (10000 cents)
      expect(orderTotal).toBeGreaterThan(10000);
      
      // When total > $100, it should be truncated to whole dollars
      // Meaning the last two digits should be "00"
      expect(orderTotal % 100).toBe(0);
    });
  });

});
