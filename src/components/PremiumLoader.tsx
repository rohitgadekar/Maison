
interface PremiumLoaderProps {
    message?: string;
}

export const PremiumLoader = ({ message = "Accessing Archive..." }: PremiumLoaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-8 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center w-32 h-32">
                {/* Ornate spinning border */}
                <div className="absolute inset-0 border-[1px] border-accent/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 border-[1px] border-accent/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                {/* Core pulsing diamond */}
                <div className="relative w-8 h-8 rotate-45 border border-accent animate-pulse shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]">
                    <div className="absolute inset-1 bg-accent/20" />
                </div>

                {/* Scanning line */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-accent to-transparent h-48 -translate-x-1/2 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48 h-[1px] bg-accent/5 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-accent animate-loading-bar" />
                </div>                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic">
                    {message}
                </span>
            </div>
        </div>
    );
};
