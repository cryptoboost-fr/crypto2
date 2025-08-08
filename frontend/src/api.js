import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL; // must include '/api'

export const api = {
  // auth
  register: (email, password, full_name) => axios.post(`${BASE_URL}/auth/register`, { email, password, full_name }).then(r => r.data),
  login: (email, password) => axios.post(`${BASE_URL}/auth/login`, { email, password }).then(r => r.data),
  me: (token) => axios.get(`${BASE_URL}/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),

  // public
  roles: () => axios.get(`${BASE_URL}/roles`).then(r => r.data),
  plans: () => axios.get(`${BASE_URL}/plans`).then(r => r.data),

  // admin
  createPlan: (token, plan) => axios.post(`${BASE_URL}/admin/plans`, plan, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),

  // user
  createInvestment: (token, data) => axios.post(`${BASE_URL}/user/investments`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  myInvestments: (token) => axios.get(`${BASE_URL}/user/my-investments`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  createTransaction: (token, data) => axios.post(`${BASE_URL}/user/transactions`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
  myTransactions: (token) => axios.get(`${BASE_URL}/user/my-transactions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
};