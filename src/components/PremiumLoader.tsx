
interface PremiumLoaderProps {
    message?: string;
}

export const PremiumLoader = ({ message = "Accessing Archive..." }: PremiumLoaderProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-12 animate-in fade-in duration-700">
            {/* Main Loader Container */}
            <div className="relative flex items-center justify-center w-48 h-48">
                {/* Outer glow effect */}
                <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl animate-pulse" />

                {/* Ornate spinning borders - Multiple layers */}
                <div className="absolute inset-0 border-[2px] border-accent/30 rounded-full animate-[spin_8s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.8)]" />
                </div>
                <div className="absolute inset-4 border-[1px] border-accent/20 rounded-full animate-[spin_12s_linear_infinite_reverse]">
                    <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 -translate-x-1/2 translate-y-1/2 bg-accent/60 rounded-full" />
                </div>
                <div className="absolute inset-8 border-[1px] border-accent/10 rounded-full animate-[spin_16s_linear_infinite]" />

                {/* Central diamond with glassmorphism */}
                <div className="relative">
                    <div className="w-16 h-16 rotate-45 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border-2 border-accent/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] animate-[pulse_3s_ease-in-out_infinite]">
                        <div className="absolute inset-2 bg-gradient-to-br from-accent/30 to-accent/10 animate-[pulse_2s_ease-in-out_infinite_reverse]" />
                        {/* Inner accent dot */}
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-accent rounded-full shadow-[0_0_20px_rgba(var(--accent-rgb),0.6)] animate-ping" />
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-accent rounded-full" />
                    </div>
                </div>

                {/* Scanning lines - Multiple */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent h-64 -translate-x-1/2 animate-[pulse_2s_ease-in-out_infinite]" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent w-64 -translate-y-1/2 animate-[pulse_2.5s_ease-in-out_infinite]" />
            </div>

            {/* Text and Progress Bar */}
            <div className="flex flex-col items-center space-y-6 w-full max-w-xs">
                {/* Progress bar with gradient */}
                <div className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-accent/10 to-transparent overflow-hidden rounded-full">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-accent/50 via-accent to-accent/50 animate-loading-bar shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]" />
                </div>

                {/* Message with enhanced typography */}
                <div className="text-center space-y-2">
                    <span className="block text-[11px] font-black uppercase tracking-[0.5em] text-accent/60 animate-pulse">
                        {message}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-accent/40 animate-[pulse_1s_ease-in-out_infinite]" />
                        <span className="w-1 h-1 rounded-full bg-accent/40 animate-[pulse_1s_ease-in-out_infinite_0.2s]" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 h-1 rounded-full bg-accent/40 animate-[pulse_1s_ease-in-out_infinite_0.4s]" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
