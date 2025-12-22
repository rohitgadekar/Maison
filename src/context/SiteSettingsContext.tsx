import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettingsContextType {
    allowSignups: boolean;
    allowCheckouts: boolean;
    enablePOD: boolean;
    enableOnlinePayments: boolean;
    loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [allowSignups, setAllowSignups] = useState(true);
    const [allowCheckouts, setAllowCheckouts] = useState(true);
    const [enablePOD, setEnablePOD] = useState(false);
    const [enableOnlinePayments, setEnableOnlinePayments] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('site_settings' as any)
                .select('*');

            if (data) {
                const signupSetting = (data as any[]).find(s => s.key === 'allow_signups');
                const checkoutSetting = (data as any[]).find(s => s.key === 'allow_checkouts');
                const podSetting = (data as any[]).find(s => s.key === 'enable_pod');
                const onlinePaymentsSetting = (data as any[]).find(s => s.key === 'enable_online_payments');

                if (signupSetting) setAllowSignups(signupSetting.value === 'true');
                if (checkoutSetting) setAllowCheckouts(checkoutSetting.value === 'true');
                if (podSetting) setEnablePOD(podSetting.value === 'true');
                if (onlinePaymentsSetting) setEnableOnlinePayments(onlinePaymentsSetting.value === 'true');
            }
        } catch (err) {
            console.error('Error fetching site settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Subscribe to Realtime changes for site_settings
        const settingsChannel = supabase
            .channel('site_settings_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'site_settings',
                },
                () => {
                    fetchSettings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(settingsChannel);
        };
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ allowSignups, allowCheckouts, enablePOD, enableOnlinePayments, loading }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
}
