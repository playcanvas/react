import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import SimpleSplat from '@/pages/SimpleSplat'
import LodStreaming from '@/pages/LodStreaming'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simple-splat" element={<SimpleSplat />} />
        <Route path="/lod-streaming" element={<LodStreaming />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

