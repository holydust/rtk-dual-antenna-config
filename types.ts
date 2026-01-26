
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AntennaConfig {
  master: Vector3D;
  slave: Vector3D;
}

export type FlightControllerMode = 'ardupilot' | 'px4';

export interface ArduParams {
  GPS1_MB_TYPE: number;
  GPS1_MB_OFS_X: number;
  GPS1_MB_OFS_Y: number;
  GPS1_MB_OFS_Z: number;
  GPS1_POS_X: number;
  GPS1_POS_Y: number;
  GPS1_POS_Z: number;
}

export interface Px4Params {
  EKF2_GPS_CTRL: number; // Bitmask usually, or specific check
  GPS_1_PROTOCOL: number | string;
  GPS_YAW_OFFSET: number;
}
