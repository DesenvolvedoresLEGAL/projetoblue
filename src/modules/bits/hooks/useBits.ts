
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { bitsService } from '../services/bitsService';
import { Referral } from '../types';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toast';

// Create a queryClient instance
const queryClient = new QueryClient();

// Hook for referrals
export const useReferrals = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: referrals = [],
    isLoading: isLoadingReferrals,
    error: referralsError,
    refetch: refetchReferrals
  } = useQuery({
    queryKey: ['bits', 'referrals'],
    queryFn: () => bitsService.referral.getUserReferrals(),
    enabled: isAuthenticated
  });
  
  const createReferralMutation = useMutation({
    mutationFn: (referralData: Omit<Referral, 'id' | 'referrer_user_id' | 'status' | 'points_earned' | 'created_at' | 'updated_at'>) => 
      bitsService.referral.createReferral(referralData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits', 'referrals'] });
      toast.success("Indicação registrada com sucesso!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao criar indicação';
      toast.error(message);
    }
  });
  
  return {
    referrals,
    isLoadingReferrals,
    referralsError,
    refetchReferrals,
    createReferral: createReferralMutation.mutate,
    isCreating: createReferralMutation.isPending
  };
};

// Hook for points
export const usePoints = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['bits', 'points', 'transactions'],
    queryFn: () => bitsService.points.getPointTransactions(),
    enabled: isAuthenticated
  });
  
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['bits', 'points', 'stats'],
    queryFn: () => bitsService.points.getUserStats(),
    enabled: isAuthenticated
  });
  
  return {
    transactions,
    stats,
    isLoadingTransactions,
    isLoadingStats,
    transactionsError,
    statsError,
    refetchTransactions,
    refetchStats,
    refetchAll: () => {
      refetchTransactions();
      refetchStats();
    }
  };
};

// Hook for rewards
export const useRewards = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: availableRewards = [],
    isLoading: isLoadingRewards,
    error: rewardsError,
    refetch: refetchRewards
  } = useQuery({
    queryKey: ['bits', 'rewards', 'available'],
    queryFn: () => bitsService.rewards.getAvailableRewards(),
    enabled: isAuthenticated
  });
  
  const {
    data: userRewards = [],
    isLoading: isLoadingUserRewards,
    error: userRewardsError,
    refetch: refetchUserRewards
  } = useQuery({
    queryKey: ['bits', 'rewards', 'user'],
    queryFn: () => bitsService.rewards.getUserRewards(),
    enabled: isAuthenticated
  });
  
  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: string) => bitsService.rewards.redeemReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits', 'rewards'] });
      queryClient.invalidateQueries({ queryKey: ['bits', 'points'] });
      toast.success("Recompensa resgatada com sucesso!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao resgatar recompensa';
      toast.error(message);
    }
  });
  
  return {
    availableRewards,
    userRewards,
    isLoadingRewards,
    isLoadingUserRewards,
    rewardsError,
    userRewardsError,
    refetchRewards,
    refetchUserRewards,
    redeemReward: redeemRewardMutation.mutate,
    isRedeeming: redeemRewardMutation.isPending
  };
};

// Hook for badges
export const useBadges = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: allBadges = [],
    isLoading: isLoadingBadges,
    error: badgesError,
    refetch: refetchBadges
  } = useQuery({
    queryKey: ['bits', 'badges', 'all'],
    queryFn: () => bitsService.badges.getAllBadges(),
    enabled: isAuthenticated
  });
  
  const {
    data: userBadges = [],
    isLoading: isLoadingUserBadges,
    error: userBadgesError,
    refetch: refetchUserBadges
  } = useQuery({
    queryKey: ['bits', 'badges', 'user'],
    queryFn: () => bitsService.badges.getUserBadges(),
    enabled: isAuthenticated
  });
  
  return {
    allBadges,
    userBadges,
    isLoadingBadges,
    isLoadingUserBadges,
    badgesError,
    userBadgesError,
    refetchBadges,
    refetchUserBadges
  };
};

// Hook for campaigns
export const useCampaigns = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: activeCampaigns = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bits', 'campaigns'],
    queryFn: () => bitsService.campaigns.getActiveCampaigns(),
    enabled: isAuthenticated
  });
  
  return {
    activeCampaigns,
    isLoading,
    error,
    refetch
  };
};

// Hook for missions
export const useMissions = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: activeMissions = [],
    isLoading: isLoadingMissions,
    error: missionsError,
    refetch: refetchMissions
  } = useQuery({
    queryKey: ['bits', 'missions', 'active'],
    queryFn: () => bitsService.missions.getActiveMissions(),
    enabled: isAuthenticated
  });
  
  const {
    data: userMissions = [],
    isLoading: isLoadingUserMissions,
    error: userMissionsError,
    refetch: refetchUserMissions
  } = useQuery({
    queryKey: ['bits', 'missions', 'user'],
    queryFn: () => bitsService.missions.getUserMissions(),
    enabled: isAuthenticated
  });
  
  return {
    activeMissions,
    userMissions,
    isLoadingMissions,
    isLoadingUserMissions,
    missionsError,
    userMissionsError,
    refetchMissions,
    refetchUserMissions
  };
};

// Hook for levels
export const useLevels = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: allLevels = [],
    isLoading: isLoadingLevels,
    error: levelsError,
    refetch: refetchLevels
  } = useQuery({
    queryKey: ['bits', 'levels', 'all'],
    queryFn: () => bitsService.levels.getAllLevels(),
    enabled: isAuthenticated
  });
  
  const {
    data: currentLevel,
    isLoading: isLoadingCurrentLevel,
    error: currentLevelError,
    refetch: refetchCurrentLevel
  } = useQuery({
    queryKey: ['bits', 'levels', 'current'],
    queryFn: () => bitsService.levels.getUserLevel(),
    enabled: isAuthenticated
  });
  
  const {
    data: nextLevel,
    isLoading: isLoadingNextLevel,
    error: nextLevelError,
    refetch: refetchNextLevel
  } = useQuery({
    queryKey: ['bits', 'levels', 'next'],
    queryFn: () => bitsService.levels.getNextLevel(),
    enabled: isAuthenticated
  });
  
  return {
    allLevels,
    currentLevel,
    nextLevel,
    isLoadingLevels,
    isLoadingCurrentLevel,
    isLoadingNextLevel,
    levelsError,
    currentLevelError,
    nextLevelError,
    refetchLevels,
    refetchCurrentLevel,
    refetchNextLevel
  };
};

// Hook for BITS profile
export const useBitsProfile = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bits', 'profile'],
    queryFn: () => bitsService.profile.getUserBitsProfile(),
    enabled: isAuthenticated
  });
  
  const generateReferralCodeMutation = useMutation({
    mutationFn: () => bitsService.profile.generateReferralCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bits', 'profile'] });
      toast.success("Código de indicação gerado com sucesso!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro ao gerar código de indicação';
      toast.error(message);
    }
  });
  
  return {
    profile,
    isLoading,
    error,
    refetch,
    generateReferralCode: generateReferralCodeMutation.mutate,
    isGenerating: generateReferralCodeMutation.isPending
  };
};
