export type Currency =
  | "USD" | "EUR" | "GBP" | "RON" | "JPY" | "CAD" | "AUD" | "CHF"
  | "BRL" | "INR" | "CNY" | "MXN" | "KRW" | "SGD" | "PLN" | "TRY"
  | "ZAR" | "NOK" | "SEK" | "DKK";

export const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: "USD", symbol: "$"   },
  { code: "EUR", symbol: "€"   },
  { code: "GBP", symbol: "£"   },
  { code: "RON", symbol: "lei" },
  { code: "JPY", symbol: "¥"   },
  { code: "CAD", symbol: "CA$" },
  { code: "AUD", symbol: "AU$" },
  { code: "CHF", symbol: "Fr"  },
  { code: "BRL", symbol: "R$"  },
  { code: "INR", symbol: "₹"   },
  { code: "CNY", symbol: "¥"   },
  { code: "MXN", symbol: "MX$" },
  { code: "KRW", symbol: "₩"   },
  { code: "SGD", symbol: "S$"  },
  { code: "PLN", symbol: "zł"  },
  { code: "TRY", symbol: "₺"   },
  { code: "ZAR", symbol: "R"   },
  { code: "NOK", symbol: "kr"  },
  { code: "SEK", symbol: "kr"  },
  { code: "DKK", symbol: "kr"  },
];

const SYMBOL_MAP: Record<string, string> = Object.fromEntries(
  CURRENCIES.map(({ code, symbol }) => [code, symbol])
);

export function currencySymbolFor(currency?: string): string {
  return SYMBOL_MAP[currency?.toUpperCase() ?? ""] ?? "$";
}

export function formatAmount(n: number, decimals: number = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
