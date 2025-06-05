
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, RefreshCw } from 'lucide-react';
import { useBitsProfile } from '../../hooks/useBits';
import { toast } from '@/utils/toast';

interface ReferralLinkProps {
  className?: string;
}

export const ReferralLink: React.FC<ReferralLinkProps> = ({ className = '' }) => {
  const { profile, isLoading, generateReferralCode, isGenerating } = useBitsProfile();
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = () => {
    generateReferralCode();
  };

  const baseUrl = window.location.origin;
  const referralUrl = profile?.bits_referral_code 
    ? `${baseUrl}/register?ref=${profile.bits_referral_code}`
    : '';

  const copyToClipboard = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl)
        .then(() => {
          setCopied(true);
          toast.success('Link copiado para a área de transferência!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast.error('Não foi possível copiar o link');
        });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Seu link de indicação</CardTitle>
        <CardDescription>
          Compartilhe este link com seus amigos para ganhar pontos quando eles se registrarem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
        ) : profile?.bits_referral_code ? (
          <div className="flex space-x-2">
            <Input 
              readOnly
              value={referralUrl}
              className="font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-gray-500 mb-2">
              Você ainda não tem um código de indicação.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {profile?.bits_referral_code ? (
            `Seu código: ${profile.bits_referral_code}`
          ) : (
            'Gere seu código para começar a indicar'
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateCode}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : profile?.bits_referral_code ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar novo código
            </>
          ) : (
            'Gerar código'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
