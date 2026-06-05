import { type Product, ProductSchema } from '../../schemas/product.schema';
import { PRODUCTOS_EJEMPLO } from '../../datos/productos.datos';
import { generateId } from '../../lib/utils';

export class ProductService {
  private static STORAGE_KEY = 'pipos_mock_products';

  private static delay<T>(data: T, ms = 500): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  private static getStorage(): Product[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      } else {
        this.setStorage(PRODUCTOS_EJEMPLO);
        return PRODUCTOS_EJEMPLO;
      }
    } catch (error) {
      console.error('Error al leer de localStorage:', error);
      return [];
    }
  }

  private static setStorage(data: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error al escribir en localStorage:', error);
    }
  }

  static async getAll(): Promise<Product[]> {
    const products = this.getStorage();
    const activeProducts = products.filter((p) => !p.isDeleted);
    return await this.delay(activeProducts);
  }

  static async getById(id: string): Promise<Product | null> {
    const products = this.getStorage();
    const product = products.find((p) => p.id === id) || null;
    return await this.delay(product);
  }

  static async create(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>
  ): Promise<Product> {
    const newProduct = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validar con Zod para asegurar la integridad de los datos
    const validatedProduct = ProductSchema.parse(newProduct);

    const products = this.getStorage();
    products.push(validatedProduct);
    this.setStorage(products);

    return await this.delay(validatedProduct);
  }

  static async update(id: string, data: Partial<Product>): Promise<Product> {
    const products = this.getStorage();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    const updatedProduct = {
      ...products[index],
      ...data,
      updatedAt: new Date(),
    };

    // Validar la actualización con Zod
    const validatedProduct = ProductSchema.parse(updatedProduct);

    products[index] = validatedProduct;
    this.setStorage(products);

    return await this.delay(validatedProduct);
  }

  static async softDelete(id: string): Promise<void> {
    const products = this.getStorage();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    products[index] = {
      ...products[index],
      isDeleted: true,
      updatedAt: new Date(),
    };

    this.setStorage(products);

    return await this.delay(undefined);
  }
}
