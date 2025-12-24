import { http } from "./http";
import type { Product, ProductInput } from "../types/product";

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await http.get<Product[]>("/products");
  return data;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await http.get<string[]>("/products/categories");
  return data;
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  const { data } = await http.post<Product>("/products", payload);
  return data;
}

export async function updateProduct(
  id: number,
  payload: ProductInput
): Promise<Product> {
  const { data } = await http.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await http.delete(`/products/${id}`);
}
