import { forwardRef, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <motion.div whileFocus={{ scale: 1.01 }}>
          <input
            ref={ref}
            className={`
              w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 
              placeholder:text-gray-400
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }