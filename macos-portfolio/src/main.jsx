import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/apps.css';

// On the 3D room's monitor the whole page is a texture that moves every frame: see the .embedded rules in global.css.
if (window.top !== window) document.documentElement.classList.add('embedded');

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
