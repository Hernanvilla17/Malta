import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Cart from './components/Cart'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Historia from './pages/Historia'
import Menu from './pages/Menu'
import './App.css'

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <Cart />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
