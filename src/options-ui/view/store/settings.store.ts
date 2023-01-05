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
import { BusMessageType } from '../../../common/model/bus.model';
import { ContentSettingsData } from '../../../common/model/settings.model';
import { sendRuntimeMessage } from '../../../common/message/runtime.message';

export class SettingsStore {
  static settings?: ContentSettingsData;

  static async getSettings(): Promise<void> {
    await sendRuntimeMessage({ type: BusMessageType.OPTIONS_GET_SETTINGS });
  }
}
