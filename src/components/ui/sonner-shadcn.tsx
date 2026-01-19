import * as React from "react";
import { Toaster as SonnerPrimitive, toast } from "sonner";
// import { cn } from "@/lib/utils"; // Removido: 'cn' não é utilizado

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>;

function SonnerToaster({ ...props }: ToasterProps) {
  // O useTheme não está definido neste escopo, assumindo que ele viria de 'next-themes'
  // Para fins de correção de compilação, vamos mockar ou remover se não for essencial para este componente
  // Se 'next-themes' for necessário, ele precisa ser importado e configurado corretamente.
  // Por enquanto, para resolver o erro de compilação, vou remover o uso de useTheme
  // e definir um tema padrão ou deixar o sonner usar seu padrão.
  // Se 'next-themes' for parte da sua configuração, por favor, me avise para reintroduzi-lo.
  // const { theme: systemTheme } = useTheme();
  // const theme = systemTheme === "system" ? "dark" : systemTheme;
  const theme = "system"; // Tema padrão para evitar erro de compilação

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