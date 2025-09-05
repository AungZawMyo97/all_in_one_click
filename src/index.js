import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Disable right-click and dev tools
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.key === 's')) {
    e.preventDefault();
    return false;
  }
});

// Disable text selection
document.onselectstart = function() {
  return false;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
