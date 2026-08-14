/**
 * Button — Premium minimalist button component.
 * 
 * @param {string} variant - 'primary' | 'secondary'
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {string} className - Additional Tailwind classes
 * @param {function} onClick
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  children,
}) {
  const baseClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClass}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed transform-none' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span>...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
