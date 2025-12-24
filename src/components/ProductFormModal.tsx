import { useEffect, useMemo, useState } from "react";
import type { Product, ProductInput } from "../types/product";

type Props = {
  open: boolean;
  mode: "add" | "edit";
  categories: string[];
  initial?: Product | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductInput) => void;
};

const emptyForm: ProductInput = {
  title: "",
  price: 0,
  description: "",
  category: "",
  image: "",
};

export default function ProductFormModal({
  open,
  mode,
  categories,
  initial,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setForm({
        title: initial.title ?? "",
        price: Number(initial.price ?? 0),
        description: initial.description ?? "",
        category: initial.category ?? "",
        image: initial.image ?? "",
      });
    } else {
      setForm(emptyForm);
    }

    setTouched(false);
  }, [open, mode, initial]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof ProductInput, string>> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!Number.isFinite(form.price) || form.price <= 0)
      e.price = "Price must be > 0";
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  if (!open) return null;

  function update<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({ ...form, price: Number(form.price) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <div className="text-base font-semibold text-slate-900">
              {mode === "add" ? "Add product" : "Edit product"}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {mode === "add"
                ? "Create a new product entry."
                : "Update product details."}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              value={form.title}
              placeholder="Enter Title"
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            {touched && errors.title && (
              <div className="mt-1 text-xs text-rose-600">{errors.title}</div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Price
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              {touched && errors.price && (
                <div className="mt-1 text-xs text-rose-600">{errors.price}</div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {touched && errors.category && (
                <div className="mt-1 text-xs text-rose-600">
                  {errors.category}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="Enter image URL"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              placeholder="Enter Description"
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : mode === "add" ? "Add" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
