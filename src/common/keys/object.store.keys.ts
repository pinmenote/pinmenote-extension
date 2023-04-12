/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2022 Michal Szczepanski.
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
export class ObjectStoreKeys {
  // PIN STATE
  static readonly PIN_NAVIGATE = 'pin:navigate';

  // ID
  static readonly OBJECT_ID = 'o:id';
  static readonly CONTENT_ID = 'o:c:id';
  static readonly OBJECT_LIST_ID = 'o:list:id';
  static readonly OBJECT_LIST = 'o:list';

  // DATE INDEX
  static readonly CREATED_DT = 'o:dt:c';
  static readonly UPDATED_DT = 'o:dt:u';
  static readonly REMOVED_DT = 'o:dt:r';

  // LINK
  static readonly OBJECT_LINK = 'o:link';

  static readonly ACCESS_TOKEN = 'accessToken';

  // SYNC
  static readonly SYNC_TIME = 'sync';
}
