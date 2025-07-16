
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ReferralLinkProps {
  profile: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'suporte' | 'cliente' | 'user';
    is_active: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    last_login: string;
    deleted_at: string;
    stats: {
      total_bits: number;
      pending_bits: number;
      confirmed_bits: number;
      referrals_count: number;
    };
  };
}

export const ReferralLink = ({ profile }: ReferralLinkProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate referral code from user ID (simplified version)
  const referralCode = profile.id.slice(0, 8).toUpperCase();
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        description: 'Link de referência copiado para a área de transferência!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        description: 'Erro ao copiar o link.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Link de Referência</CardTitle>
        <CardDescription>
          Compartilhe este link e ganhe BITS quando seus referidos se cadastrarem!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="referral-code">Código de Referência</Label>
          <div className="flex space-x-2">
            <Input
              id="referral-code"
              value={referralCode}
              readOnly
              className="font-mono"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral-link">Link Completo</Label>
          <div className="flex space-x-2">
            <Input
              id="referral-link"
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Como funciona:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Compartilhe seu link de referência</li>
            <li>• Quando alguém se cadastrar usando seu link, você ganha BITS</li>
            <li>• Quanto mais pessoas você referir, mais BITS você acumula</li>
            <li>• Use seus BITS para resgatar recompensas exclusivas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
