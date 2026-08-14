import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import Button from '../components/Button'
import Card from '../components/Card'
import BlurredLetter from '../components/BlurredLetter'

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [gift, setGift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    fetchPreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchPreview() {
    try {
      const res = await axios.get(`/api/gifts/${id}/preview`)
      setGift(res.data)
      // If already paid, redirect to quest
      if (res.data.is_paid) {
        navigate(`/quest/${res.data.unique_hash}`, { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível carregar o preview.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePay() {
    setPaying(true)
    setError('')
    try {
      const res = await axios.post('/api/checkout', { gift_id: id })
      // Redirect to MercadoPago
      window.location.href = res.data.checkout_url
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar pagamento. Tente novamente.')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="font-serif text-3xl text-rose-300 animate-pulse">♥</div>
          <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mt-4">Carregando cápsula...</p>
        </div>
      </div>
    )
  }

  if (error && !gift) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 ">
        <Card className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4 text-gray-300">⚠️</div>
          <p className="font-sans text-gray-600 mb-8">{error}</p>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col  text-gray-800">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Header */}
      <header className="pt-12 pb-8 text-center px-4">
        <h1 className="font-serif text-3xl text-gray-900">LuvLetter</h1>
        <div className="flex items-center justify-center gap-4 mt-6">
          {['Dados', 'Fotos', 'Checkout'].map((s, i) => (
            <span
              key={s}
              className={`font-sans text-xs uppercase tracking-widest ${i === 2 ? 'text-rose-400 font-bold' : 'text-gray-400'}`}
            >
              {s}
            </span>
          ))}
        </div>
      </header>

      {/* Payment failed/pending notice */}
      {paymentStatus === 'failed' && (
        <div className="px-4 max-w-2xl mx-auto w-full mb-6">
          <div className="bg-red-50 border border-red-100 rounded-md p-4 text-center">
            <p className="font-sans text-sm text-red-600 font-medium">
              O pagamento não foi concluído.
              <br />
              <span className="font-normal text-red-500">Por favor, tente novamente ou use outro método.</span>
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-3xl space-y-8">

          {/* Letter preview */}
          <Card className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl text-gray-800">
                Uma prévia da sua carta
              </h3>
              {gift?.letter_blurred && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">
                  Bloqueada
                </span>
              )}
            </div>

            <div className="min-h-32 font-serif text-lg text-gray-600 leading-loose">
              <BlurredLetter
                text={gift?.generated_letter}
                isBlurred={gift?.letter_blurred}
                onPay={handlePay}
              />
            </div>

          </Card>

          {/* Two columns: Details & Checkout */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Gift summary */}
            <Card className="p-8">
              <h2 className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-6">
                Detalhes da Cápsula
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'De', value: gift?.player1_name },
                  { label: 'Para', value: gift?.player2_name },
                  { label: 'Tempo Juntos', value: gift?.time_together },
                  { label: 'Fotos Adicionadas', value: gift?.photos?.length || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="font-sans text-sm text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* CTA — Unlock */}
            <Card className="p-8 flex flex-col justify-center text-center bg-white border-rose-100 shadow-md">
              <div className="font-serif text-3xl text-rose-300 mb-2">♥</div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">
                Eternize este momento
              </h2>
              <p className="font-sans text-sm text-gray-500 mb-8">
                Acesso vitalício à cápsula digital
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="font-sans text-4xl font-light text-gray-900">
                  R$ 9<span className="text-2xl text-gray-500">,90</span>
                </div>
                <div className="font-sans text-xs text-green-600 font-medium uppercase tracking-widest mt-2">
                  Pagamento Único
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <Button
                variant="primary"
                onClick={handlePay}
                loading={paying}
                className="w-full text-lg py-4 shadow-rose-200"
              >
                {paying ? 'Redirecionando...' : 'Desbloquear Agora'}
              </Button>

              <p className="font-sans text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Pagamento seguro via MercadoPago
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
