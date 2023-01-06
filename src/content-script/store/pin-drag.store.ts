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
import { ObjectTypeDto } from '../../common/model/html.model';
import { PinComponent } from '../components/pin.component';
import { PinObject } from '../../common/model/pin.model';
import { PinStore } from './pin.store';
import { PinUpdateCommand } from '../../common/command/pin/pin-update.command';
import PinPoint = Pinmenote.Pin.PinPoint;

export class PinDragStore {
  private static dragValue?: PinComponent;

  public static startDragPin(pin: PinObject): void {
    if (pin.type !== ObjectTypeDto.Pin) return;
    this.dragValue = PinStore.getByUid(pin.uid) as PinComponent;
    this.dragValue?.startDrag();
  }

  public static dragPin(value: PinPoint): void {
    if (!this.dragValue) return;
    this.dragValue.updateDrag(value);
  }

  public static async stopDragPin(value: PinPoint): Promise<void> {
    if (!this.dragValue) return;
    this.dragValue.stopDrag(value);

    await new PinUpdateCommand({ pin: this.dragValue.object }).execute();
    if (this.dragValue) {
      this.dragValue = undefined;
    }
  }

  public static get isDrag(): boolean {
    return !!this.dragValue;
  }
}
