import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FlightGenerator from './pages/tools/FlightGenerator';

function App() {
  return (
    <Router basename="/daily-generate">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                FMS Daily
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/tools/flight-generator"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Flight Generator
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/flight-generator" element={<FlightGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to FMS Daily
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Flight Management System - Data Tools
      </p>
      <Link
        to="/tools/flight-generator"
        className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
      >
        Open Flight Data Generator
      </Link>
    </div>
  );
}

export default App;

