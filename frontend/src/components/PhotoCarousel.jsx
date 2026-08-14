import { useState } from 'react'

export default function PhotoCarousel({ photos = [] }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(null)

  if (!photos || photos.length === 0) return null

  function prev() {
    setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1))
  }

  function next() {
    setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1))
  }

  return (
    <div className="w-full select-none">
      <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '4/3' }}>
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="absolute inset-0 transition-all duration-500 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1)' : 'scale(0.97)',
              pointerEvents: i === current ? 'auto' : 'none',
            }}
          >
            <img
              src={photo.url}
              alt={`Memória ${i + 1}`}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightbox(photo)}
            />
          </div>
        ))}

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-white hover:text-rose-400 transition-all duration-200 z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-white hover:text-rose-400 transition-all duration-200 z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full z-10">
            {current + 1} / {photos.length}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Foto ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-2 bg-rose-300'
                  : 'w-2 h-2 bg-gray-200 hover:bg-rose-200'
              }`}
            />
          ))}
        </div>
      )}

      {photos.length > 2 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden transition-all duration-200 ${
                i === current ? 'ring-2 ring-rose-300 ring-offset-1 opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={photo.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.url}
              alt="Foto ampliada"
              className="w-full max-h-[85vh] object-contain rounded-sm"
            />
            <button
              onClick={() => setLightbox(null)}
              aria-label="Fechar"
              className="absolute -top-4 -right-4 w-9 h-9 bg-white text-gray-600 hover:text-rose-400 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
