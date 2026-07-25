import axios from "axios"

// =====================================
// BASE URL (AUTO SWITCH DEV / PROD)
// =====================================
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000"

// =====================================
// AXIOS INSTANCE
// =====================================
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// =====================================
// REQUEST INTERCEPTOR (TOKEN)
// =====================================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// =====================================
// RESPONSE INTERCEPTOR (ERROR HANDLING)
// =====================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    console.error("API ERROR:", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message: data || error.message,
    })

    if (status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default API

// =====================================
// AUTH API
// =====================================
export const AuthAPI = {
  login: (data) =>
    API.post("/api/auth/login", data).then((res) => res.data),

  register: (data) =>
    API.post("/api/auth/register", data).then((res) => res.data),

  me: () =>
    API.get("/api/auth/me").then((res) => res.data),

  changePassword: (data) =>
    API.post("/api/auth/change-password", data).then((res) => res.data),
}

// =====================================
// PRODUCT API
// =====================================
export const ProductAPI = {
  getAll: () => API.get("/api/products").then((res) => res.data),

  search: (q) =>
    API.get(`/api/products/search?q=${q}`).then((res) => res.data),

  getByBarcode: (code) =>
    API.get(`/api/products/barcode/${code}`).then((res) => res.data),

  create: (data) =>
    API.post("/api/products", data).then((res) => res.data),

  update: (id, data) =>
    API.put(`/api/products/${id}`, data).then((res) => res.data),

  delete: (id) =>
    API.delete(`/api/products/${id}`).then((res) => res.data),
}

// =====================================
// SALES API
// =====================================
export const SalesAPI = {
  create: (data) =>
    API.post("/api/sales/create", data).then((res) => res.data),

  getById: (id) =>
    API.get(`/api/sales/${id}`).then((res) => res.data),

  returnSale: (data) =>
    API.post("/api/sales/return", data).then((res) => res.data),
}

// =====================================
// PURCHASE API
// =====================================
export const PurchaseAPI = {
  create: (data) =>
    API.post("/api/purchase/create", data).then((res) => res.data),

  getById: (id) =>
    API.get(`/api/purchase/${id}`).then((res) => res.data),
}

// =====================================
// INVENTORY API
// =====================================
export const InventoryAPI = {
  getAll: () =>
    API.get("/api/inventory").then((res) => res.data),

  getMovements: () =>
    API.get("/api/inventory/movements").then((res) => res.data),

  getLowStock: () =>
    API.get("/api/inventory/low-stock").then((res) => res.data),

  adjust: (data) =>
    API.post("/api/inventory/adjust", data).then((res) => res.data),
}

// =====================================
// REPORT API
// =====================================
export const ReportAPI = {
  dashboard: () =>
    API.get("/api/reports/dashboard").then((res) => res.data),

  sales: (params) =>
    API.get("/api/reports/sales", { params }).then((res) => res.data),

  inventory: () =>
    API.get("/api/reports/inventory").then((res) => res.data),
}

// =====================================
// PARTY API
// =====================================
export const PartyAPI = {
  getAll: () => API.get("/api/parties").then((res) => res.data),

  getById: (id) =>
    API.get(`/api/parties/${id}`).then((res) => res.data),

  create: (data) =>
    API.post("/api/parties", data).then((res) => res.data),

  update: (id, data) =>
    API.put(`/api/parties/${id}`, data).then((res) => res.data),

  delete: (id) =>
    API.delete(`/api/parties/${id}`).then((res) => res.data),

  ledger: (partyId) =>
    API.get(`/api/parties/${partyId}/ledger`).then((res) => res.data),
}

// =====================================
// USER API
// =====================================
export const UserAPI = {
  getAll: () => API.get("/api/users").then((res) => res.data),

  create: (data) =>
    API.post("/api/users", data).then((res) => res.data),

  update: (id, data) =>
    API.put(`/api/users/${id}`, data).then((res) => res.data),

  toggle: (id) =>
    API.patch(`/api/users/${id}/toggle`).then((res) => res.data),

  delete: (id) =>
    API.delete(`/api/users/${id}`).then((res) => res.data),
}

// =====================================
// BACKUP API
// =====================================
export const BackupAPI = {
  createBackup: () =>
    API.post("/api/backup/create").then((res) => res.data),

  restoreBackup: (file) => {
    const formData = new FormData()
    formData.append("file", file)

    return API.post("/api/backup/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((res) => res.data)
  },
}

// =====================================
// SYSTEM API
// =====================================
export const SystemAPI = {
  info: () =>
    API.get("/api/system").then((res) => res.data),

  health: () =>
    API.get("/health").then((res) => res.data),
}
