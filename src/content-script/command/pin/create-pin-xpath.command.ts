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
import { CreatePinDataCommand } from './create-pin-data.command';
import { PinObject } from '../../../common/model/pin.model';
import { PinPendingStore } from '../../store/pin-pending.store';
import { XpathFactory } from '../../../common/factory/xpath.factory';
import { isElementHidden } from '../../fn/is-element-hidden';
import ICommand = Pinmenote.Common.ICommand;

export class CreatePinXpathCommand implements ICommand<Promise<boolean>> {
  constructor(private pin: PinObject) {}
  async execute(): Promise<boolean> {
    const value = XpathFactory.newXPathResult(this.pin.locator.xpath);
    const node = value.singleNodeValue as HTMLElement;
    if (!this.pin.visible || !node || isElementHidden(node)) {
      // will be created on invalidate
      PinPendingStore.add(this.pin);
      return false;
    }
    const pinData = await new CreatePinDataCommand(node, this.pin).execute();
    // CHECK IF CREATED
    if (pinData) return true;
    PinPendingStore.add(this.pin);
    return false;
  }
}
