import { type ButtonHTMLAttributes, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "success"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

export const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, ...props }, ref) => {
    // Map our custom variants to shadcn button variants
    const getVariant = () => {
      switch (variant) {
        case "primary":
          return "default"
        case "success":
          return "default" // We'll customize this with classes
        case "destructive":
          return "destructive"
        default:
          return variant
      }
    }

    return (
      <Button
        ref={ref}
        variant={getVariant()}
        size={size}
        className={cn(
          "font-light",
          variant === "success" && "bg-green-600 hover:bg-green-700 text-white",
          isLoading && "opacity-70 pointer-events-none",
          className,
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </Button>
    )
  },
)

CustomButton.displayName = "CustomButton"

