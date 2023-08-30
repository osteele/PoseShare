import * as Messages from "@common/messages";

/** The server-side representation of a performer */
export type Performer = Messages.Performer & {
  room: Room;
  timestamp: Date;
};

/** The server-side representation of a room. */
export type Room = Messages.Room & {
  name: string;
  performers: Messages.Performer[];
};

export interface ClientToServerEvent {
  broadcast: {
    emit: (name: string, data: {}) => void;
    volatile: {
      emit(name: string, person: Performer, pose: unknown): void;
    };
  };
  emit(name: string, event?: ServerToClientEvent): void;
  on(
    name: string,
    handler: (person: Messages.UserDetails, pose: unknown) => void
  ): void;
  id: string;
}

interface ServerToClientEvent {}
