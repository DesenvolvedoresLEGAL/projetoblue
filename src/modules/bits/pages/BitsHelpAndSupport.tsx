
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Mail, MessageSquare, Phone } from 'lucide-react';

const BitsHelpAndSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ajuda & Suporte BITS™</h1>
      <p className="text-muted-foreground">
        Dúvidas frequentes, tutoriais e canais de suporte para o programa BITS LEGAL™.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas frequentes</CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns sobre o programa BITS LEGAL™
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como funciona o programa de indicação?</AccordionTrigger>
                  <AccordionContent>
                    O programa BITS LEGAL™ permite que você indique amigos e empresas. Você ganha pontos quando suas indicações se cadastram e ainda mais pontos quando elas se tornam clientes. Esses pontos podem ser trocados por recompensas exclusivas.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como faço para indicar alguém?</AccordionTrigger>
                  <AccordionContent>
                    Você pode indicar alguém de duas maneiras: preenchendo o formulário de indicação com os dados da pessoa ou compartilhando seu link de indicação exclusivo para que a pessoa acesse diretamente.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Quantos pontos eu ganho por indicação?</AccordionTrigger>
                  <AccordionContent>
                    Você ganha 50 pontos quando sua indicação é aprovada e mais 200 pontos quando a pessoa se torna cliente. Em campanhas especiais, esses valores podem ser maiores.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>O que são badges e como eu as ganho?</AccordionTrigger>
                  <AccordionContent>
                    Badges são conquistas que você desbloqueia ao atingir certos marcos no programa, como fazer 5 indicações, ter 3 indicações convertidas em clientes, ou resgatar sua primeira recompensa.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Como resgato minhas recompensas?</AccordionTrigger>
                  <AccordionContent>
                    Acesse a seção "Pontos & Recompensas", escolha a recompensa desejada e clique em "Resgatar". Após a confirmação, você receberá instruções sobre como receber sua recompensa.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger>Por que minha indicação foi rejeitada?</AccordionTrigger>
                  <AccordionContent>
                    Uma indicação pode ser rejeitada se a pessoa já for cliente, se já tiver sido indicada por outra pessoa, se os dados estiverem incorretos ou incompletos, ou se não atender aos critérios do programa.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7">
                  <AccordionTrigger>Os pontos expiram?</AccordionTrigger>
                  <AccordionContent>
                    Sim, os pontos têm validade de 12 meses a partir da data em que foram ganhos. Recomendamos que você resgate suas recompensas regularmente.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
              <CardDescription>
                Entre em contato com nosso suporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>suporte@bits.legal</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>(00) 1234-5678</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span>Chat online (8h às 18h)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enviar mensagem</CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para entrar em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Seu nome" />
                </div>
                
                <div className="space-y-2">
                  <Input type="email" placeholder="Seu email" />
                </div>
                
                <div className="space-y-2">
                  <Input placeholder="Assunto" />
                </div>
                
                <div className="space-y-2">
                  <Textarea placeholder="Mensagem" rows={4} />
                </div>
                
                <Button className="w-full">
                  Enviar mensagem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BitsHelpAndSupport;
