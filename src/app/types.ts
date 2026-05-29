export type AccessResult = 'granted' | 'denied';
export type AccessMethod = 'badge' | 'pin' | 'mobile' | 'manual';

export interface AccessEvent {
  id: string;
  date: Date;
  title: string;
  user: string;
  location: string;
  result: AccessResult;
  method: AccessMethod;
}

/** Physical zones. Also used to build the grid's Location select-filter options. */
export const LOCATIONS = [
  'Main Entrance',
  'Server Room',
  'Parking Garage',
  'R&D Lab',
  'Finance Office',
  'Loading Dock',
] as const;

/** All methods (badge/pin/mobile are auto-logged; manual = hand-entered via the form). */
export const METHODS: AccessMethod[] = ['badge', 'pin', 'mobile', 'manual'];
