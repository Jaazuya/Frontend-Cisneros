import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import './Ventas.css';

const Ventas = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingSale, setProcessingSale] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastSaleDetails, setLastSaleDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const API_URL = 'https://backend-cisneros.onrender.com';
    

    useEffect(() => {
        fetchProducts();
        fetchSales();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/sales`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setError('Error al cargar historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    const addProduct = (product) => {
        if (product.cantidad <= 0) {
            setError('No hay stock disponible para este producto');
            return;
        }

        const existingProduct = selectedProducts.find(p => p.producto._id === product._id);
        
        if (existingProduct) {
            const availableStock = products.find(p => p._id === product._id)?.cantidad || 0;
            if (existingProduct.cantidad >= availableStock) {
                setError('No hay suficiente stock disponible');
                return;
            }
            setSelectedProducts(selectedProducts.map(p => 
                p.producto._id === product._id 
                    ? { ...p, cantidad: p.cantidad + 1 }
                    : p
            ));
        } else {
            const availableStock = products.find(p => p._id === product._id)?.cantidad || 0;
            if (availableStock <= 0) {
                setError('Producto sin stock');
                return;
            }
            setSelectedProducts([...selectedProducts, {
                producto: product,
                cantidad: 1
            }]);
        }
        setError(null);
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.producto._id !== productId));
        setError(null);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        const product = products.find(p => p._id === productId);
        if (!product) return;

        if (newQuantity > product.cantidad) {
            setError(`No hay suficiente stock disponible para ${product.nombre}. Disponible: ${product.cantidad}`);
            return;
        }

        setSelectedProducts(selectedProducts.map(p => 
            p.producto._id === productId 
                ? { ...p, cantidad: newQuantity }
                : p
        ));
        setError(null);
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, item) => 
            total + (item.producto.precio * item.cantidad), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessingSale(true);
        setError(null);
        setShowSuccessModal(false);

        if (selectedProducts.length === 0) {
            setError('Debe seleccionar al menos un producto para la venta.');
            setProcessingSale(false);
            return;
        }

        try {
            const saleData = {
                productos: selectedProducts.map(item => ({
                    producto: item.producto._id,
                    cantidad: item.cantidad,
                })),
                total: calculateTotal()
            };

            console.log('Datos de venta enviados:', saleData);

            const response = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saleData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Error al procesar la venta');
            }
            
            console.log('Venta procesada con éxito. Datos recibidos:', data);
            setLastSaleDetails(data);
            setShowSuccessModal(true);
            setSelectedProducts([]);
            fetchProducts();
            fetchSales();

        } catch (err) {
            console.error('Error en handleSubmit:', err);
            setError(err.message);
        } finally {
            setProcessingSale(false);
        }
    };

    const handlePrintTicket = (sale) => {
        const ticketUrl = sale.pdfUrl ? `${API_URL}${sale.pdfUrl}` : `${API_URL}/tickets/${sale._id}/pdf`;
        console.log('Intentando abrir URL del ticket:', ticketUrl);
        window.location.href = ticketUrl;
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setLastSaleDetails(null);
    };

    const availableProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !sales.length && !products.length) {
        return <div className="loading">Cargando...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="ventas-container">
            <h1>Punto de Venta</h1>

            {showSuccessModal && lastSaleDetails && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¡Venta Exitosa!</h2>
                        <p>Total pagado: ${lastSaleDetails.total.toFixed(2)}</p>
                        <p>Ticket ID: {lastSaleDetails.numeroTicket || lastSaleDetails._id}</p>
                        <button 
                            className="print-ticket-button"
                            onClick={() => handlePrintTicket(lastSaleDetails)}
                            disabled={processingSale}
                        >
                            {lastSaleDetails.pdfUrl ? 'Ver Ticket PDF' : 'Generar y Ver Ticket'}
                        </button>
                        <button 
                            className="new-sale-button"
                            onClick={closeSuccessModal}
                        >
                            Realizar otra venta
                        </button>
                    </div>
                </div>
            )}

            {!showSuccessModal && (
                <>
                    <div className="products-section">
                        <h2>Productos Disponibles</h2>
                        <input 
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="ventas-search-input"
                        />
                        <div className="products-grid">
                            {availableProducts.map(product => (
                                <div 
                                    key={product._id} 
                                    className={`product-card ${product.cantidad <= 0 ? 'out-of-stock' : ''}`}
                                    onClick={() => product.cantidad > 0 && addProduct(product)}
                                >
                                    <h3>{product.nombre}</h3>
                                    <p>Precio: ${product.precio.toFixed(2)}</p>
                                    <p>Stock: {product.cantidad}</p>
                                    <button 
                                        onClick={() => addProduct(product)}
                                        disabled={product.cantidad === 0}
                                    >
                                        Agregar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cart-section">
                        <h2>Productos en Carrito</h2>
                        {selectedProducts.length === 0 ? (
                            <p>El carrito está vacío.</p>
                        ) : (
                            <div className="cart-items">
                                {selectedProducts.map(item => (
                                    <div key={item.producto._id} className="cart-item">
                                        <p>{item.producto.nombre}</p>
                                        <div className="quantity-controls">
                                            <button onClick={() => updateQuantity(item.producto._id, item.cantidad - 1)} disabled={item.cantidad <= 1}><FaMinus /></button>
                                            <span>{item.cantidad}</span>
                                            <button onClick={() => updateQuantity(item.producto._id, item.cantidad + 1)} disabled={item.cantidad >= (products.find(p => p._id === item.producto._id)?.cantidad || 0)}><FaPlus /></button>
                                        </div>
                                        <p>${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                                        <button onClick={() => removeProduct(item.producto._id)}><FaTrash /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="cart-summary">
                            <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                            <button 
                                onClick={handleSubmit}
                                disabled={selectedProducts.length === 0 || processingSale}
                            >
                                {processingSale ? 'Procesando...' : 'Procesar Venta'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="sales-history">
                <h2>Historial de Ventas</h2>
                <div className="sales-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map(sale => (
                                <tr key={sale._id}>
                                    <td>{sale.numeroTicket || sale._id}</td>
                                    <td>{new Date(sale.fecha).toLocaleString()}</td>
                                    <td>${sale.total.toFixed(2)}</td>
                                    <td>
                                        <button 
                                            className="view-ticket-button"
                                            onClick={() => handlePrintTicket(sale)}
                                        >
                                            Ver Ticket
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Ventas; 