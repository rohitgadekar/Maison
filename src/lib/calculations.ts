export const roundPrice = (price: number) => {
  return Math.round(price);
};

export const calculateOrderTotals = (
  subtotal: number,
  shippingFee: number,
  discountAmount: number,
  taxRate: number = 0.08
) => {
  const tax = roundPrice(subtotal * taxRate);
  const total = roundPrice(subtotal + tax + shippingFee - discountAmount);
  
  return {
    gross: roundPrice(subtotal),
    tax,
    shipping: roundPrice(shippingFee),
    discount: roundPrice(discountAmount),
    total: Math.max(0, total)
  };
};
