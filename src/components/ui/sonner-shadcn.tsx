import { useTheme } from "next-themes";
import { Toaster as SonnerPrimitive, toast } from "sonner"; // <--- Renomeado o import local para SonnerPrimitive
import * as React from "react";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>; // <--- Usando SonnerPrimitive

function SonnerToaster({ ...props }: ToasterProps) { // <--- Renomeado o componente exportado
  const { theme: systemTheme } = useTheme();
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

export { SonnerToaster, toast }; // <--- Exportando o componente renomeado