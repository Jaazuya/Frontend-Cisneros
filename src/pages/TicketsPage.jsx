import React, { useEffect, useState } from 'react';
import './ticketsPage.css';

function TicketsPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalItemsSold, setTotalItemsSold] = useState(0);
    const API_URL = 'https://backendpuntodeventa-1.onrender.com/api';

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await fetch(`${API_URL}/sales`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSales(data);

                // Calcular balance
                let revenue = 0;
                let items = 0;
                data.forEach(sale => {
                    revenue += sale.total;
                    sale.productos.forEach(item => {
                        items += item.cantidad;
                    });
                });
                setTotalRevenue(revenue);
                setTotalItemsSold(items);

            } catch (err) {
                setError('Error al cargar los tickets: ' + err.message);
                console.error('Error fetching sales:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, []);

    if (loading) {
        return <div className="tickets-container">Cargando tickets...</div>;
    }

    if (error) {
        return <div className="tickets-container error-message">{error}</div>;
    }

    return (
        <div className="tickets-container">
            <h1>Tickets Generados ({sales.length})</h1>

            <div className="sales-balance">
                <h2>Balance de Ventas</h2>
                <p>Total de Tickets: <strong>{sales.length}</strong></p>
                <p>Ingresos Totales: <strong>${totalRevenue.toFixed(2)}</strong></p>
                <p>Artículos Totales Vendidos: <strong>{totalItemsSold}</strong></p>
            </div>
            
            {sales.length === 0 ? (
                <p>No hay tickets generados aún.</p>
            ) : (
                <div className="tickets-list">
                    {sales.map(sale => (
                        <div key={sale._id} className="ticket-card">
                            <h3>Ticket ID: {sale._id}</h3>
                            <p>Fecha: {new Date(sale.fecha).toLocaleString()}</p>
                            <div className="ticket-products">
                                <h4>Productos:</h4>
                                <ul>
                                    {sale.productos.map(item => (
                                        <li key={item._id}>
                                            {item.producto.nombre} x {item.cantidad} - ${item.subtotal.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="ticket-total">Total: ${sale.total.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TicketsPage; 