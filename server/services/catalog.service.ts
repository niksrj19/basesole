import { Product, ProductFilters } from '../../src/types.ts';
import { storeRepository } from '../repositories/store.repository.ts';

export async function listCatalog(filters: ProductFilters) {
  let products = await storeRepository.getProducts();
  const query = filters.search?.trim().toLowerCase();
  if (query) products = products.filter((p) => p.name.toLowerCase().includes(query) || p.brandName.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query) || p.tags.some((tag) => tag.toLowerCase().includes(query)) || p.description.toLowerCase().includes(query));
  if (filters.brand && filters.brand !== 'all') products = products.filter((p) => p.brandId === filters.brand || p.brandName.toLowerCase() === filters.brand!.toLowerCase());
  if (filters.category && filters.category !== 'all') products = products.filter((p) => p.categoryId === filters.category || p.categoryName.toLowerCase() === filters.category!.toLowerCase());
  if (filters.color && filters.color !== 'all') products = products.filter((p) => p.colors.some((color) => color.toLowerCase().includes(filters.color!.toLowerCase())));
  if (filters.size !== undefined) products = products.filter((p) => p.sizes.includes(Number(filters.size)));
  if (filters.minPrice !== undefined) products = products.filter((p) => p.price >= Number(filters.minPrice));
  if (filters.maxPrice !== undefined) products = products.filter((p) => p.price <= Number(filters.maxPrice));
  products.sort((a, b) => filters.sortBy === 'price_asc' ? a.price - b.price : filters.sortBy === 'price_desc' ? b.price - a.price : filters.sortBy === 'rating' ? b.rating - a.rating : filters.sortBy === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : Number(b.featured) - Number(a.featured));
  return { products, total: products.length, availableBrands: await storeRepository.getBrands(), availableCategories: await storeRepository.getCategories() };
}

export const getProduct = (id: string) => storeRepository.getProductById(id);
export const createProduct = (data: Omit<Product, 'id' | 'slug' | 'createdAt'>) => storeRepository.addProduct(data);
export const updateProduct = (id: string, data: Partial<Product>) => storeRepository.updateProduct(id, data);
export const deleteProduct = (id: string) => storeRepository.deleteProduct(id);
export const listCategories = () => storeRepository.getCategories();
export const listBrands = () => storeRepository.getBrands();
