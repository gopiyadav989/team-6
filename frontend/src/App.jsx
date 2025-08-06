import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    
    <div>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Button variant={"destructive"}> hi </Button>
      
    </div>
  )
}

export default App
