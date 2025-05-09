import { Outlet } from 'react-router'
import Navbar from './components/Navbar'
import GradientBackground from './components/GradientBackground'

function App() {
  return (
    <>
      <GradientBackground/>
      <Navbar />
      <Outlet />
    </>
  )
}

export default App
