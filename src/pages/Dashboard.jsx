import { useState } from 'react';
import ProductModal from '../components/ProductModal';
import InventoryModal from '../components/InventoryModal';
import SaleModal from '../components/SaleModal';
import './Dashboard.css'

function Dashboard() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  return (
    <div className="dashboard">
      <h1>Panel de Control</h1>
      <div className="button-container">
        <button onClick={() => setShowProductModal(true)}>Productos</button>
        <button onClick={() => setShowInventoryModal(true)}>Inventarios</button>
        <button onClick={() => setShowSaleModal(true)}>Ventas</button>
      </div>

      {showProductModal && (
        <ProductModal onClose={() => setShowProductModal(false)} />
      )}
      {showInventoryModal && (
        <InventoryModal onClose={() => setShowInventoryModal(false)} />
      )}
      {showSaleModal && (
        <SaleModal onClose={() => setShowSaleModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;