export enum LevelSize {
  MINI = 'MINI',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM'
}

export interface LevelConfig {
  size: LevelSize;
  name: string;
  cashThreshold: number;
  description: string;
}

export const LEVEL_CONFIGS: Record<LevelSize, LevelConfig> = {
  [LevelSize.MINI]: {
    size: LevelSize.MINI,
    name: 'Mini Bar',
    cashThreshold: 50,
    description: 'Run a tiny corner bar'
  },
  [LevelSize.SMALL]: {
    size: LevelSize.SMALL,
    name: 'Small Bar',
    cashThreshold: 150,
    description: 'Manage a cozy neighborhood bar'
  },
  [LevelSize.MEDIUM]: {
    size: LevelSize.MEDIUM,
    name: 'Medium Bar',
    cashThreshold: 300,
    description: 'Command a bustling downtown establishment'
  }
};

export interface GameState {
  currentLevel: LevelSize;
  cashEarned: number;
  levelComplete: boolean;
}
