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
import { HtmlComponent } from '../../common/model/html.model';
import { PinObject } from '../../common/model/pin.model';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class PinStore {
  private static pinData: HtmlComponent[] = [];

  public static getByUid(uid: string): HtmlComponent | undefined {
    const index = this.pinData.findIndex((p) => p.object.uid === uid);
    if (index > -1) {
      return this.pinData[index];
    }
    return undefined;
  }

  public static add(data: HtmlComponent): HtmlComponent {
    if (this.pinData.findIndex((c) => c.object.uid === data.object.uid) === -1) {
      this.pinData.push(data);
    }
    return data;
  }

  public static delByUid(uid: string): HtmlComponent | undefined {
    fnConsoleLog('PinStore->delByUid', uid);
    const index = this.pinData.findIndex((c) => c.object.uid === uid);
    if (index > -1) {
      const data = this.pinData.splice(index, 1)[0];
      // Cleanup component
      data.cleanup();
      return data;
    }
    return undefined;
  }

  public static clear(): void {
    for (const pinData of this.pinData) {
      pinData.cleanup();
    }
    this.pinData = [];
  }

  public static each(fn: (value: HtmlComponent, index: number, array: HtmlComponent[]) => void): void {
    this.pinData.forEach(fn);
  }

  public static focusPin(pin: PinObject): void {
    const obj = this.getByUid(pin.uid);
    if (!obj) return;
    obj.focus(true);
  }
}
