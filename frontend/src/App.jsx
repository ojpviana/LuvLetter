import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Checkout from './pages/Checkout'
import Quest from './pages/Quest'
import Review from './pages/Review'
import FloatingHearts from './components/FloatingHearts'

function GlobalHearts() {
  const location = useLocation();
  let count = 25;
  let opacityBase = 0.4;

  if (location.pathname.startsWith('/quest')) {
    count = 60;
    opacityBase = 0.6;
  } else if (location.pathname.startsWith('/review')) {
    count = 15;
    opacityBase = 0.15;
  }

  return <FloatingHearts count={count} opacityBase={opacityBase} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-gray-800 relative bg-stone-50">
        <div className="relative z-0">
          <GlobalHearts />
        </div>
        <div className="relative z-20 flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload/:id" element={<Upload />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/quest/:hash" element={<Quest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
