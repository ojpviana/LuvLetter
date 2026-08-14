import { useState } from 'react'

/**
 * Envelope — Animated minimalist envelope with pulsing seal.
 *
 * @param {function} onOpen - Called after the opening animation finishes
 */
export default function Envelope({ onOpen }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleClick() {
    if (isOpen) return
    setIsOpen(true)
    setTimeout(() => {
      onOpen?.()
    }, 1300) // Aguarda animação de abertura
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleClick}
        aria-label="Abrir a carta de amor"
        className={`relative focus:outline-none ${
          isOpen
            ? 'pointer-events-none'
            : 'cursor-pointer transition-transform duration-300 hover:scale-[1.03]'
        }`}
      >
        {/* Sombra suave que cresce ao abrir */}
        <div
          className={`absolute inset-0 rounded-sm transition-all duration-700 ${
            isOpen ? 'shadow-2xl scale-105' : 'shadow-md'
          }`}
          style={{ zIndex: -1 }}
        />

        <div className="envelope-wrapper relative w-80 h-52 flex items-center justify-center">

          {/* Corpo do envelope */}
          <div className="absolute inset-0 bg-stone-100 border border-gray-200 rounded-sm z-0" />

          {/* Triângulos laterais (visual) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: `
                linear-gradient(to bottom-right, #F5F0EE 50%, transparent 50%) top left / 160px 104px no-repeat,
                linear-gradient(to bottom-left,  #F5F0EE 50%, transparent 50%) top right / 160px 104px no-repeat,
                linear-gradient(to top-right,    #FAFAF9 50%, transparent 50%) bottom left / 160px 104px no-repeat,
                linear-gradient(to top-left,     #FAFAF9 50%, transparent 50%) bottom right / 160px 104px no-repeat
              `,
            }}
          />

          {/* Carta interna */}
          <div
            className={`envelope-letter absolute w-72 h-44 bg-white border border-gray-100 shadow-sm z-20 flex flex-col items-center justify-center ${
              isOpen ? 'open' : ''
            }`}
          >
            <span className="font-serif text-3xl text-rose-300 mb-2">♥</span>
            <div className="w-16 h-[1px] bg-rose-100 mb-2" />
            <div className="w-10 h-[1px] bg-rose-100" />
          </div>

          {/* Aba superior (flap) */}
          <div
            className={`envelope-flap absolute top-0 left-0 w-full z-30 pointer-events-none ${
              isOpen ? 'open' : ''
            }`}
            style={{
              borderLeft:  '160px solid transparent',
              borderRight: '160px solid transparent',
              borderTop:   '104px solid #EDE9E7',
              height: 0,
            }}
          />

          {/* Lacre com pulso (Pixel Art Logo) */}
          <div
            className={`absolute top-[36%] z-40 flex items-center justify-center transition-opacity duration-300 ${
              isOpen ? 'opacity-0 envelope-seal open' : 'opacity-100 envelope-seal'
            }`}
          >
            <img src="/logo-envelope.png" alt="Lacre LuvLetter" className="w-16 h-16 object-contain image-rendering-pixelated drop-shadow-lg" />
          </div>
        </div>
      </button>

      {/* Texto de dica */}
      {!isOpen && (
        <div className="font-sans text-xs text-gray-400 uppercase tracking-widest animate-fade-in-up">
          Toque no lacre para abrir
        </div>
      )}
    </div>
  )
}
