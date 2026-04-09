import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--pw-blue-600)] focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--pw-greyscale-1000)] text-white hover:bg-[var(--pw-blue-800)] focus:bg-[var(--pw-blue-900)]",
        primary: "bg-[var(--pw-greyscale-1000)] text-white hover:bg-[var(--pw-blue-800)] focus:bg-[var(--pw-blue-900)]",
        destructive:
          "bg-gradient-to-r from-[#FF3A44] to-[#C31162] text-white hover:opacity-95 focus:opacity-95",
        outline:
          "border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent/50",
        secondary:
          "bg-[var(--pw-greyscale-200)] text-[var(--pw-greyscale-1000)] hover:bg-[var(--pw-greyscale-300)]",
        ghost:
          "hover:bg-[var(--pw-greyscale-200)] hover:text-[var(--pw-greyscale-1000)]",
        link: "text-[var(--pw-blue-600)] underline-offset-4 hover:underline",
        gradient: "bg-gradient-primary text-white hover:opacity-90",
        hairline: "bg-transparent border border-[var(--pw-greyscale-1000)] text-[var(--pw-greyscale-1000)] hover:border-[var(--pw-blue-900)] hover:text-[var(--pw-blue-900)]",
        hairlineSecondary: "bg-transparent border border-[var(--pw-greyscale-400)] text-[var(--pw-greyscale-1000)] hover:border-[var(--pw-greyscale-500)] hover:text-[var(--pw-greyscale-1000)]",
        overlay: "backdrop-blur-[56px] bg-[rgba(0,0,0,0.4)] text-white hover:brightness-90",
        terminal: "bg-[var(--red-error)] text-white hover:brightness-95",
        terminalSecondary: "bg-[#ffe9e5] text-[var(--red-error)] hover:brightness-95",
      },
      size: {
        xs: "h-7 min-w-[64px] px-3 text-[var(--font-body-2-heavy)] [&_svg]:size-2.5",
        sm: "h-8 min-w-[68px] px-3.5 text-[var(--font-body-2-heavy)] [&_svg]:size-2.5",
        default: "h-9 px-4 text-[var(--font-body-1-heavy)]",
        md: "h-10 min-w-[92px] px-4 text-[var(--font-body-1-heavy)]",
        lg: "h-12 min-w-[92px] px-5.5 text-[var(--font-body-1-heavy)]",
        icon: "size-9 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-md": "size-10 rounded-full",
        "icon-lg": "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, type ButtonProps }
