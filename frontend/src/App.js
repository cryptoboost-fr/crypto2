import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';

function useBackendUrl() {
  return useMemo(() => process.env.REACT_APP_BACKEND_URL, []);
}

export default function App() {
  const backendUrl = useBackendUrl();
  const [health, setHealth] = useState(null);
  const [roles, setRoles] = useState([]);
  const [echo, setEcho] = useState(null);
  const [sync, setSync] = useState(null);
  const [error, setError] = useState(null);

  const safeCall = async (fn, setter) => {
    try {
      const data = await fn();
      setter(data);
    } catch (e) {
      setter({ error: e.message });
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!backendUrl) {
      setError('REACT_APP_BACKEND_URL est manquant. Configurez-le dans le fichier .env du frontend (protégé) ou via variables Netlify.');
      return;
    }

    safeCall(api.getHealth, setHealth);
    safeCall(api.getRoles, setRoles);

    const interval = setInterval(() => safeCall(api.getSyncTime, setSync), 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const onEcho = async () => {
    setEcho(null);
    await safeCall(() => api.postEcho({ action: 'test_click', payload: { at: new Date().toISOString() } }), setEcho);
  };

  const onRefreshHealth = () => safeCall(api.getHealth, setHealth);
  const onRefreshRoles = () => safeCall(api.getRoles, setRoles);
  const onRefreshSync = () => safeCall(api.getSyncTime, setSync);

  return (
    <div style={{ fontFamily: 'system-ui', margin: 20 }}>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <a href="#health">Health</a>
        <a href="#roles">Rôles</a>
        <a href="#action">Action</a>
        <a href="#sync">Synchronisation</a>
      </nav>

      <h1>CryptoBoost — Vérifications de compatibilité</h1>
      {!backendUrl && (
        <p style={{ color: 'crimson' }}>Aucune REACT_APP_BACKEND_URL définie</p>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <section id="health" style={{ marginTop: 24 }}>
        <h2>Health backend</h2>
        <button onClick={onRefreshHealth}>Rafraîchir Health</nutton>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>

      <section id="roles" style={{ marginTop: 24 }}>
        <h2>Rôles</h2>
        <button onClick={onRefreshRoles}>Rafraîchir Rôles</button>
        <ul>
          {Array.isArray(roles) && roles.map((r) => (
            <li key={r.id || r.name}>{r.name}</li>
          ))}
        </ul>
      </section>

      <section id="action" style={{ marginTop: 24 }}>
        <h2>Action</h2>
        <button onClick={onEcho}>Tester Action</button>
        <pre>{JSON.stringify(echo, null, 2)}</pre>
      </section>

      <section id="sync" style={{ marginTop: 24 }}>
        <h2>Synchronisation</h2>
        <button onClick={onRefreshSync}>Rafraîchir Sync</button>
        <pre>{JSON.stringify(sync, null, 2)}</pre>
      </section>
    </div>
  );
}