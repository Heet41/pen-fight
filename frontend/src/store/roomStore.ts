import { create } from 'zustand';
import { api } from '@/utils/api';
import { getSocket } from '@/utils/socket';
import { PlayerSide, PenState } from '@shared/index';

export interface RoomData {
  id: string;
  roomCode: string;
  roomName?: string;
  isPrivate: boolean;
  status: string;
  host?: { id: string; username: string; avatar?: string };
  guest?: { id: string; username: string; avatar?: string };
  hostUserId?: string;
  guestUserId?: string;
}

interface RoomState {
  currentRoom: RoomData | null;
  publicRooms: RoomData[];
  mySide: PlayerSide;
  isHostReady: boolean;
  isGuestReady: boolean;
  gameStarted: boolean;
  gameState: {
    currentTurn: PlayerSide;
    turnNumber: number;
    pen1: PenState;
    pen2: PenState;
    winner?: PlayerSide;
  } | null;
  reactions: Array<{ id: number; emoji: string; senderName: string }>;
  quickChats: Array<{ id: number; message: string; senderName: string }>;
  isLoading: boolean;
  error: string | null;

  createRoom: (roomName?: string, isPrivate?: boolean) => Promise<string>;
  joinRoom: (roomCode: string) => Promise<void>;
  fetchPublicRooms: () => Promise<void>;
  toggleReady: (isReady: boolean) => void;
  sendShot: (angle: number, power: number) => void;
  sendReaction: (emoji: string, senderName: string) => void;
  sendQuickChat: (message: string, senderName: string) => void;
  requestRematch: () => void;
  acceptRematch: () => void;
  leaveRoom: () => void;
  initSocketListeners: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoom: null,
  publicRooms: [],
  mySide: 'player1',
  isHostReady: false,
  isGuestReady: false,
  gameStarted: false,
  gameState: null,
  reactions: [],
  quickChats: [],
  isLoading: false,
  error: null,

  createRoom: async (roomName, isPrivate = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/rooms', { roomName, isPrivate });
      const room = res.data.data.room;
      set({ currentRoom: room, mySide: 'player1', isLoading: false });

      const socket = getSocket();
      socket.emit('room:create', {
        roomCode: room.roomCode,
        hostUserId: room.hostUserId,
      });

      return room.roomCode;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create room', isLoading: false });
      throw err;
    }
  },

  joinRoom: async (roomCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/rooms/join', { roomCode });
      const room = res.data.data.room;
      set({ currentRoom: room, mySide: 'player2', isLoading: false });

      const socket = getSocket();
      socket.emit('room:join', {
        roomCode: room.roomCode,
        guestUserId: room.guestUserId,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to join room', isLoading: false });
      throw err;
    }
  },

  fetchPublicRooms: async () => {
    try {
      const res = await api.get('/rooms/public');
      set({ publicRooms: res.data.data.rooms });
    } catch {
      // ignore
    }
  },

  toggleReady: (isReady: boolean) => {
    const { currentRoom, mySide } = get();
    if (!currentRoom) return;

    const socket = getSocket();
    socket.emit('room:ready', {
      roomCode: currentRoom.roomCode,
      side: mySide,
      isReady,
    });
  },

  sendShot: (angle: number, power: number) => {
    const { currentRoom, mySide } = get();
    if (!currentRoom) return;

    const socket = getSocket();
    socket.emit('game:shot', {
      roomCode: currentRoom.roomCode,
      side: mySide,
      angle,
      power,
    });
  },

  sendReaction: (emoji: string, senderName: string) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const socket = getSocket();
    socket.emit('reaction:send', {
      roomCode: currentRoom.roomCode,
      emoji,
      senderName,
    });
  },

  sendQuickChat: (message: string, senderName: string) => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    const socket = getSocket();
    socket.emit('quickchat:send', {
      roomCode: currentRoom.roomCode,
      message,
      senderName,
    });
  },

  requestRematch: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('rematch:request', { roomCode: currentRoom.roomCode });
  },

  acceptRematch: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('rematch:accept', { roomCode: currentRoom.roomCode });
  },

  leaveRoom: () => {
    const { currentRoom } = get();
    if (currentRoom) {
      const socket = getSocket();
      socket.emit('room:leave', { roomCode: currentRoom.roomCode });
    }
    set({
      currentRoom: null,
      gameStarted: false,
      gameState: null,
      isHostReady: false,
      isGuestReady: false,
      reactions: [],
      quickChats: [],
    });
  },

  initSocketListeners: () => {
    const socket = getSocket();

    socket.off('room:updated');
    socket.off('game:start');
    socket.off('game:state');
    socket.off('reaction:receive');
    socket.off('quickchat:receive');

    socket.on('room:updated', (data: any) => {
      set({
        isHostReady: data.hostReady ?? false,
        isGuestReady: data.guestReady ?? false,
      });
    });

    socket.on('game:start', (data: any) => {
      set({
        gameStarted: true,
        gameState: data.gameState,
      });
    });

    socket.on('game:state', (data: any) => {
      set({ gameState: data.gameState });
    });

    socket.on('reaction:receive', (data: any) => {
      set((state) => ({
        reactions: [
          ...state.reactions,
          { id: Date.now() + Math.random(), emoji: data.emoji, senderName: data.senderName },
        ].slice(-6),
      }));
    });

    socket.on('quickchat:receive', (data: any) => {
      set((state) => ({
        quickChats: [
          ...state.quickChats,
          { id: Date.now() + Math.random(), message: data.message, senderName: data.senderName },
        ].slice(-6),
      }));
    });
  },
}));
