import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfileStats, Level } from '@modules/bits/types';

interface LevelProgressProps {
  stats: UserProfileStats | null;
  currentLevel: Level | null;
  nextLevel: Level | null;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  stats,
  currentLevel,
  nextLevel,
  className = '',
}) => {
  // If no data is available yet
  if (!stats || !currentLevel) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Nível</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-xl font-bold">Nível 1</div>
          <Progress value={0} className="h-2 mt-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0 pontos</span>
            <span>--</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress to next level
  const currentPoints = stats.current_points_balance;
  let progress = 100;
  let pointsToNextLevel = 0;
  let progressDisplay = '100%';

  if (nextLevel) {
    const pointsForCurrentLevel = currentLevel.points_required;
    const pointsForNextLevel = nextLevel.points_required;
    const pointsRange = pointsForNextLevel - pointsForCurrentLevel;
    const pointsEarned = currentPoints - pointsForCurrentLevel;
    
    pointsToNextLevel = pointsForNextLevel - currentPoints;
    progress = Math.min(100, Math.max(0, Math.floor((pointsEarned / pointsRange) * 100)));
    progressDisplay = `${progress}%`;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Nível</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">{currentLevel.name}</div>
          {nextLevel && (
            <div className="text-xs text-gray-500">
              Próximo: {nextLevel.name}
            </div>
          )}
        </div>
        
        <Progress value={progress} className="h-2 mt-3" />
        
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{progressDisplay}</span>
          {nextLevel ? (
            <span>{pointsToNextLevel} pontos para o próximo nível</span>
          ) : (
            <span>Nível máximo atingido</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
