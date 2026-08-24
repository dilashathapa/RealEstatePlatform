import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🏠 RealEstate Platform
        </h1>
        <p className="text-gray-600 mb-6">
          Tailwind CSS is working with Vite!
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
            Login
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
            Register
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          ⚡ Vite + React + Tailwind v4
        </p>
      </div>
    </div>
  )
}

export default App