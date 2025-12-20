import { cn } from "@/lib/utils";

interface PremiumToggleProps {
    checked: boolean;
    onCheckedChange: () => void; // Updated callback signature to simplify usage
    className?: string;
}

export const PremiumToggle = ({ checked, onCheckedChange, className }: PremiumToggleProps) => {
    return (
        <button
            onClick={onCheckedChange}
            type="button"
            className={cn(
                "relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-accent" : "bg-[#E9E9EA]",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15),0_3px_8px_rgba(0,0,0,0.1)] ring-0 transition-transform duration-200 ease-in-out",
                    checked ? "translate-x-[20px]" : "translate-x-0"
                )}
            />
        </button>
    );
};
