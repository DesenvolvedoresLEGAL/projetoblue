
// import React from 'react';
// import { ReferralForm } from '@modules/bits/components/components/ReferralForm';
// import { ReferralLink } from '@modules/bits/components/components/ReferralLink';
// import { useAuth } from '@/context/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Link } from 'react-router-dom';

// const BitsIndicateNow: React.FC = () => {
//   const { isAuthenticated } = useAuth();
  
//   if (!isAuthenticated) {
//     return (
//       <Card className="mx-auto max-w-md">
//         <CardHeader>
//           <CardTitle>Acesso restrito</CardTitle>
//           <CardContent>Faça login para acessar a plataforma BITS LEGAL™</CardContent>
//         </CardHeader>
//         <CardContent>
//           <Link to="/login">
//             <Button>Fazer Login</Button>
//           </Link>
//         </CardContent>
//       </Card>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold">Indicar Agora</h1>
//       <p className="text-muted-foreground">
//         Indique pessoas e empresas para usar nossos serviços e ganhe pontos para trocar por recompensas.
//       </p>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <ReferralForm />
        
//         <div className="space-y-6">
//           <ReferralLink />
          
//           <Card>
//             <CardHeader>
//               <CardTitle>Como funciona?</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <h3 className="font-semibold">1. Indique um amigo</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Preencha o formulário com os dados do seu amigo ou compartilhe seu link de indicação.
//                 </p>
//               </div>
              
//               <div className="space-y-2">
//                 <h3 className="font-semibold">2. Seu amigo se cadastra</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Quando seu amigo se cadastrar usando seu link ou quando sua indicação for processada, a indicação será registrada.
//                 </p>
//               </div>
              
//               <div className="space-y-2">
//                 <h3 className="font-semibold">3. Ganhe pontos</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Você ganha pontos quando a indicação é aprovada e mais pontos quando seu amigo se torna cliente.
//                 </p>
//               </div>
              
//               <div className="space-y-2">
//                 <h3 className="font-semibold">4. Troque por recompensas</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Acumule pontos e troque por recompensas exclusivas no catálogo de recompensas.
//                 </p>
//               </div>
              
//               <div className="pt-4 mt-4 border-t">
//                 <Link to="/bits/rewards">
//                   <Button variant="outline">Ver recompensas disponíveis</Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BitsIndicateNow;
