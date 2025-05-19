
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";

const RankingAndBadgesDisplay: React.FC = () => {
  // Placeholder data
  const rankings = [
    { name: "User Alpha", points: 10500, position: 1 },
    { name: "User Beta", points: 9800, position: 2 },
    { name: "User Gamma", points: 9200, position: 3 },
  ];

  const badges = [
    { name: "First Referral", icon: <Star className="w-10 h-10 text-yellow-400" />, description: "Made your first successful referral!" },
    { name: "Top Referrer", icon: <Trophy className="w-10 h-10 text-amber-500" />, description: "Reached the Top 10 in referrals this month." },
    { name: "Points Hoarder", icon: <Star className="w-10 h-10 text-green-500" />, description: "Accumulated over 10,000 points." },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rankings.map((user) => (
              <li key={user.position} className="flex justify-between items-center p-2 border-b last:border-b-0">
                <span className="font-medium">{user.position}. {user.name}</span>
                <span className="text-muted-foreground">{user.points.toLocaleString()} BITS</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-4">Ranking is updated monthly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="mr-2 h-6 w-6 text-primary" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center text-center p-4 border rounded-lg">
                  {badge.icon}
                  <h3 className="mt-2 font-semibold">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't earned any badges yet. Keep referring and participating!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingAndBadgesDisplay;
