import { useState, useEffect } from 'react'
import './Tickets.css'
import { FaPrint, FaEye, FaSearch } from 'react-icons/fa'

const API_URL = 'https://backend-cisneros.onrender.com';

function Tickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_URL}/tickets`)
      if (!response.ok) {
        throw new Error('Error al cargar los tickets')
      }
      const data = await response.json()
      setTickets(data)
      setLoading(false)
    } catch (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleViewTicket = async (numeroTicket) => {
    try {
      const response = await fetch(`${API_URL}/tickets/${numeroTicket}`)
      if (!response.ok) {
        throw new Error('Error al cargar el ticket')
      }
      const data = await response.json()
      // Aquí puedes implementar la lógica para mostrar el detalle del ticket
      console.log('Detalle del ticket:', data)
    } catch (error) {
      setError(error.message)
    }
  }

  const handlePrintTicket = async (numeroTicket) => {
    try {
      window.location.href = `${API_URL}/tickets/${numeroTicket}/pdf`;
    } catch (error) {
      setError(error.message)
    }
  }

  const filteredTickets = tickets.filter(ticket => 
    ticket.numeroTicket.toString().includes(searchTerm) ||
    ticket.fecha.includes(searchTerm)
  )

  if (loading) {
    return <div className="loading">Cargando tickets...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="tickets-container">
      <h1>Tickets de Venta</h1>
      
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por número de ticket o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tickets-grid">
        {filteredTickets.map((ticket) => (
          <div key={ticket._id} className="ticket-card">
            <div className="ticket-header">
              <h3>Ticket #{ticket.numeroTicket}</h3>
              <span className="ticket-date">{new Date(ticket.fecha).toLocaleDateString()}</span>
            </div>
            <div className="ticket-body">
              <p>Total: ${ticket.total.toFixed(2)}</p>
              <p>Productos: {ticket.productos.length}</p>
            </div>
            <div className="ticket-actions">
              <button 
                onClick={() => handleViewTicket(ticket.numeroTicket)}
                className="action-button view"
              >
                <FaEye /> Ver
              </button>
              <button 
                onClick={() => handlePrintTicket(ticket.numeroTicket)}
                className="action-button print"
              >
                <FaPrint /> Imprimir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="no-tickets">
          No se encontraron tickets
        </div>
      )}
    </div>
  )
}

export default Tickets
