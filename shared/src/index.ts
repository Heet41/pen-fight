// ─── Game Constants ───────────────────────────────────────────────────────────
export const GAME_CONFIG = {
  ARENA_WIDTH: 700,
  ARENA_HEIGHT: 500,
  PEN_RADIUS: 18,
  PEN_MASS: 1.0,
  FRICTION: 0.97,           // velocity multiplier per frame (< 1 = friction)
  RESTITUTION: 0.7,         // bounciness (0 = no bounce, 1 = perfect bounce)
  MIN_VELOCITY: 0.1,        // below this velocity, pen stops
  MAX_POWER: 100,
  MIN_POWER: 10,
  MAX_SPEED: 25,            // max velocity from a shot
  TURN_TIMEOUT_MS: 30000,   // 30 seconds per turn
  ROOM_CODE_LENGTH: 6,
  ROOM_EXPIRE_HOURS: 2,
} as const;

// ─── Socket Events ─────────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECTED: 'server:connected',
  
  // Room events
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_READY: 'room:ready',
  ROOM_UPDATED: 'room:updated',
  ROOM_ERROR: 'room:error',
  
  // Game events
  GAME_START: 'game:start',
  GAME_STATE: 'game:state',
  GAME_TURN: 'game:turn',
  GAME_SHOT: 'game:shot',
  GAME_PHYSICS: 'game:physics',
  GAME_COLLISION: 'game:collision',
  GAME_ENDED: 'game:ended',
  
  // Player events
  PLAYER_DISCONNECT: 'player:disconnect',
  PLAYER_RECONNECT: 'player:reconnect',
  PLAYER_REACTION: 'player:reaction',
  
  // Rematch
  REMATCH_REQUEST: 'rematch:request',
  REMATCH_ACCEPT: 'rematch:accept',
  REMATCH_DECLINE: 'rematch:decline',
  
  // Social
  REACTION_SEND: 'reaction:send',
  REACTION_RECEIVE: 'reaction:receive',
  QUICKCHAT_SEND: 'quickchat:send',
  QUICKCHAT_RECEIVE: 'quickchat:receive',
  
  // Matchmaking
  MATCHMAKING_JOIN: 'matchmaking:joined',
  MATCHMAKING_SEARCHING: 'matchmaking:searching',
  MATCHMAKING_FOUND: 'matchmaking:found',
  MATCHMAKING_CANCELLED: 'matchmaking:cancelled',
  
  // Notifications
  RANK_UPDATED: 'rank:updated',
  LEVEL_UP: 'level:up',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
} as const;

// ─── Game Modes ───────────────────────────────────────────────────────────────
export type GameMode = 'local' | 'ai_easy' | 'ai_medium' | 'ai_hard' | 'casual' | 'ranked' | 'custom';

// ─── Player Sides ─────────────────────────────────────────────────────────────
export type PlayerSide = 'player1' | 'player2';

// ─── Room Status ──────────────────────────────────────────────────────────────
export type RoomStatus = 'waiting' | 'ready' | 'in_progress' | 'completed' | 'abandoned' | 'expired';

// ─── Match Status ─────────────────────────────────────────────────────────────
export type MatchStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

// ─── Pen State ────────────────────────────────────────────────────────────────
export interface PenState {
  id: PlayerSide;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  mass: number;
  isOut: boolean;
}

// ─── Game State ───────────────────────────────────────────────────────────────
export interface GameState {
  matchId: string;
  mode: GameMode;
  currentTurn: PlayerSide;
  turnNumber: number;
  pen1: PenState;
  pen2: PenState;
  status: MatchStatus;
  winner?: PlayerSide;
  startedAt?: string;
}

// ─── Shot Parameters ─────────────────────────────────────────────────────────
export interface ShotParams {
  angle: number;   // radians
  power: number;   // 0–100
}

// ─── Quick Chat Messages ──────────────────────────────────────────────────────
export const QUICK_CHAT_MESSAGES = [
  'Nice shot!',
  'Good game!',
  'Well played!',
  'Your turn!',
  'So close!',
  "Let's rematch!",
  'Good luck!',
  'GG!',
] as const;

export type QuickChatMessage = typeof QUICK_CHAT_MESSAGES[number];

// ─── Reactions ────────────────────────────────────────────────────────────────
export const REACTIONS = ['👍', '😂', '😮', '🔥', '👏', '😎', 'GG', '🤯', '💀', '🎯', '❤️', '😈'] as const;
export type Reaction = typeof REACTIONS[number];

// ─── Rank Tiers ───────────────────────────────────────────────────────────────
export const RANK_TIERS = {
  BRONZE: { name: 'Bronze', minRating: 0, maxRating: 1199, color: '#cd7f32' },
  SILVER: { name: 'Silver', minRating: 1200, maxRating: 1399, color: '#c0c0c0' },
  GOLD: { name: 'Gold', minRating: 1400, maxRating: 1599, color: '#ffd700' },
  PLATINUM: { name: 'Platinum', minRating: 1600, maxRating: 1799, color: '#00d4ff' },
  DIAMOND: { name: 'Diamond', minRating: 1800, maxRating: 1999, color: '#b9f2ff' },
  MASTER: { name: 'Master', minRating: 2000, maxRating: 2199, color: '#a855f7' },
  GRANDMASTER: { name: 'Grandmaster', minRating: 2200, maxRating: Infinity, color: '#f97316' },
} as const;

export type RankTier = keyof typeof RANK_TIERS;

export function getRankFromRating(rating: number): RankTier {
  if (rating >= 2200) return 'GRANDMASTER';
  if (rating >= 2000) return 'MASTER';
  if (rating >= 1800) return 'DIAMOND';
  if (rating >= 1600) return 'PLATINUM';
  if (rating >= 1400) return 'GOLD';
  if (rating >= 1200) return 'SILVER';
  return 'BRONZE';
}

// ─── XP System ───────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  COMPLETE_MATCH: 50,
  WIN_MATCH: 100,
  WIN_ONLINE: 150,
  WIN_VS_AI_EASY: 30,
  WIN_VS_AI_MEDIUM: 60,
  WIN_VS_AI_HARD: 90,
  DAILY_LOGIN: 25,
} as const;

export function getXpForLevel(level: number): number {
  // XP needed to reach each level: grows gradually
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (accumulated + getXpForLevel(level) <= totalXp) {
    accumulated += getXpForLevel(level);
    level++;
  }
  return level;
}

export * from './physics';
export * from './ai';
