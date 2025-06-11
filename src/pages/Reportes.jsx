import { useState, useEffect } from 'react';
import { FaChartBar, FaBox, FaDollarSign } from 'react-icons/fa';
import './Reportes.css';

function Reportes() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        reportType: 'daily'
    });
    const API_URL = 'https://backend-cisneros.onrender.com';

    useEffect(() => {
        // Establecer fechas por defecto (último mes)
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        setFilters(prev => ({
            ...prev,
            startDate: lastMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        }));
    }, []);

    useEffect(() => {
        if (filters.startDate && filters.endDate) {
            fetchSales();
        }
    }, [filters]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const { startDate, endDate, reportType } = filters;
            const response = await fetch(
                `${API_URL}/api/sales?startDate=${startDate}&endDate=${endDate}&type=${reportType}`
            );
            if (!response.ok) {
                throw new Error('Error al cargar los reportes');
            }
            const data = await response.json();
            setSales(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateTotals = () => {
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalProducts = sales.reduce((sum, sale) => 
            sum + sale.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0);
        const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

        return { totalSales, totalProducts, averageSale };
    };

    if (loading) return <div className="loading">Cargando reportes...</div>;
    if (error) return <div className="error">{error}</div>;

    const { totalSales, totalProducts, averageSale } = calculateTotals();

    return (
        <div className="reportes-container">
            <h1>Reportes de Ventas</h1>

            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="startDate">Fecha Inicio</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="endDate">Fecha Fin</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="reportType">Tipo de Reporte</label>
                    <select
                        id="reportType"
                        name="reportType"
                        value={filters.reportType}
                        onChange={handleFilterChange}
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <FaDollarSign className="icon" />
                    <h3>Total Ventas</h3>
                    <p>${totalSales.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <FaBox className="icon" />
                    <h3>Total Productos</h3>
                    <p>{totalProducts}</p>
                </div>
                <div className="summary-card">
                    <FaChartBar className="icon" />
                    <h3>Promedio por Venta</h3>
                    <p>${averageSale.toFixed(2)}</p>
                </div>
            </div>

            <div className="sales-table">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Ticket</th>
                            <th>Productos</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale._id}>
                                <td>{new Date(sale.fecha).toLocaleString()}</td>
                                <td>{sale.numeroTicket}</td>
                                <td>
                                    {sale.productos.map(p => 
                                        `${p.producto.nombre} (${p.cantidad})`
                                    ).join(', ')}
                                </td>
                                <td>${sale.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reportes; 