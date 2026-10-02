import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './admin/AdminApp.jsx';
import { setAssetRoot } from './lib/format.js';
import { SITE_URL } from './lib/config.js';
import './index.css';
import './admin/admin.css';

// Relative photo paths ('assets/products/x.jpg') live on the public website
setAssetRoot(SITE_URL);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
