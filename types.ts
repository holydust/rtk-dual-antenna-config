
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AntennaConfig {
  master: Vector3D;
  slave: Vector3D;
}

export interface ArduParams {
  GPS1_MB_TYPE: number;
  GPS1_MB_OFS_X: number;
  GPS1_MB_OFS_Y: number;
  GPS1_MB_OFS_Z: number;
  GPS1_POS_X: number;
  GPS1_POS_Y: number;
  GPS2_POS_Z: number;
}
