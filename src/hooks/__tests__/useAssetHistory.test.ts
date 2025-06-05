
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { useAssetHistory } from '../useAssetHistory';
import { historyService } from '../../modules/assets/services/history/historyService';

vi.mock('../../modules/assets/services/history/historyService');

const mockLogs = [
  {
    id: 1,
    date: '2024-01-01T00:00:00Z',
    event: 'ASSOCIATION_CREATED',
    details: {},
    status_before: { status: 'old' },
    status_after: { status: 'new' },
    association: { asset: { uuid: 'a1', line_number: 1 }, client: { nome: 'Client1' } },
  },
  {
    id: 2,
    date: '2024-01-02T00:00:00Z',
    event: 'ASSOCIATION_CREATED',
    details: {},
    status_before: { status: 'old' },
    status_after: { status: 'new' },
    association: { asset: { uuid: 'a2', line_number: 2 }, client: { nome: 'Client2' } },
  },
];

describe('useAssetHistory', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  );

  it('returns all logs when no assetId is provided', async () => {
    (historyService.getAssetLogsWithRelations as any).mockResolvedValue(mockLogs);
    const { result } = renderHook(() => useAssetHistory(), { wrapper });
    await waitFor(() => !result.current.isLoading);
    expect(result.current.historyLogs).toHaveLength(2);
  });

  it('filters logs by assetId when provided', async () => {
    (historyService.getAssetLogsWithRelations as any).mockResolvedValue(mockLogs);
    const { result } = renderHook(() => useAssetHistory('a1'), { wrapper });
    await waitFor(() => !result.current.isLoading);
    expect(result.current.historyLogs).toHaveLength(1);
    expect(result.current.historyLogs[0].asset_name).toContain('1');
  });
});
