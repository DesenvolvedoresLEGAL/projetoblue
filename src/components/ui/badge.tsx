
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: 
          "border-transparent bg-legal-primary text-white hover:bg-legal-primary-light dark:bg-legal-primary dark:hover:bg-legal-primary-light shadow-legal-sm",
        secondary:
          "border-transparent bg-legal-secondary/50 text-legal-dark hover:bg-legal-secondary hover:text-bg-primary-dark dark:bg-legal-secondary/50 dark:text-legal-dark dark:hover:bg-legal-secondary shadow-legal-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-legal-sm",
        outline: 
          "border-legal-primary text-legal-primary bg-transparent hover:bg-legal-primary/10 dark:border-legal-secondary dark:text-legal-secondary dark:hover:bg-legal-secondary/10",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-legal-sm",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/90 shadow-legal-sm",
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
