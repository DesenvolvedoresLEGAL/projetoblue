
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-transparent bg-[#4d2bfb] text-white hover:bg-[#020cbc]", // Azul LEGAL para o principal, escurecendo no hover
        secondary:
          "border-transparent bg-[#03f9ff]/50 text-[#020cbc] hover:bg-[#4d2bfb]/80 hover:text-white", // Ciano LEGAL como base, Azul LEGAL no hover
        destructive:
          "border-transparent bg-[#ef4444] text-white hover:bg-[#bc0c0c]", // Vermelho LEGAL
        outline: 
          "border-[#4d2bfb] text-[#4d2bfb] bg-transparent hover:bg-[#4d2bfb]/10", // Outline LEGAL
        success:
          "border-transparent bg-[#84cc16] text-white hover:bg-[#6ba60c]", // Verde para sucesso
        warning:
          "border-transparent bg-[#f97316] text-white hover:bg-[#bc7202]", // Laranja LEGAL para warning
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
