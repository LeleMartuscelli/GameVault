
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'

function MainLayout() {
  return (
    <div className="app-layout gv-app-layout">
      <Navbar />

      <div className="main-content gv-main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
