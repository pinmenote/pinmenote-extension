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
import { ContentSettingsData } from '@common/model/settings.model';

export class BorderStore {
  private static borderStyleValue = '2px solid #90caf9'; // TODO make it customizable
  private static borderRadiusValue = '5px'; // TODO make it customizable

  static get borderStyle(): string {
    return this.borderStyleValue;
  }

  static get borderRadius(): string {
    return this.borderRadiusValue;
  }

  static setBorderSettings(data: ContentSettingsData) {
    this.borderRadiusValue = data.borderRadius;
    this.borderStyleValue = data.borderStyle;
  }
}
