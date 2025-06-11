import './Home.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductModal from '../components/ProductModal'
import InventoryModal from '../components/InventoryModal'
import SaleModal from '../components/SaleModal'
import { FaBoxOpen, FaClipboardList, FaShoppingCart, FaTicketAlt, FaChartBar } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Home() {
  const [showProductModal, setShowProductModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)
  const { user } = useAuth()

  const handleSalesClick = () => {
    window.location.href = '/ventas';
  }

  const handleTicketsClick = () => {
    window.open('/tickets', '_blank')
  }

  const handleReportsClick = () => {
    window.open('/reportes', '_blank')
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Gestión del Punto de Venta</h1>

      {user ? (
        <div className="cards-container">
          <div className="card" onClick={() => setShowProductModal(true)}>
            <FaBoxOpen className="icon" />
            <p className="card-title">Productos</p>
          </div>
          <div className="card" onClick={() => setShowInventoryModal(true)}>
            <FaClipboardList className="icon" />
            <p className="card-title">Inventario</p>
          </div>
          <div className="card" onClick={handleSalesClick}>
            <FaShoppingCart className="icon" />
            <p className="card-title">Ventas</p>
          </div>
          <div className="card" onClick={handleTicketsClick}>
            <FaTicketAlt className="icon" />
            <p className="card-title">Tickets</p>
          </div>
          <div className="card" onClick={handleReportsClick}>
            <FaChartBar className="icon" />
            <p className="card-title">Reportes</p>
          </div>
        </div>
      ) : (
        <div className="welcome-message">
          <p>Por favor, inicia sesión para acceder a las funcionalidades del sistema.</p>
        </div>
      )}

      {showProductModal && <ProductModal onClose={() => setShowProductModal(false)} />}
      {showInventoryModal && <InventoryModal onClose={() => setShowInventoryModal(false)} />}
      {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} />}
    </div>
  )
}

export default Home
