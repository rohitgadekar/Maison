import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFAF5] selection:bg-accent/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] rotate-[-15deg]">
          <h1 className="font-heading text-[30rem] font-black leading-none uppercase">Archival</h1>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-24 h-24 bg-accent/5 rounded-[2.5rem] flex items-center justify-center mb-12 border border-accent/10 animate-in zoom-in duration-1000 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
          <Search className="w-10 h-10 text-accent relative z-10" />
        </div>

        <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-6 block italic animate-in fade-in slide-in-from-bottom-4 duration-700">
          Registry Error 404
        </span>

        <h1 className="font-heading text-6xl sm:text-8xl font-black mb-8 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Page <span className="italic font-light text-accent">Misplaced.</span>
        </h1>

        <p className="text-primary/40 text-lg sm:text-xl mb-16 italic font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          The archival entry you are seeking appears to have been relocated or has not yet been registered in our central ledger.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          <Link
            to="/"
            className="group h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Return to Atelier
          </Link>
          <Link
            to="/shop"
            className="h-16 px-12 border border-accent/10 font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-accent/5 transition-all active:scale-95"
          >
            Explore Catalog
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-accent/5 w-64 opacity-30">
          <p className="font-heading text-[10px] font-black italic tracking-widest text-primary/40 leading-relaxed uppercase">
            Maison Atelier Archive <br /> Registry Department
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
