
# BITS LEGAL™ Platform

This directory contains the implementation of the BITS LEGAL™ platform, a referral and loyalty program.

## Directory Structure

- `/components`: Shared components used across BITS modules
- `/dashboard`: Dashboard overview components
- `/referral`: Referral system components
- `/points`: Points management components
- `/rewards`: Rewards catalog and redemption components
- `/badges`: Badges and achievements components
- `/admin`: Admin panel components
- `/hooks`: Custom hooks for BITS functionality
- `/services`: Integration services for BITS platform
- `/types`: TypeScript type definitions
- `/utils`: Utility functions

## Database Schema Integration

Before each module implementation, we analyzed the Supabase schema to ensure proper integration:
- Tables: bits_referrals, bits_points_log, bits_rewards_catalog, bits_user_rewards, bits_badges_catalog, bits_user_badges, bits_campaigns
- User profiles integration through the profiles table
- Appropriate relationships between referrals, points, and rewards

## Module Usage

### Dashboard
The central hub for users to access all BITS features. Shows summary of points, rewards, and recent activities.

### Referral System
Allows users to refer others through a form or shareable link. Tracks referral statuses.

### Points Management
Displays point balance, history, and breakdown of earned points.

### Rewards
Shows available rewards, allows redemption, and displays redemption history.

### Badges
Displays achievements and progress toward new badges.

### Admin Panel
For platform administrators to manage referrals, rewards, and campaigns.

## Extending Functionality

To add new features:
1. Check if related components exist in the directory structure
2. Analyze database schema for related tables
3. Create necessary type definitions based on the schema
4. Implement components and services
5. Update routes in the main BITS page
