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
import { ObjDto } from '../../common/model/obj/obj.dto';
import { ObjPagePinDto } from '../../common/model/obj/obj-pin.dto';
import { PageComponent } from '../../common/model/html.model';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class PinStore {
  private static pinData: PageComponent[] = [];

  public static getByUid(id: number): PageComponent | undefined {
    const index = this.pinData.findIndex((p) => p.object.id === id);
    if (index > -1) {
      return this.pinData[index];
    }
    return undefined;
  }

  public static add(data: PageComponent): PageComponent {
    if (this.pinData.findIndex((c) => c.object.id === data.object.id) === -1) {
      this.pinData.push(data);
    }
    return data;
  }

  public static delByUid(id: number): PageComponent | undefined {
    fnConsoleLog('PinStore->delByUid', id);
    const index = this.pinData.findIndex((c) => c.object.id === id);
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

  public static each(fn: (value: PageComponent, index: number, array: PageComponent[]) => void): void {
    this.pinData.forEach(fn);
  }

  public static focusPin(obj: ObjDto<ObjPagePinDto>): void {
    const comp = this.getByUid(obj.id);
    fnConsoleLog('PinStore->focusPin', comp);
    if (!comp) return;
    comp.focus(true);
  }
}
