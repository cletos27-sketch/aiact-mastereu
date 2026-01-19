import { useTheme } from "next-themes"; // <--- Import adicionado
import { Toaster as SonnerPrimitive, toast } from "sonner";
import * as React from "react";
// import { cn } from "@/lib/utils"; // Removido: 'cn' não é utilizado

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>;

function SonnerToaster({ ...props }: ToasterProps) {
  const { theme: systemTheme } = useTheme(); // Agora useTheme está disponível
  const theme = systemTheme === "system" ? "dark" : systemTheme;

  return (
    <SonnerPrimitive
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { SonnerToaster, toast };