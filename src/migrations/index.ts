import * as migration_20260914_115006_initial from './20260914_115006_initial';
import * as migration_20261010_042632_users_reset_password_requested_at from './20261010_042632_users_reset_password_requested_at';

export const migrations = [
  {
    up: migration_20260914_115006_initial.up,
    down: migration_20260914_115006_initial.down,
    name: '20260914_115006_initial',
  },
  {
    up: migration_20261010_042632_users_reset_password_requested_at.up,
    down: migration_20261010_042632_users_reset_password_requested_at.down,
    name: '20261010_042632_users_reset_password_requested_at'
  },
];
