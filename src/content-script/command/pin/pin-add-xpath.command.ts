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
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjDto } from '../../../common/model/obj/obj.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinComponentAddCommand } from './pin-component-add.command';
import { PinPendingStore } from '../../store/pin-pending.store';
import { XpathFactory } from '@pinmenote/page-compute';
import { fnIsElementHidden } from '../../../common/fn/fn-is-element-hidden';

export class PinAddXpathCommand implements ICommand<boolean> {
  constructor(private data: ObjDto<ObjPinDto>) {}
  execute(): boolean {
    const pin = this.data.data;
    const value = XpathFactory.newXPathResult(document, pin.data.xpath);

    const node = value.singleNodeValue as HTMLElement;

    if (!this.data.local?.visible || !node || fnIsElementHidden(node)) {
      // will be created on invalidate
      PinPendingStore.add(this.data);
      return false;
    }

    const pinData = new PinComponentAddCommand(node, this.data).execute();

    // CHECK IF CREATED
    if (pinData) return true;
    PinPendingStore.add(this.data);
    return false;
  }
}
