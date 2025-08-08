import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';

export default function App() {
  const backendUrl = useMemo(() => process.env.REACT_APP_BACKEND_URL, []);
  const [health, setHealth] = useState(null);
  const [roles, setRoles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [echo, setEcho] = useState(null);
  const [sync, setSync] = useState(null);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState({ token: '', me: null });
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [newPlan, setNewPlan] = useState({ name: '', min_amount: 0, profit_percent: 0, duration_days: 0 });
  const [myInv, setMyInv] = useState([]);
  const [myTx, setMyTx] = useState([]);

  const safe = async (fn, setter) => {
    try { const d = await fn(); setter(d); } catch (e) { setter({ error: e.message }); setError(e.message); }
  };

  useEffect(() => {
    if (!backendUrl) { setError('REACT_APP_BACKEND_URL manquant'); return; }
    safe(() => api.roles(), setRoles);
    safe(() => api.plans(), setPlans);
    const it = setInterval(() => setSync({ server_time: new Date().toISOString() }), 5000);
    return () => clearInterval(it);
  }, [backendUrl]);

  const onRegister = async () => {
    try { const d = await api.register(form.email, form.password, form.full_name); alert('Registered: ' + d.email + ' (confirmez email si exigé)'); }
    catch (e) { alert('Register error: ' + e.response?.data?.detail || e.message); }
  };
  const onLogin = async () => {
    try {
      const d = await api.login(form.email, form.password);
      const token = d.access_token || d.access_token?.access_token || d.access_token; // defensive
      const me = await api.me(d.access_token || d.access_token?.access_token || d.access_token);
      setAuth({ token, me });
    } catch (e) { alert('Login error: ' + (e.response?.data?.detail || e.message)); }
  };

  const onCreatePlan = async () => {
    try { const d = await api.createPlan(auth.token, newPlan); alert('Plan créé'); setPlans(await api.plans()); }
    catch (e) { alert('Create plan error: ' + (e.response?.data?.detail || e.message)); }
  };

  const onCreateInvestment = async () => {
    try { const res = await api.createInvestment(auth.token, { amount: 100, plan_id: plans[0]?.id }); alert('Investment OK'); setMyInv(await api.myInvestments(auth.token)); }
    catch (e) { alert('Investment error: ' + (e.response?.data?.detail || e.message)); }
  };

  const onCreateDeposit = async () => {
    try { const res = await api.createTransaction(auth.token, { type: 'deposit', amount: 100, currency: 'USDT', status: 'pending' }); alert('Deposit OK'); setMyTx(await api.myTransactions(auth.token)); }
    catch (e) { alert('Deposit error: ' + (e.response?.data?.detail || e.message)); }
  };

  return (
    <div style={{ fontFamily: 'system-ui', margin: 20 }}>
      <h1>CryptoBoost — Supabase end-to-end</h1>

      <section>
        <h2>Auth</h2>
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onRegister}>Register</button>
          <button onClick={onLogin}>Login</button>
        </div>
        <pre>{JSON.stringify(auth.me, null, 2)}</pre>
      </section>

      <section>
        <h2>Plans</h2>
        <pre>{JSON.stringify(plans, null, 2)}</pre>
        {auth.me?.role === 'admin' && (
          <div>
            <h3>Créer plan (admin)</h3>
            <input placeholder="Nom" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
            <input placeholder="Min" type="number" value={newPlan.min_amount} onChange={e => setNewPlan({ ...newPlan, min_amount: Number(e.target.value) })} />
            <input placeholder="Profit %" type="number" value={newPlan.profit_percent} onChange={e => setNewPlan({ ...newPlan, profit_percent: Number(e.target.value) })} />
            <input placeholder="Durée (jours)" type="number" value={newPlan.duration_days} onChange={e => setNewPlan({ ...newPlan, duration_days: Number(e.target.value) })} />
            <button onClick={onCreatePlan}>Créer</button>
          </div>
        )}
      </section>

      <section>
        <h2>Client actions</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCreateInvestment} disabled={!auth.token || !plans?.[0]}>Créer Investment (100 sur 1er plan)</button>
          <button onClick={onCreateDeposit} disabled={!auth.token}>Créer Dépôt (100 USDT)</button>
        </div>
        <h3>Mes investissements</h3>
        <pre>{JSON.stringify(myInv, null, 2)}</pre>
        <h3>Mes transactions</h3>
        <pre>{JSON.stringify(myTx, null, 2)}</pre>
      </section>

      <section>
        <h2>System</h2>
        <pre>{JSON.stringify(health, null, 2)}</pre>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </section>
    </div>
  );
}