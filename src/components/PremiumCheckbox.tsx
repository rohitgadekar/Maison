import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PremiumCheckboxProps {
    id?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string; // Optional label text
    className?: string; // Container class
}

export const PremiumCheckbox = ({ id, checked, onChange, label, className }: PremiumCheckboxProps) => {
    return (
        <div
            className={cn("flex items-center gap-4 group cursor-pointer select-none py-2", className)}
            onClick={() => onChange(!checked)}
        >
            <div
                className={cn(
                    "relative flex items-center justify-center w-6 h-6 rounded-[6px] border-2 transition-all duration-300 ease-out",
                    checked
                        ? "bg-accent border-accent shadow-[0_4px_10px_rgba(0,0,0,0.1)] scale-105"
                        : "bg-white/50 border-accent/20 group-hover:border-accent group-hover:bg-accent/5 group-hover:scale-110"
                )}
            >
                <input
                    type="checkbox"
                    id={id}
                    checked={checked}
                    readOnly
                    className="hidden"
                />
                <Check
                    className={cn(
                        "w-4 h-4 text-white stroke-[4] transition-all duration-300",
                        checked ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
                    )}
                />
            </div>

            {label && (
                <span
                    className="text-sm font-bold tracking-wide text-primary/80 group-hover:text-primary transition-colors duration-300 uppercase"
                >
                    {label}
                </span>
            )}
        </div>
    );
};
