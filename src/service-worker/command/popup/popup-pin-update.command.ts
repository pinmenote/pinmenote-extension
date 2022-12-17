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
import { PinObject, PinUpdateObject } from '@common/model/pin.model';
import { BusMessageType } from '@common/model/bus.model';
import { PinUpdateCommand } from '../pin/pin-update.command';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;

export class PopupPinUpdateCommand implements ICommand<void> {
  constructor(private data: PinUpdateObject) {}

  async execute(): Promise<void> {
    try {
      await new PinUpdateCommand(this.data).execute();
      await sendTabMessage<PinObject>({ type: BusMessageType.CONTENT_PIN_UPDATE, data: this.data.pin });
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }
}
