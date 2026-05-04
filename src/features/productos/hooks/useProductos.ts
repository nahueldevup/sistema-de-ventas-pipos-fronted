import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '../../../services/mock/product.service';
import type { Product } from '../../../schemas/product.schema';

export const useGetProductos = () => {
  return useQuery({
    queryKey: ['productos'],
    queryFn: () => ProductService.getAll(),
  });
};

export const useCreateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>) =>
      ProductService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useUpdateProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      ProductService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useDeleteProducto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ProductService.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};
export const useGetProductoById = (id: string | undefined) => {
  return useQuery({
    // Usamos un array que incluye el ID para que TanStack Query cachee cada producto por separado
    queryKey: ['productos', id],
    queryFn: () => {
      if (!id) throw new Error('ID de producto requerido');
      return ProductService.getById(id);
    },
    enabled: !!id, // La consulta solo se dispara si el ID existe (evita errores al montar componentes vacíos)
  });
};