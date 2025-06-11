import { useEffect, useState } from 'react'
import './productModal.css'

function ProductModal({ onClose }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ nombre: '', precio: '', cantidad: '' })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = 'https://backend-cisneros.onrender.com/api';

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`)
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      setError('Error al cargar productos: ' + err.message)
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!res.ok) throw new Error('Error al guardar el producto')
      
      const data = await res.json()
      if (editId) {
        setProducts(products.map(p => (p._id === editId ? data : p)))
        setEditId(null)
      } else {
        setProducts([...products, data])
      }
      setForm({ nombre: '', precio: '', cantidad: '' })
    } catch (err) {
      setError('Error al guardar el producto: ' + err.message)
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar el producto')
      setProducts(products.filter(p => p._id !== id))
    } catch (err) {
      setError('Error al eliminar el producto: ' + err.message)
      console.error('Error:', err)
    }
  }

  const handleEdit = (p) => {
    setForm({ nombre: p.nombre, precio: p.precio, cantidad: p.cantidad })
    setEditId(p._id)
  }

  const handleLoadDefaultProducts = async () => {
    const defaultProducts = [
      { nombre: 'Coca-Cola 600ml', precio: 20, cantidad: 24 },
      { nombre: 'Sabritas Clásicas', precio: 18, cantidad: 30 },
      { nombre: 'Agua Bonafont 600ml', precio: 15, cantidad: 36 },
      { nombre: 'Pan Bimbo Blanco', precio: 45, cantidad: 12 },
      { nombre: 'Leche Lala 1L', precio: 32, cantidad: 18 },
      { nombre: 'Café Nescafé Clásico', precio: 85, cantidad: 15 },
      { nombre: 'Galletas Emperador', precio: 25, cantidad: 24 },
      { nombre: 'Jugo Del Valle 1L', precio: 28, cantidad: 20 },
      { nombre: 'Huevo 18 piezas', precio: 65, cantidad: 10 },
      { nombre: 'Arroz 1kg', precio: 35, cantidad: 15 },
      { nombre: 'Aceite 1L', precio: 55, cantidad: 12 },
      { nombre: 'Atún en agua', precio: 22, cantidad: 20 },
      { nombre: 'Frijoles 1kg', precio: 40, cantidad: 15 },
      { nombre: 'Pasta 500g', precio: 18, cantidad: 25 },
      { nombre: 'Sopa Maruchan', precio: 15, cantidad: 30 },
      { nombre: 'Chocolate Hershey\'s', precio: 12, cantidad: 40 },
      { nombre: 'Gomitas Trululu', precio: 10, cantidad: 35 },
      { nombre: 'Paleta Payaso', precio: 8, cantidad: 50 },
      { nombre: 'Cigarros Marlboro', precio: 65, cantidad: 20 },
      { nombre: 'Cerveza Corona 355ml', precio: 25, cantidad: 24 }
    ]

    setError('')
    let productosCargados = 0
    let errores = []

    for (const product of defaultProducts) {
      try {
        // Primero crear el producto
        const productRes = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        })
        
        if (!productRes.ok) {
          throw new Error(`Error al crear el producto ${product.nombre}`)
        }
        
        const createdProduct = await productRes.json()
        
        // Luego crear el registro de inventario inicial
        const inventoryRes = await fetch(`${API_URL}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            producto: createdProduct._id,
            existenciaFisica: product.cantidad,
            observaciones: 'Inventario inicial'
          })
        })
        
        if (!inventoryRes.ok) {
          throw new Error(`Error al crear el inventario para ${product.nombre}`)
        }

        productosCargados++
      } catch (err) {
        errores.push(`Error con ${product.nombre}: ${err.message}`)
        console.error('Error:', err)
      }
    }
    
    // Recargar la lista de productos
    await fetchProducts()

    // Mostrar mensaje de resultado
    if (errores.length > 0) {
      setError(`Se cargaron ${productosCargados} productos. Errores: ${errores.join('; ')}`)
    } else {
      setError(`Se cargaron exitosamente ${productosCargados} productos`)
    }
  }

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="product-modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Gestión de Productos</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="product-actions">
          <button onClick={handleLoadDefaultProducts} className="load-default-button">
            Cargar Productos Predeterminados
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={e => setForm({ ...form, precio: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={form.cantidad}
            onChange={e => setForm({ ...form, cantidad: e.target.value })}
            required
          />
          <button type="submit">{editId ? 'Actualizar' : 'Agregar'}</button>
        </form>

        <input 
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="product-search-input"
        />

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Usar productos filtrados */}
            {filteredProducts.map(p => (
              <tr key={p._id}>
                <td>{p.nombre}</td>
                <td>${p.precio}</td>
                <td>{p.cantidad}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Editar</button>
                  <button onClick={() => handleDelete(p._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductModal
