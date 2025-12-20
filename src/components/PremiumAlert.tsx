import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertCircle } from "lucide-react";

interface PremiumAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
}

export const PremiumAlert = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    cancelText = "Cancel",
    confirmText = "Delete"
}: PremiumAlertProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {/* 
                We use bg-[#111] (dark) on the container to match the header, preventing white fringe/border artifacts 
                on the top rounded corners. The bottom content area gets its own bg-white.
            */}
            <AlertDialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] bg-[#111] border-none outline-none ring-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] data-[state=open]:border-none">
                {/* Decorative Header */}
                <div className="bg-[#111] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Trash2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-heading text-xl font-bold tracking-tight uppercase italic">{title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Irreversible Action</p>
                        </div>
                    </div>
                </div>

                {/* Body Content - Explicitly white background */}
                <div className="p-8 space-y-8 bg-white">
                    <div className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-rose-50 border border-rose-100/50">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <AlertDialogDescription className="text-sm font-medium text-primary/70 leading-relaxed italic">
                            {description}
                        </AlertDialogDescription>
                    </div>

                    <AlertDialogFooter className="flex gap-4 sm:space-x-0">
                        <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-accent/10 bg-accent/5 text-primary text-xs font-black uppercase tracking-widest hover:bg-accent/10 hover:text-accent transition-all">
                            {cancelText}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onConfirm}
                            className="flex-1 h-14 rounded-2xl bg-[#111] text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all hover:shadow-rose-600/20"
                        >
                            {confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
