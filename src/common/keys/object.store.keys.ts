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
export class ObjectStoreKeys {
  // ID
  static readonly CONTENT_ID = 'o:c:id';

  static readonly PIN_ID = 'o:p:id';
  static readonly PIN_COMMENT = 'o:p:c';

  static readonly OBJECT_ID = 'o:id';
  static readonly OBJECT_LIST_ID = 'o:list:id';
  static readonly OBJECT_LIST = 'o:list';

  // DATE INDEX
  static readonly CREATED_DT = 'o:dt:c';
  static readonly UPDATED_DT = 'o:dt:u';
  static readonly REMOVED_DT = 'o:dt:r';

  // INDEX
  static readonly SEARCH_INDEX = 's:i';
  static readonly SEARCH_WORD = 's:w';
  static readonly SEARCH_START = 's:s';

  static readonly ACCESS_TOKEN = 'accessToken';

  // SYNC
  static readonly SYNC_INTERVAL = 'sync:interval';
  static readonly SYNC_PROGRESS = 'sync:progress';

  // SETTINGS
  static readonly CONTENT_SETTINGS_KEY = 'content-settings';
}
