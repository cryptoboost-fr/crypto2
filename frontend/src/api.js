import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL; // Must include '/api' prefix per ingress rules

if (!BASE_URL) {
  // We don't throw, UI will show a friendly error; exporting stubs avoids crashes
  console.warn('REACT_APP_BACKEND_URL is not defined; API calls will fail gracefully.');
}

const client = axios.create({ baseURL: BASE_URL });

export const api = {
  getHealth: () => client.get('/health').then(r => r.data),
  getRoles: () => client.get('/roles').then(r => r.data),
  postEcho: (payload) => client.post('/actions/echo', payload).then(r => r.data),
  getSyncTime: () => client.get('/sync/time').then(r => r.data),
};