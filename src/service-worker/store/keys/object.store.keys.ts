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
  static readonly PIN_CHANGE = 'pin:change';

  // ID
  static readonly OBJECT_ID = 'o:id';

  // LINK
  static readonly OBJECT_LINK = 'o:link';

  static readonly OBJECT_ID_LIST = 'pin:id:list';
  static readonly OBJECT_LAST_ID = 'pin:last:id';
}
