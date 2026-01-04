import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface SizeChartData {
    headers: string[];
    rows: string[][];
}

interface SizeChartProps {
    data: SizeChartData | string | null;
}

export function SizeChart({ data }: SizeChartProps) {
    const [unit, setUnit] = useState<'IN' | 'CM'>('IN');

    if (!data) return null;

    // Handle legacy string URL case gracefully
    if (typeof data === 'string') {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-accent hover:underline decoration-accent underline-offset-4">
                        Size Guide +
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] bg-[#FFFAF5] border-accent/10 rounded-[2rem] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-8 pr-16 sm:pr-20 pb-0 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent block mb-2">Reference Protocol</span>
                        <DialogTitle className="font-heading text-3xl font-bold">Size Guide.</DialogTitle>
                    </DialogHeader>
                    <div
                        data-lenis-prevent
                        className="p-8 overflow-y-auto flex-1"
                    >
                        <img src={data} alt="Size Chart" className="w-full rounded-xl border border-accent/10" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Handle structured table data
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-[9px] font-black uppercase tracking-[0.2em] text-accent hover:underline decoration-accent underline-offset-4">
                    Size Guide +
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] bg-[#FFFAF5] border-accent/10 rounded-[2rem] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 sm:p-8 pr-16 sm:pr-20 pb-4 shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent block mb-2">Measurements & Fit</span>
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="font-heading text-2xl sm:text-3xl font-bold">Size Protocol.</DialogTitle>
                        <div className="flex bg-accent/5 rounded-full p-1 border border-accent/10 shrink-0">
                            <button
                                onClick={() => setUnit('IN')}
                                className={cn(
                                    "px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black transition-all",
                                    unit === 'IN' ? "bg-accent text-white shadow-md" : "text-primary/40 hover:text-accent"
                                )}
                            >
                                IN
                            </button>
                            <button
                                onClick={() => setUnit('CM')}
                                className={cn(
                                    "px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black transition-all",
                                    unit === 'CM' ? "bg-accent text-white shadow-md" : "text-primary/40 hover:text-accent"
                                )}
                            >
                                CM
                            </button>
                        </div>
                    </div>
                </DialogHeader>
                <div
                    data-lenis-prevent
                    className="flex-1 overflow-auto p-4 sm:p-8 pt-0 scrollbar-thin scrollbar-thumb-accent/20"
                >
                    <div className="min-w-[600px] sm:min-w-0">
                        <table className="w-full text-xs sm:text-sm border-collapse">
                            <thead>
                                <tr>
                                    {data.headers.map((header, i) => (
                                        <th key={i} className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/60 border-b-2 border-accent/10 text-left bg-accent/5 first:rounded-tl-xl last:rounded-tr-xl">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows.map((row, i) => (
                                    <tr key={i} className="border-b border-accent/5 hover:bg-white/50 transition-colors">
                                        {row.map((cell, j) => (
                                            <td key={j} className="p-3 sm:p-4 font-medium text-primary/80 tabular-nums">
                                                {convertValue(cell, unit, data.headers[j])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-6 text-[9px] sm:text-[10px] text-primary/40 italic text-center">
                        All measurements in {unit === 'IN' ? 'inches' : 'centimeters'} unless otherwise specified. Fit may vary by style.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper functions for smart conversion
const MEASUREMENT_KEYWORDS = ['chest', 'waist', 'hip', 'inseam', 'length', 'sleeve', 'shoulder', 'width', 'rise', 'opening', 'foot', "eu"];

function shouldConvert(header: string): boolean {
    const normalized = header.toLowerCase().trim();
    return MEASUREMENT_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function convertValue(value: string, targetUnit: 'IN' | 'CM', header: string): string {
    // If unit is IN, return original value (assuming input is IN)
    if (targetUnit === 'IN') return value;

    // Only convert if header matches measurement keywords
    if (!shouldConvert(header)) return value;

    const convertSingle = (val: string) => {
        const num = parseFloat(val.trim());
        if (isNaN(num)) return val.trim();
        // Convert IN to CM (x 2.54)
        const cm = Math.round(num * 2.54 * 10) / 10;
        return cm.toString();
    };

    // Handle ranges like "34-36"
    if (value.includes('-')) {
        return value.split('-').map(val => convertSingle(val)).join(' - ');
    }

    return convertSingle(value);
}
