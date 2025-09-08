import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-6">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-16 w-16" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold">Vite + React + Tailwind</h1>
      <div className="flex flex-col items-center gap-3">
        <button className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="opacity-70">Click on the Vite and React logos to learn more</p>
    </div>
  )
}

export default App
