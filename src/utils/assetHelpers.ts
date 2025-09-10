// Minimal asset helpers to replace deleted file
import { AssetType } from '@/types/asset';

export class AssetHelpers {
  static isChipAsset(solutionId: number): boolean {
    return solutionId === 11;
  }

  static getAssetTypeFromSolutionId(solutionId: number): AssetType {
    return solutionId === 11 ? 'CHIP' : 'EQUIPMENT';
  }

  static getSolutionTypeFromId(solutionId: number): string {
    return solutionId === 11 ? 'CHIP' : 'EQUIPMENT';
  }
}

export const mapSolutionToType = (solutionId: number): string => {
  return solutionId === 11 ? 'CHIP' : 'EQUIPMENT';
};

export const safeParseNumber = (value: unknown): number => {
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const isValidFilterValue = (value: unknown): boolean => {
  return value != null && value !== '';
};