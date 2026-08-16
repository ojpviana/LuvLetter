import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import FloatingHearts from '../components/FloatingHearts'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function SuccessScreen({ hash, player2Name }) {
  const [copied, setCopied] = useState(false)
  // Usa pathname para limpar todos os query params do Mercado Pago da URL de compartilhamento
  const publicUrl = `${window.location.origin}/quest/${hash}`

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  px-4 text-center animate-fade-in-up">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="mb-10">
        <div className="text-6xl mb-6 animate-bounce opacity-80">
          <img src="/logo-envelope.png" className="w-16 h-16 mx-auto object-contain image-rendering-pixelated" alt="Presente" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight mb-3">
          Presente Lacrado!
        </h1>
        <p className="font-sans text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
          A carta para <strong>{player2Name}</strong> está pronta.<br />
          Compartilhe o link abaixo para entregar o presente.
        </p>
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-rose-100 p-6 mb-6">
        <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-3">Link do presente</p>
        <div className="flex items-center gap-3  rounded-xl px-4 py-3 border border-stone-100">
          <span className="font-mono text-sm text-gray-700 truncate flex-1 text-left">{publicUrl}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`mt-4 w-full py-3 px-6 rounded-xl font-sans text-sm font-medium transition-all duration-200 ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-rose-300 hover:bg-rose-400 text-white shadow-sm shadow-rose-200'
          }`}
        >
          {copied ? '✓ Copiado!' : '🔗 Copiar Link'}
        </button>
      </div>
      <a
        href={`/quest/${hash}`}
        className="font-sans text-xs text-gray-400 hover:text-rose-400 transition-colors uppercase tracking-widest"
      >
        Ver como o destinatário verá ↗
      </a>
    </div>
  )
}

export default function Review() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [gift, setGift] = useState(null)
  const [letterObj, setLetterObj] = useState({ titulo: '', introducao: '', corpo_principal: '', fechamento: '' })
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regenCount, setRegenCount] = useState(0)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [finalized, setFinalized] = useState(false)
  const [finalHash, setFinalHash] = useState('')

  useEffect(() => {
    fetchReview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function fetchReview() {
    try {
      const res = await axios.get(`/api/gifts/${id}/review`)
      setGift(res.data)
      const data = res.data.generated_letter
      if (typeof data === 'object' && data !== null) {
        setLetterObj({
          titulo: data.titulo || '',
          introducao: data.introducao || '',
          corpo_principal: data.corpo_principal || '',
          fechamento: data.fechamento || '',
        })
      } else {
        setLetterObj({ titulo: '', introducao: '', corpo_principal: data || '', fechamento: '' })
      }
      
      if (res.data.is_finalized) {
        setFinalized(true)
        setFinalHash(res.data.unique_hash)
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acesso negado. O pagamento precisa ser confirmado antes de revisar a carta.')
      } else if (status === 404) {
        setError('Presente não encontrado.')
      } else {
        setError('Não foi possível carregar a carta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate() {
    setRegenerating(true)
    setActionError('')
    try {
      const res = await axios.post(`/api/gifts/${id}/regenerate`)
      const data = res.data.letter
      if (typeof data === 'object' && data !== null) {
        setLetterObj({
          titulo: data.titulo || '',
          introducao: data.introducao || '',
          corpo_principal: data.corpo_principal || '',
          fechamento: data.fechamento || '',
        })
        setRegenCount(prev => prev + 1)
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Erro ao gerar nova versão. Tente novamente.')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleFinalize() {
    if (!letterObj.introducao.trim() || !letterObj.corpo_principal.trim()) {
      setActionError('Os campos principais não podem estar vazios antes de lacrar.')
      return
    }
    setFinalizing(true)
    setActionError('')
    try {
      const res = await axios.post(`/api/gifts/${id}/finalize`, { final_text: letterObj })
      setFinalHash(res.data.unique_hash)
      setFinalized(true)
    } catch (err) {
      setActionError(err.response?.data?.error || 'Erro ao lacrar o presente. Tente novamente.')
    } finally {
      setFinalizing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="font-serif text-3xl text-rose-300 animate-pulse">♥</div>
          <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mt-4">Carregando a carta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 ">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-5xl">😔</div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <p className="font-sans text-gray-500 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="font-sans text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  if (finalized) {
    return <SuccessScreen hash={finalHash} player2Name={gift?.player2_name} />
  }

  return (
    <div className="min-h-screen flex flex-col  text-gray-800">
      <Helmet>
        <meta name="robots" content="noindex" />
      </Helmet>
      <header className="pt-12 pb-8 text-center px-4">
        <h1 className="font-serif text-3xl text-gray-900">LuvLetter</h1>
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {['Dados', 'Fotos', 'Checkout'].map((s) => (
            <span key={s} className="font-sans text-xs uppercase tracking-widest text-gray-300">{s}</span>
          ))}
          <span className="text-gray-200">›</span>
          <span className="font-sans text-xs uppercase tracking-widest text-rose-400 font-semibold">Revisão</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 relative">

        
        <div className="mb-8 text-center animate-fade-in-up">
            <p className="font-sans text-sm text-gray-500 leading-relaxed">
              Esta é a carta que a IA escreveu para{' '}
              <strong className="text-gray-700">{gift?.player2_name}</strong>.
              <br />
              Leia, edite o que quiser, ou peça uma nova versão antes de lacrar.
            </p>
          </div>

          <div key={regenCount} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-8 animate-fade-in-up" style={{ animationDuration: '1s' }}>
            <div className="flex items-center gap-4 px-8 pt-8 pb-4">
              <div className="flex-1 h-[1px] bg-rose-50" />
              <span className="text-rose-200 text-base">✦</span>
              <div className="flex-1 h-[1px] bg-rose-50" />
            </div>

            <div className="px-6 md:px-10 pb-8 flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase text-gray-400 mb-2 block font-semibold tracking-widest">Título</label>
                <input
                  value={letterObj.titulo}
                  onChange={(e) => setLetterObj({ ...letterObj, titulo: e.target.value })}
                  className="w-full bg-transparent border border-gray-200 rounded-lg outline-none font-serif text-gray-900 text-2xl p-4 focus:border-rose-300 transition-colors"
                  placeholder="Título da carta..."
                  disabled={regenerating || finalizing}
                />
              </div>

              <div>
                <label className="text-xs uppercase text-gray-400 mb-2 block font-semibold tracking-widest">Introdução</label>
                <textarea
                  value={letterObj.introducao}
                  onChange={(e) => setLetterObj({ ...letterObj, introducao: e.target.value })}
                  className="w-full resize-none bg-transparent border border-gray-200 rounded-lg outline-none font-serif text-gray-700 text-lg leading-loose p-4 focus:border-rose-300 transition-colors min-h-[120px]"
                  placeholder="Introdução..."
                  disabled={regenerating || finalizing}
                />
              </div>

              <div>
                <label className="text-xs uppercase text-gray-400 mb-2 block font-semibold tracking-widest">Corpo Principal</label>
                <textarea
                  value={letterObj.corpo_principal}
                  onChange={(e) => setLetterObj({ ...letterObj, corpo_principal: e.target.value })}
                  className="w-full resize-none bg-transparent border border-gray-200 rounded-lg outline-none font-serif text-gray-700 text-lg leading-loose p-4 focus:border-rose-300 transition-colors min-h-[220px]"
                  placeholder="Corpo da carta..."
                  disabled={regenerating || finalizing}
                />
              </div>

              <div>
                <label className="text-xs uppercase text-gray-400 mb-2 block font-semibold tracking-widest">Fechamento</label>
                <textarea
                  value={letterObj.fechamento}
                  onChange={(e) => setLetterObj({ ...letterObj, fechamento: e.target.value })}
                  className="w-full resize-none bg-transparent border border-gray-200 rounded-lg outline-none font-serif text-gray-700 text-lg leading-loose p-4 focus:border-rose-300 transition-colors min-h-[100px]"
                  placeholder="Despedida..."
                  disabled={regenerating || finalizing}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-8 pb-8 pt-2">
              <div className="flex-1 h-[1px] " />
              <span className="font-serif italic text-sm text-gray-300">Com amor, {gift?.player1_name}</span>
              <div className="flex-1 h-[1px] " />
            </div>
          </div>

          {actionError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3 text-center">
              <p className="font-sans text-sm text-red-500">{actionError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="btn-regenerate"
              onClick={handleRegenerate}
              disabled={regenerating || finalizing}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 px-6 font-sans text-sm text-gray-600 bg-transparent hover: transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {regenerating ? (
                <><Spinner /><span>A IA está pensando...</span></>
              ) : (
                'Gerar nova versão'
              )}
            </button>

            <button
              id="btn-finalize"
              onClick={handleFinalize}
              disabled={regenerating || finalizing}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-300 hover:bg-rose-400 text-white rounded-xl py-3 px-6 font-sans text-sm font-medium shadow-sm shadow-rose-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finalizing ? (
                <><Spinner /><span>Lacrando...</span></>
              ) : (
                'Lacrar Presente Final'
              )}
            </button>
          </div>

          <p className="text-center font-sans text-xs text-gray-300 leading-relaxed">
            Após lacrar, você receberá o link público para enviar ao destinatário.<br />
            O texto não poderá ser alterado depois.
          </p>
      </main>
    </div>
  )
}
