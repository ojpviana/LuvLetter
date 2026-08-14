import { useState } from 'react'

export default function PhotoInventory({ photos = [] }) {
  const [selected, setSelected] = useState(null)

  if (!photos || photos.length === 0) return null

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((photo, index) => {
          const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-2'
          const mt = index % 3 === 1 ? 'md:mt-6' : ''
          
          return (
            <div
              key={photo.id}
              className={`bg-white p-3 pb-8 shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 ${rotation} ${mt}`}
              onClick={() => setSelected(photo)}
            >
              <img
                src={photo.url}
                alt={`Memória ${index + 1}`}
                className="w-full h-48 md:h-56 object-cover bg-stone-50"
              />
            </div>
          )
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-3xl w-full p-4 bg-white shadow-lg rounded-sm" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.url}
              alt="Foto ampliada"
              className="w-full max-h-[80vh] object-contain"
            />
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-rose-400 transition-colors bg-white rounded-full p-2"
              onClick={() => setSelected(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
