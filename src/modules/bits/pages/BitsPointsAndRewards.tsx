
// import React, { useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { PointsDisplay } from '@modules/bits/components/components/PointsDisplay';
// import { PointsHistory } from '@modules/bits/components/components/PointsHistory';
// import { RewardsList } from '@modules/bits/components/components/RewardsList';
// import { LevelProgress } from '@modules/bits/components/components/LevelProgress';
// import { UserBadgesList } from '@modules/bits/components/components/UserBadgesList';
// import { usePoints, useRewards, useBadges, useLevels } from '@modules/bits/hooks/useBits';
// import { useAuth } from '@/context/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Link } from 'react-router-dom';

// const BitsPointsAndRewards: React.FC = () => {
//   const { isAuthenticated } = useAuth();
//   const [activeTab, setActiveTab] = useState('rewards');
  
//   const { transactions, stats, isLoadingTransactions, isLoadingStats } = usePoints();
//   const { userRewards, isLoadingUserRewards } = useRewards();
//   const { userBadges, isLoadingUserBadges } = useBadges();
//   const { currentLevel, nextLevel, isLoadingCurrentLevel, isLoadingNextLevel } = useLevels();
  
//   if (!isAuthenticated) {
//     return (
//       <Card className="mx-auto max-w-md">
//         <CardHeader>
//           <CardTitle>Acesso restrito</CardTitle>
//           <CardContent>Faça login para acessar a plataforma BITS LEGAL™</CardContent>
//         </CardHeader>
//         <CardFooter>
//           <Link to="/login">
//             <Button>Fazer Login</Button>
//           </Link>
//         </CardFooter>
//       </Card>
//     );
//   }
  
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold">Pontos & Recompensas</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <PointsDisplay 
//           points={stats?.current_points_balance || 0}
//           label="Saldo de pontos"
//           size="lg"
//           className="lg:col-span-2"
//         />
        
//         <PointsDisplay 
//           points={stats?.total_points_earned || 0}
//           label="Total ganho"
//         />
        
//         <PointsDisplay 
//           points={userRewards?.length || 0}
//           label="Recompensas resgatadas"
//         />
//       </div>
      
//       <LevelProgress 
//         stats={stats} 
//         currentLevel={currentLevel} 
//         nextLevel={nextLevel}
//         className="max-w-full"
//       />
      
//       <Tabs defaultValue="rewards" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="rewards">Recompensas</TabsTrigger>
//           <TabsTrigger value="history">Histórico de pontos</TabsTrigger>
//           <TabsTrigger value="badges">Conquistas</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="rewards" className="pt-6">
//           <RewardsList />
//         </TabsContent>
        
//         <TabsContent value="history" className="pt-6">
//           <PointsHistory 
//             transactions={transactions} 
//             isLoading={isLoadingTransactions} 
//           />
//         </TabsContent>
        
//         <TabsContent value="badges" className="pt-6">
//           <UserBadgesList 
//             badges={userBadges || []}
//             isLoading={isLoadingUserBadges}
//           />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default BitsPointsAndRewards;
