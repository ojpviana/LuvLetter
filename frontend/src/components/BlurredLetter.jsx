export default function BlurredLetter({ text, isBlurred = false, onPay }) {
  const isObj = text && typeof text === 'object';
  const titulo = isObj ? text.titulo : '';
  const intro = isObj ? text.introducao : text;
  const corpo = isObj ? text.corpo_principal : '';
  const fechamento = isObj ? text.fechamento : '';

  return (
    <div className="relative">
      <div className="font-serif leading-[1.95] text-lg text-gray-700 whitespace-pre-wrap">
        {titulo && <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">{titulo}</h2>}
        <p className="mb-4">{intro}</p>

        {/* The blurred section */}
        <div 
          className={`transition-all duration-500 ${isBlurred ? 'select-none blur-md opacity-60 h-28 overflow-hidden' : ''}`}
          style={{ userSelect: isBlurred ? 'none' : 'text' }}
        >
          {corpo && <p className="mb-4">{corpo}</p>}
          {fechamento && <p className="italic text-gray-500 text-right mt-6">{fechamento}</p>}
        </div>
      </div>

      {isBlurred && (
        <div className="relative z-10 flex flex-col items-center justify-center -mt-20 pb-4">
          {/* Fundo em gradiente suave para mesclar com o texto cortado */}
          <div className="absolute inset-x-0 top-[-50px] bottom-0 bg-gradient-to-t from-stone-50 via-stone-50/80 to-transparent -z-10 pointer-events-none"></div>
          
          <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-center border border-rose-100/50 w-full max-w-sm mx-auto">
            <div className="flex justify-center mb-4 opacity-80">
              <img src="/logo-envelope.png" className="w-12 h-12 object-contain image-rendering-pixelated" alt="Logo LuvLetter" />
            </div>
            <h4 className="font-serif text-xl sm:text-2xl text-gray-900 mb-2">Continue lendo...</h4>
            <p className="font-sans text-xs sm:text-sm text-gray-500 mb-6">Desbloqueie a carta completa e libere a cápsula digital eterna.</p>
            
            {onPay && (
              <button 
                onClick={onPay} 
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-medium py-3 sm:py-4 rounded-xl shadow-lg shadow-rose-200 transition-all text-xs sm:text-sm uppercase tracking-wider"
              >
                Desbloquear por R$ 9,90
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
