import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="container-fluid">
        <header className="bg-dark text-white p-3 mb-3">
          <h1 className="h3">Schema Evolution Monitor</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<IndexPage />} />
          </Routes>
        </main>
        <footer className="mt-5 text-center text-muted">
          <p>Schema Evolution Monitor &copy; 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;