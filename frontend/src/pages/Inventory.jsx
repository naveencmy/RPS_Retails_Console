import { useState, useEffect, useRef } from "react";
import { Search, AlertCircle, Plus, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { InventoryAPI, ProductAPI } from "@/lib/api";
import { toast } from "sonner";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [inv, mov] = await Promise.all([InventoryAPI.getAll(), InventoryAPI.getMovements()]);
      setItems(inv);
      setMovements(mov);
    } catch (err) {
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-4 relative overflow-hidden">
        {/* Top Header with Add Button */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-foreground">Inventory Management</h1>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{items.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Stock Valuation</div>
            <div className="metric-value">₹{items.reduce((sum, i) => sum + Number(i.stock_value || 0), 0).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Low Stock Items</div>
            <div className="metric-value">{items.filter((i) => i.quantity <= 10).length}</div>
          </div>
        </div>

        {/* Inventory List */}
        {!loading && !error && (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-sm font-semibold text-foreground">Stock Position</h3>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="bg-input border border-border rounded-sm px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      {["Product", "Unit", "Quantity", "Purchase Rate", "Stock Value", ""].map((h, i) => (
                        <th key={i} className={`py-3 px-4 text-muted-foreground font-medium ${i === 0 ? "text-left" : i === 5 ? "text-center" : "text-right"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((item) =>
                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.unit_name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((item) => (
                        <tr key={item.product_unit_id} className="border-b border-border hover:bg-secondary transition">
                          <td className="py-3 px-4 text-foreground font-medium">{item.name}</td>
                          <td className="py-3 px-4 text-right text-foreground font-mono text-xs">{item.unit_name}</td>
                          <td className={`py-3 px-4 text-right font-semibold ${item.quantity <= 10 ? "text-[hsl(var(--warning))]" : "text-foreground"}`}>
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-foreground">₹{Number(item.purchase_rate || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-foreground font-semibold">₹{Number(item.stock_value || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedItem(selectedItem?.product_unit_id === item.product_unit_id ? null : item)}
                              className="text-xs text-primary hover:text-primary/80 font-medium transition"
                            >
                              {selectedItem?.product_unit_id === item.product_unit_id ? "Close" : "Adjust"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    {items.filter((item) =>
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.unit_name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Stock Movements */}
        {!loading && !error && movements.length > 0 && (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Recent Stock Movements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      {["Product", "Unit", "Type", "Quantity", "Reference", "Date"].map((h) => (
                        <th key={h} className={`py-3 px-4 text-muted-foreground font-medium ${["Product", "Unit", "Type", "Date"].includes(h) ? "text-left" : "text-right"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.slice(0, 20).map((m) => (
                      <tr key={m.id} className="border-b border-border hover:bg-secondary transition">
                        <td className="py-3 px-4 text-foreground">{m.name}</td>
                        <td className="py-3 px-4 text-foreground font-mono text-xs">{m.unit_name}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-sm ${
                            m.movement_type === "sale" ? "text-[hsl(var(--error))] bg-[hsl(var(--error))]/10" :
                            m.movement_type === "purchase" ? "text-[hsl(var(--success))] bg-[hsl(var(--success))]/10" :
                            "text-[hsl(var(--info))] bg-[hsl(var(--info))]/10"
                          }`}>
                            {m.movement_type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${m.quantity < 0 ? "text-[hsl(var(--error))]" : "text-[hsl(var(--success))]"}`}>
                          {m.quantity > 0 ? "+" : ""}{m.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground font-mono text-xs">{m.reference_id ?? "—"}</td>
                        <td className="py-3 px-4 text-foreground font-mono text-xs">{m.created_at?.slice(0, 10) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Add Product Drawer */}
        <AddProductDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSuccess={() => {
            setIsDrawerOpen(false);
            fetchData();
          }}
        />
      </div>
    </Layout>
  );
}

// =====================================
// DRAWER COMPONENT
// =====================================

function AddProductDrawer({ isOpen, onClose, onSuccess }) {
  const nameInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", sku: "", category: "", reorder_level: 0,
    unit_name: "", barcode: "", purchase_rate: 0,
    sales_rate: 0, mrp: 0, gst_percent: 0, opening_stock: 0
  });

  // Autofocus on open
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.name || !formData.unit_name) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      await ProductAPI.create({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        reorder_level: formData.reorder_level,
        units: [{
          unit_name: formData.unit_name,
          conversion_factor: 1,
          barcode: formData.barcode,
          mrp: formData.mrp,
          purchase_rate: formData.purchase_rate,
          sales_rate: formData.sales_rate,
          gst_percent: formData.gst_percent,
        }],
      });
      toast.success("Product added successfully");
      onSuccess();
      setFormData({ // Reset form
        name: "", sku: "", category: "", reorder_level: 0,
        unit_name: "", barcode: "", purchase_rate: 0,
        sales_rate: 0, mrp: 0, gst_percent: 0, opening_stock: 0
      });
    } catch (err) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-card border-l border-border z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/50">
          <h2 className="font-semibold text-foreground">Add New Product</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-8"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        >
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Basic Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase">Product Name *</label>
                <input
                  ref={nameInputRef}
                  className="drawer-input"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Coca Cola 500ml"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">SKU</label>
                  <input className="drawer-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Category</label>
                  <input className="drawer-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Reorder Level</label>
                  <input type="number" className="drawer-input" value={formData.reorder_level} onChange={e => setFormData({...formData, reorder_level: parseInt(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* Unit Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Unit & Pricing</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Unit Name *</label>
                  <input className="drawer-input" placeholder="e.g. PCS, BOX" value={formData.unit_name} onChange={e => setFormData({...formData, unit_name: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Barcode</label>
                  <input className="drawer-input" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Purchase</label>
                  <input type="number" className="drawer-input" value={formData.purchase_rate} onChange={e => setFormData({...formData, purchase_rate: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Sales</label>
                  <input type="number" className="drawer-input" value={formData.sales_rate} onChange={e => setFormData({...formData, sales_rate: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">MRP</label>
                  <input type="number" className="drawer-input" value={formData.mrp} onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                  <label className="text-[10px] text-muted-foreground uppercase">GST %</label>
                  <input type="number" className="drawer-input" value={formData.gst_percent} onChange={e => setFormData({...formData, gst_percent: parseFloat(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* Inventory */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Initial Inventory</h3>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Opening Stock</label>
              <input type="number" className="drawer-input" value={formData.opening_stock} onChange={e => setFormData({...formData, opening_stock: parseInt(e.target.value)})} />
            </div>
          </section>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/30 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border text-foreground hover:bg-secondary rounded-sm text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-sm font-medium transition flex items-center justify-center"
          >
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>
    </>
  );
}