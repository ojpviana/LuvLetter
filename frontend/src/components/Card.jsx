/**
 * Card — Premium minimalist container.
 * 
 * @param {string} className - Additional Tailwind classes
 * @param {React.ReactNode} children
 */
export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-fade-in-up ${className}`}>
      {children}
    </div>
  )
}
