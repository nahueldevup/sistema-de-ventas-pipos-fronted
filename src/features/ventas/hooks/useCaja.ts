import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CashRegisterService } from '@/services/mock/cash-register.service';

/** Obtener la caja abierta actual (o null) */
export const useGetCajaAbierta = () => {
  return useQuery({
    queryKey: ['caja', 'abierta'],
    queryFn: () => CashRegisterService.getOpen(),
    refetchOnWindowFocus: true,
  });
};

/** Abrir una caja nueva */
export const useAbrirCaja = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ initialAmount, note }: { initialAmount: number; note?: string }) =>
      CashRegisterService.open(initialAmount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja'] });
    },
  });
};

/** Cerrar la caja actual */
export const useCerrarCaja = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cashRegisterId,
      countedAmount,
      note,
    }: {
      cashRegisterId: string;
      countedAmount: number;
      note?: string;
    }) => CashRegisterService.close(cashRegisterId, countedAmount, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja'] });
    },
  });
};

/** Obtener resumen de la caja para cierre */
export const useGetResumenCaja = (cashRegisterId: string | undefined) => {
  return useQuery({
    queryKey: ['caja', 'resumen', cashRegisterId],
    queryFn: () => {
      if (!cashRegisterId) throw new Error('ID de caja requerido');
      return CashRegisterService.getSummary(cashRegisterId);
    },
    enabled: !!cashRegisterId,
  });
};
