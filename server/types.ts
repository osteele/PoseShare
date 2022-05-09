export interface Performer {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  position?: number;
  timestamp: Date;
}

export interface ClientToServerEvent {
  broadcast: {
    emit: (name: string, data: {}) => void;
    volatile: {
      emit(name: string, person: Performer, pose: unknown): void;
    };
  };
  emit(name: string, event: ServerToClientEvent): void;
  on(name: string, handler: (person: Performer, pose: unknown) => void): void;
  id: string;
}

interface ServerToClientEvent {}
