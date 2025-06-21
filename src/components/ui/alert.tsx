
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground animate-fadeIn shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white text-foreground border-charity-primary/30 shadow-charity-primary/5",
        destructive:
          "border-charity-destructive/30 bg-charity-destructive/15 text-charity-destructive dark:border-charity-destructive [&>svg]:text-charity-destructive shadow-charity-destructive/5",
        success:
          "border-charity-success/30 bg-charity-success/15 text-charity-success dark:border-charity-success [&>svg]:text-charity-success shadow-charity-success/5",
        warning:
          "border-charity-warning/30 bg-charity-warning/15 text-charity-warning dark:border-charity-warning [&>svg]:text-charity-warning shadow-charity-warning/5",
        info:
          "border-charity-info/30 bg-charity-info/15 text-charity-info dark:border-charity-info [&>svg]:text-charity-info shadow-charity-info/5",
        accent:
          "border-charity-accent/30 bg-charity-accent/15 text-charity-dark dark:border-charity-accent [&>svg]:text-charity-dark shadow-charity-accent/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
