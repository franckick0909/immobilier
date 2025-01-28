import { ButtonHTMLAttributes, FC } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
}

const Button: FC<ButtonProps> = ({
  children,
  className = '',
  isLoading = false,
  variant = 'primary',
  ...props
}) => {
  const baseStyles = 'rounded-md px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <button
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : (
          children
        )}
      </button>
    </motion.div>
  )
}

export { Button }