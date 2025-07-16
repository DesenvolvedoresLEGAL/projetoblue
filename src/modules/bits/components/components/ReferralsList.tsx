
// import React from 'react';
// import { 
//   Table, 
//   TableBody, 
//   TableCaption, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from '@/components/ui/table';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { StatusBadge } from './StatusBadge';
// import { Referral } from '@modules/bits/types';
// import { format } from 'date-fns';

// interface ReferralsListProps {
//   referrals: Referral[];
//   isLoading: boolean;
//   className?: string;
// }

// export const ReferralsList: React.FC<ReferralsListProps> = ({ 
//   referrals, 
//   isLoading,
//   className = '' 
// }) => {
//   if (isLoading) {
//     return (
//       <Card className={className}>
//         <CardHeader>
//           <CardTitle>Minhas indicações</CardTitle>
//           <CardDescription>Carregando...</CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   if (referrals.length === 0) {
//     return (
//       <Card className={className}>
//         <CardHeader>
//           <CardTitle>Minhas indicações</CardTitle>
//           <CardDescription>
//             Você ainda não fez nenhuma indicação. Indique amigos e ganhe pontos!
//           </CardDescription>
//         </CardHeader>
//       </Card>
//     );
//   }

//   return (
//     <Card className={className}>
//       <CardHeader>
//         <CardTitle>Minhas indicações</CardTitle>
//         <CardDescription>
//           Acompanhe o status e pontuação das suas indicações
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <Table>
//             <TableCaption>Lista das suas indicações</TableCaption>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Nome</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead>Data</TableHead>
//                 <TableHead className="text-center">Status</TableHead>
//                 <TableHead className="text-right">Pontos</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {referrals.map((referral) => (
//                 <TableRow key={referral.id}>
//                   <TableCell>{referral.referred_name}</TableCell>
//                   <TableCell>{referral.referred_email}</TableCell>
//                   <TableCell>{format(new Date(referral.created_at), 'dd/MM/yyyy')}</TableCell>
//                   <TableCell className="text-center">
//                     <StatusBadge status={referral.status} />
//                   </TableCell>
//                   <TableCell className="text-right font-medium">
//                     {referral.points_earned}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
