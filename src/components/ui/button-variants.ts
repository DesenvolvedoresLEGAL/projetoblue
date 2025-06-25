import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-legal-primary dark:focus-visible:ring-legal-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-legal-primary text-white hover:bg-legal-primary-light dark:bg-legal-primary dark:hover:bg-legal-primary-light shadow-legal",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-legal",
        outline:
          "border border-legal-primary text-legal-primary bg-transparent hover:bg-legal-primary/10 dark:border-legal-secondary dark:text-legal-secondary dark:hover:bg-legal-secondary/10 shadow-legal-sm",
        secondary:
          "bg-legal-secondary text-legal-dark hover:bg-legal-secondary-light dark:bg-legal-secondary dark:text-bg-primary-dark dark:hover:bg-legal-secondary-light shadow-legal",
        ghost:
          "bg-transparent text-legal-primary hover:bg-legal-primary/10 dark:text-legal-secondary dark:hover:bg-legal-secondary/10",
        link:
          "text-legal-primary underline-offset-4 hover:underline hover:text-legal-primary-light dark:text-legal-secondary dark:hover:text-legal-secondary-light",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

