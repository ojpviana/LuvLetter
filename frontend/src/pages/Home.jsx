import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import Button from '../components/Button'
import Card from '../components/Card'
const STEPS = [
  { label: 'De', field: 'player1_name', placeholder: 'Seu nome', icon: '✎' },
  { label: 'Para', field: 'player2_name', placeholder: 'Nome do seu amor', icon: '♥' },
  { label: 'Tempo Juntos', field: 'time_together', placeholder: 'Ex: 2 anos e 3 meses', icon: '⏳' },
  { label: 'Estilo do Casal', field: 'couple_style', isOptions: true },
  { label: 'Interesses', field: 'interests', isInterests: true },
  {
    label: 'Memórias & Detalhes',
    field: 'traits',
    placeholder: 'Apelidos, viagens, manias, momentos que só vocês entendem...',
    icon: '✧',
    isTextarea: true,
  },
]

const STYLE_OPTIONS = [
  { id: 'romantico',   label: 'Românticos',    emoji: '🌹' },
  { id: 'divertido',   label: 'Divertidos',    emoji: '😂' },
  { id: 'aventureiro', label: 'Aventureiros',   emoji: '✈️' },
  { id: 'caseiro',     label: 'Caseiros',       emoji: '🛋️' },
]

const INTERESTS_BY_STYLE = {
  romantico: [
    { id: 'Jantar Especial',   label: 'Jantar especial',     emoji: '🕯️' },
    { id: 'Vinho',             label: 'Vinho',               emoji: '🍷' },
    { id: 'Viagens',           label: 'Viagens',             emoji: '✈️' },
    { id: 'Cinema',            label: 'Cinema',              emoji: '🎬' },
    { id: 'Flores',            label: 'Flores',              emoji: '🌹' },
    { id: 'Spa',               label: 'Spa & Relax',         emoji: '💆' },
    { id: 'Livros',            label: 'Leitura a dois',      emoji: '📖' },
    { id: 'Pôr do Sol',        label: 'Pôr do sol',          emoji: '🌅' },
    { id: 'Dança',             label: 'Dançar',              emoji: '💃' },
    { id: 'Culinária',         label: 'Cozinhar juntos',     emoji: '🍝' },
    { id: 'Música ao Vivo',    label: 'Shows ao vivo',       emoji: '🎶' },
    { id: 'Fotografia',        label: 'Fotografia',          emoji: '📷' },
  ],
  divertido: [
    { id: 'Jogos',             label: 'Jogos',               emoji: '🎮' },
    { id: 'Pizza',             label: 'Pizza',               emoji: '🍕' },
    { id: 'Séries',            label: 'Séries',              emoji: '🎬' },
    { id: 'Festas',            label: 'Festas',              emoji: '🎉' },
    { id: 'Academia',          label: 'Academia',            emoji: '🏋️' },
    { id: 'Memes',             label: 'Memes & Humor',       emoji: '😂' },
    { id: 'Karaokê',           label: 'Karaokê',             emoji: '🎤' },
    { id: 'Churrasco',         label: 'Churrasco',           emoji: '🍖' },
    { id: 'Barzinho',          label: 'Barzinho',            emoji: '🍺' },
    { id: 'Viagem Surpresa',   label: 'Viagem surpresa',     emoji: '🗺️' },
    { id: 'Esportes',          label: 'Esportes',            emoji: '⚽' },
    { id: 'Kart',              label: 'Kart & adrenalina',   emoji: '🏎️' },
  ],
  aventureiro: [
    { id: 'Viagens',           label: 'Viagens',             emoji: '✈️' },
    { id: 'Camping',           label: 'Camping',             emoji: '🏕️' },
    { id: 'Trilhas',           label: 'Trilhas',             emoji: '🥾' },
    { id: 'Surf',              label: 'Surf',                emoji: '🏄' },
    { id: 'Ciclismo',          label: 'Ciclismo',            emoji: '🚴' },
    { id: 'Esportes',          label: 'Esportes radicais',   emoji: '⚡' },
    { id: 'Mergulho',          label: 'Mergulho',            emoji: '🤿' },
    { id: 'Escalada',          label: 'Escalada',            emoji: '🧗' },
    { id: 'Moto',              label: 'Moto & estradas',     emoji: '🏍️' },
    { id: 'Snowboard',         label: 'Snow & esqui',        emoji: '🏂' },
    { id: 'Paraquedas',        label: 'Paraquedismo',        emoji: '🪂' },
    { id: 'Praia',             label: 'Praia & mar',         emoji: '🏖️' },
  ],
  caseiro: [
    { id: 'Séries',            label: 'Netflix & Séries',    emoji: '📺' },
    { id: 'Cozinhar',          label: 'Cozinhar juntos',     emoji: '🍳' },
    { id: 'Pet',               label: 'Pais de Pet',         emoji: '🐾' },
    { id: 'Leitura',           label: 'Leitura',             emoji: '📚' },
    { id: 'Música',            label: 'Música',              emoji: '🎵' },
    { id: 'Plantas',           label: 'Plantas',             emoji: '🌱' },
    { id: 'Café da Manhã',     label: 'Café da manhã',       emoji: '☕' },
    { id: 'Filmes',            label: 'Maratona de filmes',  emoji: '🎥' },
    { id: 'Board Games',       label: 'Board games',         emoji: '♟️' },
    { id: 'Delivery',          label: 'Delivery em casa',    emoji: '🛵' },
    { id: 'Artesanato',        label: 'DIY & artesanato',    emoji: '🎨' },
    { id: 'Pijama',            label: 'Dia de pijama',       emoji: '🛋️' },
  ],
}

const MAX_INTERESTS = 3

export default function Home() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    player1_name: '',
    player2_name: '',
    time_together: '',
    couple_style: '',
    interests: [],
    traits: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const currentValue = currentStep.isInterests
    ? formData.interests
    : formData[currentStep.field]

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [currentStep.field]: e.target.value }))
    setError('')
  }

  function handleStyleSelect(id) {
    setFormData((prev) => ({
      ...prev,
      couple_style: id,
      interests: [],
    }))
    setError('')
  }

  function handleInterestToggle(id) {
    setFormData((prev) => {
      const current = prev.interests
      const isSelected = current.includes(id)
      if (isSelected) {
        return { ...prev, interests: current.filter((i) => i !== id) }
      }
      if (current.length >= MAX_INTERESTS) return prev
      return { ...prev, interests: [...current, id] }
    })
    setError('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !currentStep.isTextarea && !currentStep.isOptions && !currentStep.isInterests) {
      handleNext()
    }
  }

  function handleNext() {
    if (currentStep.isOptions && !formData.couple_style) {
      setError('Escolha o estilo do casal para continuar.')
      return
    }
    if (!currentStep.isOptions && !currentStep.isInterests) {
      const val = formData[currentStep.field]
      if (!val || !String(val).trim()) {
        setError('Por favor, preencha este campo para continuar.')
        return
      }
    }

    if (isLastStep) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
      setError('')
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        player1_name: formData.player1_name,
        player2_name: formData.player2_name,
        time_together: formData.time_together,
        couple_style: formData.couple_style,
        interests: formData.interests.length > 0 ? formData.interests.join(',') : '',
        traits: formData.traits,
      }
      const res = await axios.post('/api/gifts', payload)
      navigate(`/upload/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar a cápsula. Tente novamente.')
      setLoading(false)
    }
  }

  const progressPercent = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex flex-col  text-gray-800 overflow-x-hidden">
      <Helmet>
        <title>LuvLetter — Presenteie com Cartas de Amor Geradas por IA</title>
        <meta name="description" content="Surpreenda seu amor com uma carta romântica personalizada gerada por Inteligência Artificial. O presente digital perfeito para o Dia dos Namorados, aniversários e datas especiais." />
      </Helmet>
      <div className="relative z-10 flex flex-col min-h-screen">

        <header className="pt-16 pb-8 text-center px-4 animate-fade-in-up relative z-50">
          <h1 className="font-serif text-3xl md:text-5xl text-gray-900 tracking-tight">
            LuvLetter
            <span className="block text-xl md:text-2xl mt-3 text-rose-400 font-sans tracking-normal font-medium">Cartas de Amor Geradas por IA</span>
          </h1>
          <p className="font-sans text-gray-400 text-xs tracking-widest uppercase mt-3">
            Uma surpresa inesquecível
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Card>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-xs text-gray-400 uppercase tracking-widest">
                    Passo {step + 1} de {STEPS.length}
                  </span>
                  <span className="font-sans text-xs text-gray-300">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full h-[2px] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-300 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <label className="block font-serif text-xl text-gray-800 mb-6 flex items-center gap-2">
                {currentStep.icon && (
                  <span className="text-rose-300 text-2xl">{currentStep.icon}</span>
                )}
                {currentStep.label}
              </label>

              {currentStep.isOptions && (
                <div className="grid grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleStyleSelect(opt.id)}
                      className={`btn-option ${formData.couple_style === opt.id ? 'selected' : ''}`}
                    >
                      <span className="font-sans text-sm font-medium text-center text-gray-700">
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {currentStep.isInterests && (() => {
                const options = INTERESTS_BY_STYLE[formData.couple_style] || []
                return (
                  <div className="space-y-4">
                    <p className="font-sans text-sm text-gray-400">
                      Escolha até {MAX_INTERESTS} interesses do casal{' '}
                      <span className="text-gray-300">
                        ({formData.interests.length}/{MAX_INTERESTS})
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = formData.interests.includes(opt.id)
                        const isDisabled = !isSelected && formData.interests.length >= MAX_INTERESTS
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => !isDisabled && handleInterestToggle(opt.id)}
                            className={`tag-pill ${isSelected ? 'selected' : ''} ${
                              isDisabled ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                          >
                            <span>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                    <p className="font-sans text-xs text-gray-400 italic">
                      Opcional — você pode pular esta etapa.
                    </p>
                  </div>
                )
              })()}

              {currentStep.isTextarea && (
                <textarea
                  className="input-minimal resize-none h-32"
                  placeholder={currentStep.placeholder}
                  value={currentValue}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}

              {!currentStep.isOptions && !currentStep.isInterests && !currentStep.isTextarea && (
                <input
                  className="input-minimal text-lg py-4"
                  type="text"
                  placeholder={currentStep.placeholder}
                  value={currentValue}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}

              {error && (
                <p className="font-sans text-sm text-red-400 mt-4">{error}</p>
              )}

              <div className="flex gap-4 mt-10 justify-between items-center">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setStep((s) => s - 1); setError('') }}
                    className="font-sans text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
                  >
                    ← Voltar
                  </button>
                ) : <div />}

                <Button
                  variant="primary"
                  onClick={handleNext}
                  loading={loading}
                >
                  {loading
                    ? 'Criando...'
                    : isLastStep
                    ? 'Gerar Carta ♥'
                    : currentStep.isInterests
                    ? formData.interests.length > 0 ? 'Continuar' : 'Pular →'
                    : 'Continuar'}
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <footer className="text-center py-8 font-sans text-gray-300 text-xs tracking-wider">
          LuvLetter © 2026 — Feito com amor
        </footer>
      </div>
    </div>
  )
}
