import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SmartHomeProvider } from './context/SmartHomeContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export function App() {
  return (
    <BrowserRouter>
      <SmartHomeProvider>
        <AppRoutes />
      </SmartHomeProvider>
    </BrowserRouter>
  );
}

export default App;

