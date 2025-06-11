import { useEffect, useState } from 'react';
import './saleModal.css';

function SaleModal({ onClose }) {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [error, setError] = useState('');
    const [showNewSaleModal, setShowNewSaleModal] = useState(false);
    const API_URL = 'https://backend-cisneros.onrender.com/api';

    useEffect(() => {
        console.log('Iniciando SaleModal...');
        fetchProducts();
        fetchSales();
    }, []);

    const fetchProducts = async () => {
        try {
            console.log('Obteniendo productos...');
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al cargar productos');
            }
            const data = await res.json();
            console.log(`Productos obtenidos: ${data.length}`);
            setProducts(data);
        } catch (err) {
            console.error('Error al cargar productos:', err);
            setError('Error al cargar productos: ' + err.message);
        }
    };

    const fetchSales = async () => {
        try {
            console.log('Obteniendo ventas...');
            const res = await fetch(`${API_URL}/sales`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al cargar ventas');
            }
            const data = await res.json();
            console.log(`Ventas obtenidas: ${data.length}`);
            setSales(data);
        } catch (err) {
            console.error('Error al cargar ventas:', err);
            setError('Error al cargar ventas: ' + err.message);
        }
    };

    const handleAddProduct = (product) => {
        console.log('Agregando producto:', product.nombre);
        const existingProduct = selectedProducts.find(p => p.producto === product._id);
        
        if (existingProduct) {
            // Si el producto ya existe, verificar si podemos aumentar la cantidad
            const newQuantity = existingProduct.cantidad + 1;
            if (newQuantity <= product.cantidad) {
                setSelectedProducts(selectedProducts.map(p =>
                    p.producto === product._id
                        ? { ...p, cantidad: newQuantity }
                        : p
                ));
                console.log('Cantidad actualizada para:', product.nombre);
            } else {
                console.log('Stock insuficiente para:', product.nombre);
                setError(`No hay suficiente stock de ${product.nombre}. Disponible: ${product.cantidad}`);
            }
        } else {
            // Si es un producto nuevo, agregarlo con cantidad 1
            setSelectedProducts([...selectedProducts, {
                producto: product._id,
                cantidad: 1,
                nombre: product.nombre,
                precio: product.precio
            }]);
            console.log('Producto agregado:', product.nombre);
        }
    };

    const handleRemoveProduct = (productId) => {
        console.log('Eliminando producto:', productId);
        setSelectedProducts(selectedProducts.filter(p => p.producto !== productId));
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        console.log('Actualizando cantidad para producto:', productId);
        const product = products.find(p => p._id === productId);
        if (newQuantity > product.cantidad) {
            console.log('Stock insuficiente');
            setError(`No hay suficiente stock de ${product.nombre}`);
            return;
        }
        setSelectedProducts(selectedProducts.map(p =>
            p.producto === productId
                ? { ...p, cantidad: newQuantity }
                : p
        ));
        console.log('Cantidad actualizada');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log('Procesando venta...');

        if (selectedProducts.length === 0) {
            setError('Debe seleccionar al menos un producto');
            return;
        }

        const ventaData = {
            productos: selectedProducts.map(p => ({
                producto: p.producto,
                cantidad: p.cantidad
            }))
        };

        console.log('Datos a enviar:', JSON.stringify(ventaData, null, 2));

        try {
            const res = await fetch(`${API_URL}/sales`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });

            const responseData = await res.json();
            console.log('Respuesta del servidor:', responseData);

            if (!res.ok) {
                throw new Error(responseData.message || 'Error al procesar la venta');
            }

            console.log('Venta procesada exitosamente');
            setSales([responseData, ...sales]);
            setShowNewSaleModal(false);
            setSelectedProducts([]);
            await fetchProducts();
        } catch (err) {
            console.error('Error al procesar la venta:', err);
            setError('Error al procesar la venta: ' + err.message);
        }
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => {
            return total + (product.precio * product.cantidad);
        }, 0);
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Gestión de Ventas</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div className="sale-actions">
                    <button onClick={() => setShowNewSaleModal(true)}>Nueva Venta</button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Productos</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale._id}>
                                <td>{new Date(sale.fecha).toLocaleString()}</td>
                                <td>
                                    {sale.productos.map(item => (
                                        <div key={item._id}>
                                            {item.producto.nombre} x {item.cantidad}
                                        </div>
                                    ))}
                                </td>
                                <td>${sale.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showNewSaleModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-button" onClick={() => {
                                setShowNewSaleModal(false);
                                setSelectedProducts([]);
                            }}>X</button>
                            <h3>Nueva Venta</h3>
                            
                            <div className="products-grid">
                                {products.map(product => (
                                    <div 
                                        key={product._id} 
                                        className={`product-card ${product.cantidad <= 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => product.cantidad > 0 && handleAddProduct(product)}
                                    >
                                        <h3>{product.nombre}</h3>
                                        <p>Precio: ${product.precio}</p>
                                        <p>Stock: {product.cantidad}</p>
                                        <button 
                                            onClick={() => handleAddProduct(product)}
                                            disabled={product.cantidad === 0}
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="selected-products">
                                <h4>Productos Seleccionados</h4>
                                {selectedProducts.map(product => (
                                    <div key={product.producto} className="selected-product">
                                        <span>{product.nombre}</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={product.cantidad}
                                            onChange={(e) => handleUpdateQuantity(product.producto, parseInt(e.target.value))}
                                        />
                                        <span>${product.precio * product.cantidad}</span>
                                        <button onClick={() => handleRemoveProduct(product.producto)}>
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                                {selectedProducts.length > 0 && (
                                    <div className="total">
                                        <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={selectedProducts.length === 0}
                                className="submit-button"
                            >
                                Procesar Venta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SaleModal; 