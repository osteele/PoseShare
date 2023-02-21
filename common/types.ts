/** Types that are shared between the client and the server. */

/** The client and server Performer types are derived from this. */
export type PerformerBase = {
  id: string;
  name: string;
  connected: boolean;
  hue: number;
  position?: number;
};

export type Room = {
  name: string;
  size: number;
};
