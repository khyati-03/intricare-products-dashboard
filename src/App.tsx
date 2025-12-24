import { useEffect, useMemo, useState } from "react";
import type { Product, ProductInput } from "./types/product";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
} from "./services/products";
import SearchFilterBar from "./components/SearchFilterBar";
import ProductTable from "./components/ProductTable";
import ProductFormModal from "./components/ProductFormModal";
import ConfirmDialog from "./components/ConfirmDialog";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<Product | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
        if (!alive) return;
        setProducts(p);
        setCategories(c);
      } catch {
        if (!alive) return;
        setError("Failed to load products. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory = category === "all" || p.category === category;
      const matchSearch = !q || p.title.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, search, category]);

  const avgPrice = useMemo(() => {
    if (visible.length === 0) return 0;
    const sum = visible.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
    return sum / visible.length;
  }, [visible]);

  function openAdd() {
    setFormMode("add");
    setSelected(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setFormMode("edit");
    setSelected(p);
    setFormOpen(true);
  }

  function askDelete(p: Product) {
    setToDelete(p);
    setConfirmOpen(true);
  }

  async function handleSubmit(payload: ProductInput) {
    setBusy(true);

    try {
      if (formMode === "add") {
        const created = await createProduct(payload);
        const safeId = Number(created.id) || Date.now();
        setProducts((prev) => [{ ...created, id: safeId }, ...prev]);
      } else if (selected) {
        const updated = await updateProduct(selected.id, payload);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selected.id ? { ...p, ...updated, id: selected.id } : p
          )
        );
      }

      setFormOpen(false);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;

    setBusy(true);
    try {
      await deleteProduct(toDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== toDelete.id));
      setConfirmOpen(false);
      setToDelete(null);
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed header */}
      <header className="fixed inset-x-0 top-0 z-50 h-16 bg-gradient-to-b from-slate-950 to-slate-900 text-white shadow-lg">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-wide">PM</span>
            </div>

            <div className="leading-tight">
              <div className="text-lg font-semibold">Product Management</div>
              <div className="text-xs text-white/70">FakeStore API • CRUD</div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium ring-1 ring-white/10 hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* push content below fixed header */}
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-8">
        {/* Stats */}
        <section className="mb-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total Products"
              value={products.length}
              sub={`Showing ${visible.length}`}
            />
            <StatCard
              label="Categories"
              value={categories.length}
              sub={`Filter: ${category === "all" ? "All" : category}`}
            />
            <StatCard
              label="Average Price (visible)"
              value={formatMoney(avgPrice)}
              sub="Simple metric for demo"
            />
          </div>
        </section>

        {/* Main panel */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <SearchFilterBar
              search={search}
              category={category}
              categories={categories}
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onAdd={openAdd}
            />
          </div>

          <div className="p-4 sm:p-5">
            {loading && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                Loading products…
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <ProductTable
                products={visible}
                onEdit={openEdit}
                onDelete={askDelete}
              />
            )}
          </div>
        </div>
      </main>

      <ProductFormModal
        open={formOpen}
        mode={formMode}
        categories={categories}
        initial={selected}
        submitting={busy}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this product?"
        description={toDelete ? toDelete.title : undefined}
        confirmText="Delete"
        loading={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
