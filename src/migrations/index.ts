import * as migration_20260914_115006_initial from './20260914_115006_initial';

export const migrations = [
  {
    up: migration_20260914_115006_initial.up,
    down: migration_20260914_115006_initial.down,
    name: '20260914_115006_initial'
  },
];
