import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

interface CurrencyContextType {
    storeCurrency: Currency;
    userCurrency: Currency;
    liveConversionEnabled: boolean;
    exchangeRates: Record<Currency, number>;
    setStoreCurrency: (currency: Currency) => Promise<void>;
    setUserCurrency: (currency: Currency) => Promise<void>;
    setLiveConversion: (enabled: boolean) => Promise<void>;
    convertPrice: (amount: number, targetCurrency?: Currency) => number;
    formatPrice: (amount: number, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const SUPPORTED_CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

const DEFAULT_RATES: Record<Currency, number> = {
    USD: 1,                  // Base
    EUR: 0.85,               // ~0.85 EUR per 1 USD :contentReference[oaicite:1]{index=1}
    GBP: 0.75,               // ~0.75 GBP per 1 USD :contentReference[oaicite:2]{index=2}
    INR: 90.7,               // ~90.7 INR per 1 USD :contentReference[oaicite:3]{index=3}
    CAD: 1.38,               // ~1.38 CAD per 1 USD :contentReference[oaicite:4]{index=4}
    AUD: 1.51,               // ~1.51 AUD per 1 USD :contentReference[oaicite:5]{index=5}
    JPY: 158.0,              // ~158 JPY per 1 USD :contentReference[oaicite:6]{index=6}
};


export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [storeCurrency, setStoreCurrencyState] = useState<Currency>('USD');
    const [userCurrency, setUserCurrencyState] = useState<Currency>('USD');
    const [liveConversionEnabled, setLiveConversionState] = useState(false);
    const [exchangeRates] = useState<Record<Currency, number>>(DEFAULT_RATES);

    // Fetch Store Settings
    useEffect(() => {
        const fetchStoreSettings = async () => {
            const { data } = await supabase
                .from('site_settings' as any)
                .select('value')
                .eq('key', 'store_currency')
                .maybeSingle();

            if (data) {
                setStoreCurrencyState((data as any).value as Currency);
            }
        };
        fetchStoreSettings();
    }, []);

    // Fetch User Preferences
    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (!user) {
                setUserCurrencyState(storeCurrency); // Default to store currency if no user
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('preferred_currency, live_conversion')
                .eq('user_id', user.id)
                .single();

            if (data) {
                if (data.preferred_currency) setUserCurrencyState(data.preferred_currency as Currency);
                if (data.live_conversion !== null) setLiveConversionState(data.live_conversion);
            }
        };

        if (user) fetchUserPreferences();
    }, [user, storeCurrency]);

    const setStoreCurrency = async (currency: Currency) => {
        // Admin only usually, but we'll allow the call here
        const { error } = await supabase
            .from('site_settings' as any)
            .upsert({ key: 'store_currency', value: currency, updated_at: new Date().toISOString() }, { onConflict: 'key' });

        if (!error) setStoreCurrencyState(currency);
    };

    const setUserCurrency = async (currency: Currency) => {
        setUserCurrencyState(currency);
        if (user) {
            await supabase
                .from('profiles')
                .update({ preferred_currency: currency } as any)
                .eq('user_id', user.id);
        }
    };

    const setLiveConversion = async (enabled: boolean) => {
        setLiveConversionState(enabled);
        if (user) {
            await supabase
                .from('profiles')
                .update({ live_conversion: enabled } as any)
                .eq('user_id', user.id);
        }
    };

    const convertPrice = (amount: number, targetCurrency: Currency = userCurrency): number => {
        // Always assume base amount is in STORE currency (or USD if prices are absolute). 
        // NOTE: Usually prices in DB are consistent (e.g. USD).
        // If storeCurrency changes, we assume the DB prices are treated AS that currency? 
        // OR we assume DB is always USD? 
        // Let's assume DB prices are FIXED in USD for simplicity, 
        // OR DB prices are in "Store Currency". 
        // For accurate conversion: Price (Store) / Rate (Store) * Rate (Target)

        // Let's assume the DB prices are maintained in the Store Currency.
        const baseRate = exchangeRates[storeCurrency];
        const targetRate = exchangeRates[targetCurrency];

        // Convert to USD (Base 1.0) then to Target
        const amountInUSD = amount / baseRate;
        return amountInUSD * targetRate;
    };

    const formatPrice = (amount: number, currency: Currency = userCurrency): string => {
        const symbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$';
        return `${symbol}${Math.round(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    return (
        <CurrencyContext.Provider value={{
            storeCurrency,
            userCurrency,
            liveConversionEnabled,
            exchangeRates,
            setStoreCurrency,
            setUserCurrency,
            setLiveConversion,
            convertPrice,
            formatPrice
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
