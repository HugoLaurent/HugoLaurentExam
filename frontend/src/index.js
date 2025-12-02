import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ToastProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ToastProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ToastProvider>
);
