import axios, { AxiosError } from "axios"

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
  timeout: 10000, // 10s timeout
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
  (error: AxiosError<any>) => {
    const status = error.response?.status
    const data = error.response?.data

    console.error("🚨 API ERROR:", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message: data || error.message,
    })

    // 🔒 Handle unauthorized (auto logout)
    if (status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default API

// =====================================
// TYPES
// =====================================
export interface DashboardData {
  today_sales: number
  today_purchase: number
  receivables: number
  payables: number
  low_stock: Array<{ name: string; quantity: number }>
  recent: Array<{ invoice: string; type: "sale" | "purchase"; party: string; amount: number }>
}

export interface ProductSearchItem {
  id: number
  name: string
  unit_id: number
  unit_name: string
  sales_rate: number
  barcode: string
}

export interface Party {
  id: number
  name: string
  type: "customer" | "supplier"
  phone: string
  outstanding: number
  credit_limit?: number
}

export interface SalesReportItem {
  date: string
  total_sales: number
  total_returns: number
  net_sales: number
  transactions: number
  avg_bill: number
}

export interface InventoryItem {
  product_unit_id: number
  name: string
  unit_name: string
  quantity: number
  purchase_rate: number
  stock_value: number
}

export interface InventoryMovement {
  id: number
  type: string
  quantity: number
  unit_name: string
  reference: string
  date: string
}

// =====================================
// AUTH API
// =====================================
export const AuthAPI = {
  login: (data: { username: string; password: string }) =>
    API.post("/api/auth/login", data).then((res) => res.data),

  register: (data: any) =>
    API.post("/api/auth/register", data).then((res) => res.data),

  me: () =>
    API.get("/api/auth/me").then((res) => res.data),

  changePassword: (data: { current: string; newPassword: string }) =>
    API.post("/api/auth/change-password", data).then((res) => res.data),
}

// =====================================
// PRODUCT API
// =====================================
export const ProductAPI = {
  getAll: () => API.get("/api/products").then((res) => res.data),

  search: (q: string) =>
    API.get(`/api/products/search?q=${q}`).then((res) => res.data),

  getByBarcode: (code: string) =>
    API.get(`/api/products/barcode/${code}`).then((res) => res.data),

  create: (data: any) =>
    API.post("/api/products", data).then((res) => res.data),

  update: (id: number, data: any) =>
    API.put(`/api/products/${id}`, data).then((res) => res.data),

  delete: (id: number) =>
    API.delete(`/api/products/${id}`).then((res) => res.data),
}

// =====================================
// SALES API
// =====================================
export const SalesAPI = {
  create: (data: any) =>
    API.post("/api/sales/create", data).then((res) => res.data),

  getById: (id: number) =>
    API.get(`/api/sales/${id}`).then((res) => res.data),

  returnSale: (data: any) =>
    API.post("/api/sales/return", data).then((res) => res.data),
}

// =====================================
// PURCHASE API
// =====================================
export const PurchaseAPI = {
  create: (data: any) =>
    API.post("/api/purchase/create", data).then((res) => res.data),

  getById: (id: number) =>
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

  adjust: (data: any) =>
    API.post("/api/inventory/adjust", data).then((res) => res.data),
}

// =====================================
// REPORT API
// =====================================
export const ReportAPI = {
  dashboard: () =>
    API.get("/api/reports/dashboard").then((res) => res.data),

  sales: (params: { from: string; to: string } | any) =>
    API.get("/api/reports/sales", { params }).then((res) => res.data),

  inventory: () =>
    API.get("/api/reports/inventory").then((res) => res.data),
}

// =====================================
// PARTY API
// =====================================
export const PartyAPI = {
  getAll: () => API.get("/api/parties").then((res) => res.data),

  getById: (id: number) =>
    API.get(`/api/parties/${id}`).then((res) => res.data),

  create: (data: any) =>
    API.post("/api/parties", data).then((res) => res.data),

  update: (id: number, data: any) =>
    API.put(`/api/parties/${id}`, data).then((res) => res.data),

  delete: (id: number) =>
    API.delete(`/api/parties/${id}`).then((res) => res.data),

  ledger: (partyId: number) =>
    API.get(`/api/parties/${partyId}/ledger`).then((res) => res.data),
}

// =====================================
// USER API
// =====================================
export const UserAPI = {
  getAll: () => API.get("/api/users").then((res) => res.data),

  create: (data: any) =>
    API.post("/api/users", data).then((res) => res.data),

  update: (id: number, data: any) =>
    API.put(`/api/users/${id}`, data).then((res) => res.data),

  toggle: (id: number) =>
    API.patch(`/api/users/${id}/toggle`).then((res) => res.data),

  delete: (id: number) =>
    API.delete(`/api/users/${id}`).then((res) => res.data),
}

// =====================================
// BACKUP API
// =====================================
export const BackupAPI = {
  createBackup: () =>
    API.post("/api/backup/create").then((res) => res.data),

  restoreBackup: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return API.post("/api/backup/restore", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then((res) => res.data)
  },
}
