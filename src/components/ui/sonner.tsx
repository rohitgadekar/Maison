import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-left"
      expand={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-primary group-[.toaster]:border-accent/10 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-[.toaster]:rounded-[2rem] group-[.toaster]:p-6 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border",
          description: "group-[.toast]:text-primary/40 group-[.toast]:text-[10px] group-[.toast]:font-medium group-[.toast]:italic",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:text-[10px] group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:h-10 group-[.toast]:px-6",
          cancelButton: "group-[.toast]:bg-accent/5 group-[.toast]:text-accent group-[.toast]:rounded-full group-[.toast]:text-[10px] group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-widest group-[.toast]:h-10 group-[.toast]:px-6",
          title: "group-[.toast]:text-[11px] group-[.toast]:font-black group-[.toast]:uppercase group-[.toast]:tracking-[0.2em] group-[.toast]:text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
