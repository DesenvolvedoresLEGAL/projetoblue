
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterAsset from '@/pages/RegisterAsset';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { uuid: 'new-asset-123', type_id: 1 }, 
            error: null 
          })
        })
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    })
  }
}));

// Mock toast notifications
vi.mock('@/utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the useReferenceData hook
vi.mock('@/hooks/useReferenceData', () => ({
  useReferenceData: () => ({
    manufacturers: [{ id: 1, name: 'Test Manufacturer' }],
    plans: [{ id: 1, nome: 'Test Plan', tamanho_gb: 10 }],
    assetStatus: [{ id: 1, status: 'disponivel' }],
    assetSolutions: [{ id: 1, solution: 'Test Solution' }],
    isLoading: false
  })
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('RegisterAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component', () => {
    render(<RegisterAsset />, { wrapper: createWrapper() });
    expect(screen.getByText('Cadastrar Novo Ativo')).toBeInTheDocument();
  });

  it('allows switching between asset types', async () => {
    render(<RegisterAsset />, { wrapper: createWrapper() });
    
    // Default should be CHIP
    expect(screen.getByText('Dados do Chip')).toBeInTheDocument();
    
    // Switch to SPEEDY
    fireEvent.click(screen.getByText('SPEEDY 5G'));
    
    // Should now show router fields
    expect(screen.getByText('Dados do Roteador')).toBeInTheDocument();
  });

  it('submits the form with chip data', async () => {
    render(<RegisterAsset />, { wrapper: createWrapper() });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/ICCID/i), { target: { value: '12345678901234567890' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    
    // Check if Supabase was called
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('assets');
      expect(supabase.from('assets').insert).toHaveBeenCalled();
    });
  });

  it('shows validation errors for invalid data', async () => {
    render(<RegisterAsset />, { wrapper: createWrapper() });
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/ICCID é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('disables submit button during submission', async () => {
    // Mock a delayed response
    vi.mocked(supabase.from('assets').insert().select().single).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { uuid: 'new-asset-123' }, error: null }), 100))
    );
    
    render(<RegisterAsset />, { wrapper: createWrapper() });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/ICCID/i), { target: { value: '12345678901234567890' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    fireEvent.click(submitButton);
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
    
    // After submission completes, button should be enabled again
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
