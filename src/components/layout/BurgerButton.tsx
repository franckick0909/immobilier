'use client'

interface BurgerButtonProps {
  isOpen: boolean
  onClick: () => void
}


export function BurgerButton({ isOpen, onClick }: BurgerButtonProps) {
  return (


    <button
      type="button"
      onClick={onClick}
      className="relative w-10 h-10 focus:outline-none z-[1000]"
    >
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        {/* Les trois barres */}
        <div className="flex flex-col gap-1">
        <div className={`w-7 h-[3px] bg-gray-900 rounded-sm transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : ""}`}></div>
      <div className={`w-7 h-[3px] bg-gray-900 rounded-sm transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></div>
      <div className={`w-7 h-[3px] bg-gray-900 rounded-sm transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}></div>
      </div>
      </div>
    </button>
  )
}