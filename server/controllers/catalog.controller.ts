import { Request, Response } from 'express';
import { ProductFilters } from '../../src/types.ts';
import { createProduct, deleteProduct, getProduct, listBrands, listCatalog, listCategories, updateProduct } from '../services/catalog.service.ts';

export async function listProducts(req: Request, res: Response) {
  const query = req.query as Record<string, string>;
  const filters: ProductFilters = {
    ...query,
    size: query.size ? Number(query.size) : undefined,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  };
  res.json(await listCatalog(filters));
}
export async function getProductController(req: Request, res: Response) { const product = await getProduct(req.params.id); if (!product) return res.status(404).json({ error: 'Product not found' }); res.json({ product }); }
export async function createProductController(req: Request, res: Response) {
  const { name, brandId, categoryId, price } = req.body;
  if (!name || !brandId || !categoryId || price === undefined) return res.status(400).json({ error: 'Name, Brand, Category, and Price are required' });
  const product = await createProduct({ ...req.body, name, brandId, categoryId, price: Number(price), brandName: '', categoryName: '', sku: req.body.sku || `SOV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, description: req.body.description || 'High-performance shoe crafted for style and athletic endurance.', gender: req.body.gender || 'Unisex', images: req.body.images?.length ? req.body.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'], colors: req.body.colors?.length ? req.body.colors : ['Black', 'White'], sizes: req.body.sizes?.length ? req.body.sizes : [8, 8.5, 9, 9.5, 10, 11], stock: Number(req.body.stock) || 10, rating: 5, reviewCount: 0, tags: Array.isArray(req.body.tags) ? req.body.tags : ['New Arrival'], featured: false, specs: req.body.specs || { material: 'Engineered breathable knit', cushioning: 'Responsive air foam', weight: '310g', origin: 'Imported' } });
  res.status(201).json({ product });
}
export async function updateProductController(req: Request, res: Response) { const product = await updateProduct(req.params.id, req.body); if (!product) return res.status(404).json({ error: 'Product not found' }); res.json({ product }); }
export async function deleteProductController(req: Request, res: Response) { if (!(await deleteProduct(req.params.id))) return res.status(404).json({ error: 'Product not found' }); res.json({ success: true, message: 'Product deleted' }); }
export async function categories(_req: Request, res: Response) { res.json({ categories: await listCategories() }); }
export async function brands(_req: Request, res: Response) { res.json({ brands: await listBrands() }); }
