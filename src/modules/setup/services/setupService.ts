import { supabase } from '@/integrations/supabase/client';
import type { 
  Setup, 
  SetupFormData, 
  SetupDetailedView,
  QRScanResult,
  SetupStatus 
} from '../types';

export class SetupService {
  // Start a new setup
  static async startSetup(orderId: string, technicianId?: string): Promise<{ setup_id: string; status: SetupStatus }> {
    const { data, error } = await supabase
      .from('setups')
      .insert({
        order_id: orderId,
        technician_id: technicianId,
        status: 'in_progress' as SetupStatus
      })
      .select('id, status')
      .single();

    if (error) throw error;
    
    return {
      setup_id: data.id,
      status: data.status
    };
  }

  // Complete a setup
  static async completeSetup(setupId: string, formData: SetupFormData): Promise<void> {
    const { error } = await supabase
      .from('setups')
      .update({
        status: 'completed' as SetupStatus,
        completed_at: new Date().toISOString()
      })
      .eq('id', setupId);

    if (error) throw error;

    // Insert speed test
    await supabase
      .from('speed_tests')
      .insert({
        setup_id: setupId,
        download_mbps: formData.speed_test.download_mbps,
        upload_mbps: formData.speed_test.upload_mbps,
        ping_ms: formData.speed_test.ping_ms
      });

    // TODO: Handle photo uploads and signature storage
    // This would involve encrypted storage implementation
  }

  // Get setup details
  static async getSetup(setupId: string): Promise<SetupDetailedView> {
    const { data, error } = await supabase
      .from('vw_setups_detailed')
      .select('*')
      .eq('id', setupId)
      .single();

    if (error) throw error;
    return {
      ...data,
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address
    } as SetupDetailedView;
  }

  // Get setups for technician
  static async getSetupsForTechnician(
    technicianId: string,
    filters?: {
      status?: SetupStatus;
      from?: string;
      to?: string;
    }
  ): Promise<SetupDetailedView[]> {
    let query = supabase
      .from('vw_setups_detailed')
      .select('*')
      .eq('technician_id', technicianId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }

    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      address: typeof item.address === 'string' ? JSON.parse(item.address) : item.address
    })) as SetupDetailedView[];
  }

  // Approve setup (supervisor)
  static async approveSetup(setupId: string): Promise<void> {
    const { error } = await supabase
      .from('setups')
      .update({
        status: 'approved' as SetupStatus,
        approved_at: new Date().toISOString()
      })
      .eq('id', setupId);

    if (error) throw error;
  }

  // Reject setup (supervisor)
  static async rejectSetup(setupId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('setups')
      .update({
        status: 'rejected' as SetupStatus,
        rejected_reason: reason
      })
      .eq('id', setupId);

    if (error) throw error;
  }

  // Parse QR Code
  static parseQRCode(qrCode: string): QRScanResult {
    // Format: BLU-{type}-{id}
    const parts = qrCode.split('-');
    
    if (parts.length !== 3 || parts[0] !== 'BLU') {
      throw new Error('Invalid QR Code format');
    }

    const type = parts[1].toLowerCase() as 'o' | 'a';
    const id = parts[2];

    return {
      type: type === 'o' ? 'order' : 'asset',
      id
    };
  }

  // Generate QR Code for asset
  static async refreshAssetQR(assetId: string): Promise<string> {
    const newQrCode = `BLU-A-${assetId}`;
    
    const { error } = await supabase
      .from('setup_assets')
      .update({ qr_code: newQrCode })
      .eq('id', assetId);

    if (error) throw error;
    return newQrCode;
  }
}