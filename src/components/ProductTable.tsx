import type { Product } from "../types/product";

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function RatingStars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const active = i + 1 <= full;
          return (
            <span
              key={i}
              className={active ? "text-amber-500" : "text-slate-200"}
            >
              ★
            </span>
          );
        })}
      </div>
      <span className="text-xs text-slate-500">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="max-h-[68vh] overflow-auto">
        {/* table-fixed */}
        <table className="w-full table-fixed text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              {/* Product column */}
              <th className="px-4 py-3 font-medium w-[48%]">Product</th>
              <th className="px-4 py-3 font-medium w-[14%]">Category</th>
              <th className="px-4 py-3 font-medium w-[10%]">Price</th>
              <th className="px-4 py-3 font-medium w-[12%]">Rating</th>
              <th className="px-4 py-3 font-medium text-right w-[16%]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                {/* Product */}
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl border border-slate-200 bg-white overflow-hidden flex-shrink-0">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">
                        {p.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 truncate">
                        {p.description}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3 align-top">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {p.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3 align-top font-medium text-slate-900 whitespace-nowrap">
                  {money(p.price)}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  {p.rating?.rate ? (
                    <RatingStars value={p.rating.rate} />
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(p)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  className="px-4 py-10 text-center text-slate-500"
                  colSpan={5}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
