import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceProps {
    amount: number;
    className?: string;
    currencyCode?: string; // Optional: Force a currency code display
}

export const Price = ({ amount, className, currencyCode }: PriceProps) => {
    const {
        storeCurrency,
        userCurrency,
        liveConversionEnabled,
        convertPrice,
        formatPrice
    } = useCurrency();

    // The display in the UI (static) is always the Store Currency (or forced currency)
    // We assume 'amount' is in 'storeCurrency' value.
    const isCustomCurrency = !!currencyCode;
    const currentCurrency = (currencyCode as any) || storeCurrency;
    const displayedPrice = formatPrice(amount, currentCurrency);

    // If live conversion is enabled, we check if we need to show the tooltip
    // We only show if userCurrency is different from the currency being displayed.
    const showTooltip = liveConversionEnabled && userCurrency !== currentCurrency;

    if (!showTooltip) {
        return <span className={cn(className)}>{displayedPrice}</span>;
    }

    // We only convert if the source is the store currency. 
    // If it's a custom currency (e.g. historical order in USD), converting it requires knowing the rate of THAT currency relative to Store Currency.
    // Our convertPrice function assumes input is in Store Currency.
    // If currencyCode is provided, we might be unable to accurately convert unless we treat 'amount' as Store Currency...
    // But convertPrice implementation: amountInUSD = amount / baseRate; ... where baseRate is rate of StoreCurrency.

    // Simplification: We only support converting FROM Store Currency for now to avoid math errors with historical data.
    // So if isCustomCurrency is true and it differs from StoreCurrency, we might skip conversion or need smarter logic.
    // However, for now, let's assume 'amount' passed to Price is always conceptually in "Store Currency" unless specified otherwise.

    // If we are displaying a static price like "USD 100" (currencyCode='USD'), and Store is 'INR'.
    // We want to see User's 'EUR'.
    // We need to convert USD -> EUR.
    // convertPrice logic: (amount / rate(Store)) * rate(Target).
    // This is valid ONLY if amount is in Store Currency.

    // Let's rely on standard case: Price is used for current products (in Store Currency).
    let convertedPrice: string | null = null;

    if (!isCustomCurrency || currencyCode === storeCurrency) {
        const convertedAmount = convertPrice(amount, userCurrency);
        convertedPrice = formatPrice(convertedAmount, userCurrency);
    }

    if (!convertedPrice) {
        return <span className={cn(className)}>{displayedPrice}</span>;
    }

    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <span className={cn("cursor-help decoration-accent/30 decoration-dashed underline-offset-4 hover:text-accent transition-colors", className)}>
                    {displayedPrice}
                </span>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="bg-white/90 backdrop-blur-xl border border-accent/10 shadow-xl p-4 rounded-[1rem] animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex flex-col items-center gap-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/60">
                        Approx. {userCurrency}
                    </p>
                    <p className="text-xl font-bold tracking-tight text-primary">
                        {convertedPrice}
                    </p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
};
