import React from 'react';

export const FormatPrice = (amount: number) => {
  const formattedAmount = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);

  // Extract the currency symbol from the formatted amount
  const currencySymbol = formattedAmount.replace(/[0-9.,]/g, '').trim();

  // Replace the currency code with the desired symbol
  const customFormattedAmount = formattedAmount.replace(currencySymbol, '₦');

  return customFormattedAmount;
};
