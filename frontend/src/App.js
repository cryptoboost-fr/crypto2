import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function useBackendUrl() {
  const url = useMemo(() => {
    // Respect env-only, no hardcoding
    return process.env.REACT_APP_BACKEND_URL;
  }, []);
  return url;
}

export default function App() {
  const backendUrl = useBackendUrl();
  const [health, setHealth] = useState(null);
  const [roles, setRoles] = useState([]);
  const [echo, setEcho] = useState(null);
  const [sync, setSync] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!backendUrl) {
      setError('REACT_APP_BACKEND_URL est manquant. Configurez-le dans le fichier .env du frontend (protégé) ou via variables Netlify.');
      return;
    }
    const client = axios.create({ baseURL: backendUrl });

    const load = async () => {
      try {
        const h = await client.get('/health');
        setHealth(h.data);
        const r = await client.get('/roles');
        setRoles(r.data);
      } catch (e) {
        setError(e.message);
      }
    };
    load();

    const interval = setInterval(async () => {
      try {
        const s = await client.get('/sync/time');
        setSync(s.data);
      } catch (e) {
        // ignore periodic errors but log in state
        setSync({ error: e.message });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  const onEcho = async () => {
    try {
      setEcho(null);
      const res = await axios.post(`${backendUrl}/actions/echo`, {
        action: 'test_click',
        payload: { at: new Date().toISOString() }
      });
      setEcho(res.data);
    } catch (e) {
      setEcho({ error: e.message });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui', margin: 20 }}>
      <h1>CryptoBoost — Vérifications de compatibilité</h1>
      {!backendUrl && (
        <p style={{ color: 'crimson' }}>Aucune REACT_APP_BACKEND_URL définie</p>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <section>
        <h2>Health backend</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </section>

      <section>
        <h2>Rôles</h2>
        <ul>
          {roles.map((r) => (
            <li key={r.id}>{r.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Action</h2>
        <button onClick={onEcho}>Tester Action</button>
        <pre>{JSON.stringify(echo, null, 2)}</pre>
      </section>

      <section>
        <h2>Synchronisation</h2>
        <pre>{JSON.stringify(sync, null, 2)}</pre>
      </section>
    </div>
  );
}