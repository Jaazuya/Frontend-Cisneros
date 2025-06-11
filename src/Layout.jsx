import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import './Layout.css'

function Layout() {
  return (
    <div>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
