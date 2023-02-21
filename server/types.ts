import { PerformerBase, RoomBase } from "@common/types";

export type Performer = PerformerBase & {
  room: Room;
  roomName?: string;
  timestamp: Date;
};

/** The server representation of a room. */
export type Room = RoomBase & {
  name: string;
  performers: {
    id: string;
    name: string;
    position: number;
  }[];
};

export interface ClientToServerEvent {
  broadcast: {
    emit: (name: string, data: {}) => void;
    volatile: {
      emit(name: string, person: Performer, pose: unknown): void;
    };
  };
  emit(name: string, event?: ServerToClientEvent): void;
  on(name: string, handler: (person: Performer, pose: unknown) => void): void;
  id: string;
}

interface ServerToClientEvent {}
