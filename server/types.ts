import * as Base from "@common/base-types";

/** The server-side representation of a performer */
export type Performer = Base.Performer & {
  room: Room;
  timestamp: Date;
  row: number;
  col: number;
};

/** The server-side representation of a room. */
export type Room = Base.Room & {
  name: string;
  performers: {
    id: string;
    name: string;
    col: number;
    row: number;
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
  on(
    name: string,
    handler: (person: Base.UserDetails, pose: unknown) => void
  ): void;
  id: string;
}

interface ServerToClientEvent {}
