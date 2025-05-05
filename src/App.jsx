import { Outlet } from 'react-router'
import Navbar from './components/Navbar'
import GradientBackground from './components/GradientBackground'

function App() {
  return (
    <div>
      <GradientBackground/>
      <Navbar />
      <div className="px-8">
        <Outlet />
      </div>
    </div>
  )
}

export default App
