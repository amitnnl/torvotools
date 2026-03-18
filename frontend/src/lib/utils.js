import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { IMAGE_BASE_URL } from "../services/api";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (url, placeholder = "https://placehold.co/600") => {
  if (!url) return placeholder;
  
  // Safety check: if the URL is hardcoded to localhost from a previous database entry, 
  // we strip the local part and use the dynamic base URL.
  if (typeof url === 'string' && url.includes('localhost/react_viet/backend/')) {
    const relativePart = url.split('backend/')[1];
    return `${IMAGE_BASE_URL}${relativePart}`;
  }

  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}${url}`;
};


export const formatCurrency = (amount, symbol = '₹', locale = 'en-IN') => {
  const numericAmount = parseFloat(amount) || 0;
  
  // Create formatter
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'en-IN' ? 'INR' : 'USD',
    currencyDisplay: 'narrowSymbol',
  });

  // Get parts to replace the standard currency with the custom symbol from settings
  // This allows the user to change the symbol in settings while keeping the formatting logic
  const formatted = formatter.format(numericAmount);
  
  // Most formatters put the symbol at the start or end. 
  // We'll strip the default currency and prepend the custom one if it differs from the locale default.
  // Actually, using the locale's default but ensuring the symbol matches site_settings is safer.
  
  if (symbol) {
    // Replace the default currency symbol from Intl with our custom one
    // Extract only digits and separators
    const parts = formatter.formatToParts(numericAmount);
    const valueStr = parts
      .filter(p => p.type !== 'currency')
      .map(p => p.value)
      .join('');
    
    return `${symbol}${valueStr}`;
  }

  return formatted;
};
