import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import Button from '../components/Button'
import Card from '../components/Card'

const MAX_FILES = 6

export default function Upload() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const handleLogoClick = useCallback(() => {
    navigate('/')
  }, [navigate])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('')

    if (rejectedFiles.length > 0) {
      setError('Alguns arquivos foram rejeitados. Use apenas imagens (JPEG, PNG, WebP) até 10MB.')
    }

    const remaining = MAX_FILES - photos.length
    const newFiles = acceptedFiles.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    }))

    setPhotos((prev) => [...prev, ...newFiles])
  }, [photos.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxFiles: MAX_FILES,
    maxSize: 10 * 1024 * 1024,
    disabled: photos.length >= MAX_FILES,
  })

  function removePhoto(photoId) {
    setPhotos((prev) => {
      const removed = prev.find((p) => p.id === photoId)
      if (removed) URL.revokeObjectURL(removed.preview)
      return prev.filter((p) => p.id !== photoId)
    })
  }

  async function handleUploadAndGenerate() {
    if (photos.length === 0) {
      setError('Adicione pelo menos 1 foto para continuar!')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      photos.forEach((p) => formData.append('photos', p.file))

      await axios.post(`/api/gifts/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded / e.total) * 80)
          setUploadProgress(progress)
        },
      })

      setUploadProgress(85)
      setUploading(false)
      setGenerating(true)

      await axios.post(`/api/gifts/${id}/generate`)
      setUploadProgress(100)

      localStorage.setItem('pending_gift_id', id)
      setTimeout(() => navigate(`/checkout/${id}`), 500)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar fotos. Tente novamente.')
      setUploading(false)
      setGenerating(false)
      setUploadProgress(0)
    }
  }

  async function handleSkip() {
    setGenerating(true)
    setError('')
    try {
      await axios.post(`/api/gifts/${id}/generate`)
    } catch (_) {
      // Se falhar, o questController vai auto-gerar ao abrir a Quest
    } finally {
      localStorage.setItem('pending_gift_id', id)
      navigate(`/checkout/${id}`)
    }
  }

  const isProcessing = uploading || generating

  return (
    <div className="min-h-screen flex flex-col  text-gray-800">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <header className="pt-12 pb-8 text-center px-4">
        <button
          onClick={handleLogoClick}
          className="font-serif text-3xl text-gray-900 hover:text-rose-400 transition-colors cursor-pointer"
        >
          LuvLetter
        </button>
        <div className="flex items-center justify-center gap-4 mt-6">
          {['Dados', 'Fotos', 'Checkout'].map((s, i) => (
            <span
              key={s}
              className={`font-sans text-xs uppercase tracking-widest ${i === 1 ? 'text-rose-400 font-bold' : 'text-gray-400'}`}
            >
              {s}
            </span>
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-2xl space-y-8">
          
          <Card className="p-8">
            <h2 className="font-serif text-2xl text-gray-800 mb-2">Galeria de Memórias</h2>
            <p className="font-sans text-gray-500 leading-relaxed">
              Adicione até 6 fotos especiais de vocês. Elas aparecerão ao final da carta.
            </p>

            <div
              {...getRootProps()}
              className={`
                mt-8 border border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300
                ${isDragActive
                  ? 'border-rose-400 bg-rose-50 scale-[1.02]'
                  : photos.length >= MAX_FILES
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : 'border-gray-300 hover:border-rose-300 hover:bg-stone-100'}
              `}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4 text-gray-300">
                {isDragActive ? '✦' : photos.length >= MAX_FILES ? '✓' : '+'}
              </div>
              <p className="font-sans text-gray-600 font-medium mb-1">
                {isDragActive
                  ? 'Solte as fotos aqui'
                  : photos.length >= MAX_FILES
                  ? 'Galeria cheia'
                  : 'Arraste as fotos ou clique para selecionar'}
              </p>
              <p className="font-sans text-xs text-gray-400">
                {photos.length} de {MAX_FILES} adicionadas
              </p>
            </div>
          </Card>

          {photos.length > 0 && (
            <Card className="p-8">
              <h3 className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-6">
                Fotos Selecionadas ({photos.length}/{MAX_FILES})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="relative group rounded-md overflow-hidden bg-gray-100 aspect-square">
                    <img
                      src={photo.preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removePhoto(photo.id) }}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      disabled={isProcessing}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {error && (
            <p className="text-red-500 text-center text-sm font-medium">
              {error}
            </p>
          )}

          {isProcessing && (
            <Card className="p-8 text-center">
              <p className="font-serif text-lg text-gray-800 mb-4">
                {uploading ? 'Enviando fotos...' : 'Escrevendo a carta...'}
              </p>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-rose-300 transition-all duration-700 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="font-sans text-xs text-gray-400 uppercase tracking-widest">
                {uploadProgress}%
              </p>
            </Card>
          )}

          <div className="flex flex-col items-center gap-6 mt-8">
            <Button
              variant="primary"
              onClick={handleUploadAndGenerate}
              loading={isProcessing}
              disabled={photos.length === 0}
              className="w-full md:w-auto px-12"
            >
              {isProcessing
                ? generating ? 'Escrevendo...' : 'Enviando...'
                : `Gerar Carta (${photos.length} foto${photos.length !== 1 ? 's' : ''})`}
            </Button>

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
              disabled={isProcessing}
            >
              Pular fotos →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
