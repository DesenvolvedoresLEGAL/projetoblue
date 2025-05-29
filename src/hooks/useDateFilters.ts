
import { useState, useEffect } from 'react';

export const useDateFilters = () => {
  const [entryDateFrom, setEntryDateFrom] = useState<Date | undefined>();
  const [entryDateTo, setEntryDateTo] = useState<Date | undefined>();
  const [exitDateFrom, setExitDateFrom] = useState<Date | undefined>();
  const [exitDateTo, setExitDateTo] = useState<Date | undefined>();
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  // Validação automática de datas
  useEffect(() => {
    let error = null;

    if (entryDateFrom && entryDateTo && entryDateFrom > entryDateTo) {
      error = 'A data inicial de entrada não pode ser maior que a data final';
    }

    if (exitDateFrom && exitDateTo && exitDateFrom > exitDateTo) {
      error = 'A data inicial de saída não pode ser maior que a data final';
    }

    if (entryDateFrom && exitDateTo && exitDateTo < entryDateFrom) {
      error = 'A data de saída não pode ser anterior à data de entrada';
    }

    setDateValidationError(error);
  }, [entryDateFrom, entryDateTo, exitDateFrom, exitDateTo]);

  // Função para limpar todos os filtros de data
  const clearDateFilters = () => {
    setEntryDateFrom(undefined);
    setEntryDateTo(undefined);
    setExitDateFrom(undefined);
    setExitDateTo(undefined);
    setDateValidationError(null);
  };

  // Função para verificar se há filtros de data ativos
  const hasActiveDateFilters = (): boolean => {
    return !!(entryDateFrom || entryDateTo || exitDateFrom || exitDateTo);
  };

  return {
    entryDateFrom,
    setEntryDateFrom,
    entryDateTo,
    setEntryDateTo,
    exitDateFrom,
    setExitDateFrom,
    exitDateTo,
    setExitDateTo,
    showDateFilters,
    setShowDateFilters,
    dateValidationError,
    clearDateFilters,
    hasActiveDateFilters
  };
};
