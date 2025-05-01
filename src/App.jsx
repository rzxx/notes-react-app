import { Outlet } from 'react-router'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="bg-white px-32 font-rubik">
      <Navbar />
      <div className="px-8">
        <Outlet />
      </div>
    </div>
  )
}

export default App
