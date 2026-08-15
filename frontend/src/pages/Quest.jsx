import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Envelope from '../components/Envelope'
import PhotoCarousel from '../components/PhotoCarousel'
import Card from '../components/Card'
import FloatingHearts from '../components/FloatingHearts'

export default function Quest() {
  const { hash } = useParams()
  const navigate = useNavigate()
  const [gift, setGift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [envelopeState, setEnvelopeState] = useState('closed')
  const [error, setError] = useState('')

  const [searchParams] = useSearchParams()
  const isAutoReturn = searchParams.get('status') === 'approved' || searchParams.get('collection_status') === 'approved'
  const pollCountRef = useRef(0)

  useEffect(() => {
    fetchQuest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  async function fetchQuest() {
    try {
      const res = await axios.get(`/api/quest/${hash}`)
      setGift(res.data)
      // Pagamento confirmado — limpa o ID pendente do localStorage
      localStorage.removeItem('pending_gift_id')
      setLoading(false)
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        if (isAutoReturn && pollCountRef.current < 5) {
          // Webhook pode demorar alguns segundos. Fazer polling.
          pollCountRef.current += 1
          setTimeout(fetchQuest, 3000)
          return
        }
        setError('Este presente ainda não foi liberado. O pagamento está pendente.')
      } else if (status === 404) {
        setError('Carta não encontrada. Verifique o link recebido.')
      } else {
        setError('Erro ao carregar a carta. Tente novamente.')
      }
      setLoading(false)
    }
  }

  function handleEnvelopeOpen() {
    setEnvelopeState('open')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center space-y-4">
          <div className="font-serif text-4xl text-rose-300 animate-pulse">♥</div>
          <p className="font-sans text-xs text-gray-400 uppercase tracking-widest">
            {isAutoReturn && pollCountRef.current > 0 ? 'Confirmando pagamento...' : 'Preparando a carta...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 ">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in-up">
          <div className="text-5xl text-gray-200">✉️</div>
          <Card className="p-8">
            <p className="font-sans text-gray-500 leading-relaxed">{error}</p>
          </Card>
          <button
            onClick={() => navigate('/')}
            className="font-sans text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen flex flex-col  text-gray-800">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>

      <AnimatePresence>
        {envelopeState === 'open' && (
          <motion.header 
            className="text-center pt-16 pb-10 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="font-serif text-rose-300 text-4xl mb-5">♥</div>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
              {gift?.player2_name}
            </h1>
            <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mt-4">
              Juntos há {gift?.time_together}
            </p>
          </motion.header>
        )}
      </AnimatePresence>

      <main className="flex-1 px-4 pb-24 max-w-2xl mx-auto w-full space-y-14">
        
        <AnimatePresence mode="wait">
          {envelopeState === 'closed' ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 0.4 } }}
              className="flex flex-col items-center justify-center min-h-[80vh] w-full"
            >

              <Envelope onOpen={handleEnvelopeOpen} />
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.4, y: 150 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120, duration: 0.8 }}
              className="space-y-14"
            >

              
              <Card className="p-8 md:p-14">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-[1px] bg-rose-100" />
                  <span className="text-rose-200 text-lg">✦</span>
                  <div className="flex-1 h-[1px] bg-rose-100" />
                </div>

                {gift?.generated_letter ? (
                  <div
                    className="font-serif text-gray-700 leading-[1.95] whitespace-pre-wrap flex flex-col gap-4"
                    style={{ fontSize: '1.125rem', fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {typeof gift.generated_letter === 'object' && gift.generated_letter !== null ? (
                      <>
                        {gift.generated_letter.titulo && <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">{gift.generated_letter.titulo}</h2>}
                        {gift.generated_letter.introducao && <p>{gift.generated_letter.introducao}</p>}
                        {gift.generated_letter.corpo_principal && <p>{gift.generated_letter.corpo_principal}</p>}
                        {gift.generated_letter.fechamento && <p className="text-right mt-4">{gift.generated_letter.fechamento}</p>}
                      </>
                    ) : (
                      gift.generated_letter
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="font-serif text-rose-300 text-3xl mb-3 animate-pulse">✦</div>
                    <p className="font-sans text-sm text-gray-400">
                      A carta está sendo preparada…<br />
                      <span className="text-xs text-gray-300">Recarregue a página em instantes.</span>
                    </p>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                  <div
                    className="font-serif italic text-2xl text-gray-800 mb-1"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Com amor, {gift?.player1_name}
                  </div>
                  <div className="font-sans text-xs text-gray-300 uppercase tracking-widest mt-2">
                    {new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'America/Sao_Paulo',
                    }).format(new Date(gift?.created_at))}
                  </div>
                </div>
              </Card>

              {gift?.photos?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <h2
                    className="font-serif text-2xl text-center text-gray-800 mb-8"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Nossas Memórias
                  </h2>
                  <PhotoCarousel photos={gift.photos} />
                </motion.div>
              )}

              <motion.div
                className="text-center pt-8 pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-[1px] bg-gray-100" />
                  <span className="text-gray-200 text-sm">✦</span>
                  <div className="flex-1 h-[1px] bg-gray-100" />
                </div>
                <p className="font-sans text-xs text-gray-300 uppercase tracking-widest leading-loose">
                  Esta carta foi eternizada digitalmente.<br />
                  Guarde este link para revisitar quando quiser.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
