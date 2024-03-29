/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
export interface SyncProgress {
  timestamp: number;
  id: number;
  serverId: number;
  sub: string;
  mode: SyncMode;
}

export enum SyncMode {
  OUTGOING_INCOMING = 1,
  INCOMING,
  MANUAL,
  OFF,
  RESET = 5
}

export enum SyncObjectStatus {
  TX_LOCKED = -4,
  SERVER_ERROR,
  INDEX_NOT_EXISTS,
  OBJECT_NOT_EXISTS,
  OK,
  EMPTY_LIST,
  LAST_ELEMENT
}
