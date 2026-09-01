import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Support production external socket server (over WSS/HTTPS) or relative path
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      '/';

    let token: string | undefined;
    try {
      token = localStorage.getItem('penfight_token') || undefined;
    } catch {}

    socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      auth: token ? { token } : undefined,
      secure: window.location.protocol === 'https:',
    });
  }
  return socket;
}
