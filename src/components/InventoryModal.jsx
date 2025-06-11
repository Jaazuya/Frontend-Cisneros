import { useEffect, useState } from 'react';
import './inventoryModal.css';

function InventoryModal({ onClose }) {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [showNewInventoryModal, setShowNewInventoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingInventory, setEditingInventory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [form, setForm] = useState({
        producto: '',
        existenciaFisica: '',
        observaciones: ''
    });
    const [error, setError] = useState('');
    const API_URL = 'https://backendpuntodeventa-1.onrender.com/api';

    useEffect(() => {
        fetchInventory();
        fetchProducts();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${API_URL}/inventory`);
            if (!res.ok) throw new Error('Error al cargar inventario');
            const data = await res.json();
            setInventory(data);
        } catch (err) {
            setError('Error al cargar inventario: ' + err.message);
            console.error('Error:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/products`);
            if (!res.ok) throw new Error('Error al cargar productos');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError('Error al cargar productos: ' + err.message);
            console.error('Error:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const url = editingInventory 
                ? `${API_URL}/inventory/${editingInventory._id}`
                : `${API_URL}/inventory`;
            
            console.log('Enviando datos:', {
                url,
                method: editingInventory ? 'PUT' : 'POST',
                form
            });

            const res = await fetch(url, {
                method: editingInventory ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al guardar el inventario');
            }

            const data = await res.json();
            console.log('Respuesta del servidor:', data);

            if (editingInventory) {
                setInventory(inventory.map(item => 
                    item._id === editingInventory._id ? data : item
                ));
            } else {
                setInventory([data, ...inventory]);
            }
            setShowNewInventoryModal(false);
            setEditingInventory(null);
            setForm({ producto: '', existenciaFisica: '', observaciones: '' });
            await fetchProducts();
        } catch (err) {
            console.error('Error detallado:', err);
            setError('Error al guardar el inventario: ' + err.message);
        }
    };

    const handleEdit = (item) => {
        console.log('Editando item:', item);
        setEditingInventory(item);
        setForm({
            producto: item.producto._id,
            existenciaFisica: item.existenciaFisica,
            observaciones: item.observaciones || ''
        });
        setShowNewInventoryModal(true);
    };

    const handleGenerateReport = async () => {
        try {
            setError('');
            console.log('Solicitando generación de reporte...');
            const res = await fetch(`${API_URL}/inventory/report`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al generar el reporte');
            }
            
            console.log('Reporte generado, descargando...');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventario_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error al generar reporte:', err);
            setError('Error al generar el reporte: ' + err.message);
        }
    };

    const handleClearInventory = async () => {
        if (!window.confirm('¿Estás seguro de que deseas limpiar todo el inventario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/inventory/clear`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Error al limpiar el inventario');

            setInventory([]);
            fetchProducts();
            setError('');
        } catch (err) {
            setError('Error al limpiar el inventario: ' + err.message);
            console.error('Error:', err);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="inventoryModal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Gestión de Inventario</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div className="inventory-actions">
                    <button onClick={() => setShowNewInventoryModal(true)}>Nuevo Conteo</button>
                    <button onClick={handleGenerateReport}>Generar Reporte PDF</button>
                    <button onClick={handleClearInventory} className="clear-button">Limpiar Inventario</button>
                    <button onClick={() => setShowHistory(!showHistory)} className="history-button">
                        {showHistory ? 'Ocultar Historial' : 'Ver Historial Completo'}
                    </button>
                </div>

                {!showHistory && (
                    <input 
                        type="text"
                        placeholder="Buscar por nombre de producto o observaciones..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="inventory-search-input"
                    />
                )}

                {showHistory ? (
                    <div className="inventory-history">
                        <h3>Historial Completo de Inventarios por Producto</h3>
                        {/* Group inventory by product and sort entries by date */}
                        {Object.entries(inventory.reduce((acc, item) => {
                            const productId = item.producto?._id || 'unknown';
                            if (!acc[productId]) {
                                acc[productId] = {
                                    productName: item.producto?.nombre || 'Producto no encontrado',
                                    entries: []
                                };
                            }
                            acc[productId].entries.push(item);
                            // Sort entries by date ascending
                            acc[productId].entries.sort((a, b) => new Date(a.fechaConteo) - new Date(b.fechaConteo));
                            return acc;
                        }, {})).map(([productId, data]) => (
                            <div key={productId} className="product-history-section">
                                <h4>{data.productName}</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Existencia Sistema</th>
                                            <th>Existencia Física</th>
                                            <th>Diferencia</th>
                                            <th>Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.entries.map(entry => (
                                            <tr key={entry._id}>
                                                <td>{new Date(entry.fechaConteo).toLocaleString('es-ES', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</td>
                                                <td>{entry.producto?.cantidad || 0}</td>
                                                <td>{entry.existenciaFisica}</td>
                                                <td className={entry.diferencia !== 0 ? (entry.diferencia > 0 ? 'positive-diff' : 'negative-diff') : ''}>
                                                    {entry.diferencia}
                                                </td>
                                                <td>{entry.observaciones || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Existencia Sistema</th>
                                <th>Existencia Física</th>
                                <th>Diferencia</th>
                                <th>Fecha Conteo</th>
                                <th>Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => (
                                <tr key={item._id}>
                                    <td>{item.producto?.nombre || 'Producto no encontrado'}</td>
                                    <td>{item.producto?.cantidad || 0}</td>
                                    <td>{item.existenciaFisica}</td>
                                    <td className={item.diferencia !== 0 ? (item.diferencia > 0 ? 'positive-diff' : 'negative-diff') : ''}>
                                        {item.diferencia}
                                    </td>
                                    <td>{new Date(item.fechaConteo).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td>{item.observaciones || '-'}</td>
                                    <td>
                                        <button onClick={() => handleEdit(item)}>Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showNewInventoryModal && (
                    <div className="modal-overlay">
                        <div className="inventory-nested-modal-content">
                            <button className="close-button" onClick={() => {
                                setShowNewInventoryModal(false);
                                setEditingInventory(null);
                                setForm({ producto: '', existenciaFisica: '', observaciones: '' });
                            }}>X</button>
                            <h3>{editingInventory ? 'Editar Conteo de Inventario' : 'Nuevo Conteo de Inventario'}</h3>
                            <form onSubmit={handleSubmit} className="inventory-form">
                                <select
                                    value={form.producto}
                                    onChange={e => setForm({ ...form, producto: e.target.value })}
                                    required
                                    disabled={editingInventory !== null}
                                >
                                    <option value="">Seleccionar Producto</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.nombre} (Existencia: {product.cantidad})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Existencia Física"
                                    value={form.existenciaFisica}
                                    onChange={e => setForm({ ...form, existenciaFisica: e.target.value })}
                                    required
                                    min="0"
                                />
                                <textarea
                                    placeholder="Observaciones"
                                    value={form.observaciones}
                                    onChange={e => setForm({ ...form, observaciones: e.target.value })}
                                />
                                <button type="submit">{editingInventory ? 'Actualizar' : 'Guardar'}</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InventoryModal; 