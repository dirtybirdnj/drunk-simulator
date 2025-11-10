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
  worldWidth: number;   // in tiles (cols)
  worldHeight: number;  // in tiles (rows)
  starterLayout?: string; // Encoded map layout for this level
}

// Sample starter layouts (encoded as compressed strings)
// Format: Each character represents a tile type (0-9)
// 0=empty, 1=floor, 2=wall, 3=bartop, 4=register, 5=door, 6=tap, 7=staff spawn
const MINI_STARTER = '0000220000002666200000233320000022222000001111100000111110000011111000001111100000111110000011111000001111100000511110000022222000002222200000222220';
const SMALL_STARTER = '000000220000000000266662000000000233333200000000222222220000000011111111000000001111111100000000111111110000000011111111000000001111111100000000111111110000000011111111000000001111111100000000111111110000000051111110000000002222222000000000222222200000000022222220';
const MEDIUM_STARTER = '00000000220000000000000002666666200000000000023333333320000000000022222222220000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000111111111110000000000511111111110000000000222222222220000000000222222222220000000000222222222220';

export const LEVEL_CONFIGS: Record<LevelSize, LevelConfig> = {
  [LevelSize.MINI]: {
    size: LevelSize.MINI,
    name: 'Mini Bar',
    cashThreshold: 50,
    description: 'Run a tiny corner bar',
    worldWidth: 10,   // 10 tiles wide
    worldHeight: 18,   // 18 tiles tall (9:16 ratio)
    starterLayout: MINI_STARTER
  },
  [LevelSize.SMALL]: {
    size: LevelSize.SMALL,
    name: 'Small Bar',
    cashThreshold: 150,
    description: 'Manage a cozy neighborhood bar',
    worldWidth: 15,   // 15 tiles wide
    worldHeight: 27,   // 27 tiles tall (9:16 ratio)
    starterLayout: SMALL_STARTER
  },
  [LevelSize.MEDIUM]: {
    size: LevelSize.MEDIUM,
    name: 'Medium Bar',
    cashThreshold: 300,
    description: 'Command a bustling downtown establishment',
    worldWidth: 20,   // 20 tiles wide
    worldHeight: 36,   // 36 tiles tall (9:16 ratio)
    starterLayout: MEDIUM_STARTER
  }
};

export interface GameState {
  currentLevel: LevelSize;
  cashEarned: number;
  levelComplete: boolean;
}
