/** Types that are shared between the client and the server. */

/** The client and server Performer types are derived from this. */
export type Performer = {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  row: number | null;
  col: number | null;
  appearance: string;
};

export type Room = {
  name: string;
  rows: number;
  cols: number;
};

export type UserDetails = {
  id: string;
  name: string;
  roomName?: string;
  appearance: string;
};
