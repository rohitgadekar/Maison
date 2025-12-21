
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Offline = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto animate-fade-in">
                <div className="w-24 h-24 bg-accent/5 rounded-[2rem] flex items-center justify-center mb-12 border border-accent/10 shadow-[0_0_50px_-10px_rgba(255,255,255,0.1)]">
                    <WifiOff className="w-10 h-10 text-accent/80" />
                </div>

                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-6 block animate-pulse">
                    Signal Dissolved
                </span>

                <h1 className="font-heading text-6xl md:text-7xl font-bold tracking-tighter text-white mb-8">
                    Offline <span className="font-serif italic font-light text-white/40">Mode.</span>
                </h1>

                <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-8" />

                <p className="text-white/40 font-medium text-sm leading-relaxed mb-12 tracking-wide">
                    The connection to our digital atelier has been momentarily severed.
                    Please verify your network protocol to resume the experience.
                </p>

                <Button
                    onClick={() => window.location.reload()}
                    className="h-16 px-12 bg-white text-black hover:bg-accent hover:text-white rounded-full transition-all duration-500 font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.5)] flex items-center gap-3"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reconnect
                </Button>

                <p className="fixed bottom-12 text-[10px] font-black uppercase tracking-widest text-white/20">
                    Maison Digital &copy; 2025
                </p>
            </div>
        </div>
    );
};

export default Offline;
