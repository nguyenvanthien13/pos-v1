import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PwaInstallBanner } from './PwaInstallBanner';
import './styles.css';
import { setupPwa } from './pwa';
setupPwa();
createRoot(document.getElementById('root')!).render(<React.StrictMode><><App /><PwaInstallBanner /></></React.StrictMode>);
