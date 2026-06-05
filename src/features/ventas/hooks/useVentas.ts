import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SaleService } from '@/services/mock/sale.service';
import type { Sale } from '@/schemas/sale.schema';

export const useGetVentas = () => {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: () => SaleService.getAll(),
  });
};

export const useGetVentasHoy = () => {
  return useQuery({
    queryKey: ['ventas', 'hoy'],
    queryFn: () => SaleService.getTodaySales(),
  });
};

export const useCreateVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt' | 'saleNumber'>) =>
      SaleService.create(data),
    onSuccess: () => {
      // Invalidar ventas Y productos (porque cambió el stock)
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};

export const useCancelVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, cancelledBy }: { id: string; reason: string; cancelledBy: string }) =>
      SaleService.cancel(id, reason, cancelledBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
};
