import { createContext, useContext, useState, useEffect } from "react";
import { 
  getUserPreferredCurrency, 
  setUserPreferredCurrency, 
  convertCurrency, 
  formatCurrency, 
  SUPPORTED_CURRENCIES,
  type Currency 
} from "@/utils/currency";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (amount: number, fromCurrency?: string) => number;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  supportedCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<string>(() => getUserPreferredCurrency());

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    setUserPreferredCurrency(newCurrency);
  };

  const convertPrice = (amount: number, fromCurrency: string = 'USD'): number => {
    return convertCurrency(amount, fromCurrency, currency);
  };

  const formatPrice = (amount: number, fromCurrency: string = 'USD'): string => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    return formatCurrency(convertedAmount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}