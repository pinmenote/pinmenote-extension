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
import { BusMessageType, TimeoutMessage } from '@common/model/bus.model';
import { fnConsoleLog } from '@common/fn/console.fn';
import { sendTabMessage } from '@common/message/tab.message';
import ICommand = Pinmenote.Common.ICommand;

export class ContentTimeoutCommand implements ICommand<void> {
  constructor(private data: TimeoutMessage) {}
  async execute(): Promise<void> {
    try {
      const timeoutId = setTimeout(this.sendTimeoutMessage, this.data.ms);
      await this.sendTimeoutSetMessage(+timeoutId);
    } catch (e) {
      fnConsoleLog('Error', this.data, e);
    }
  }

  private sendTimeoutMessage = async (): Promise<void> => {
    await sendTabMessage<TimeoutMessage>({ type: BusMessageType.CONTENT_TIMEOUT, data: this.data });
  };

  private sendTimeoutSetMessage = async (data: number): Promise<void> => {
    await sendTabMessage<number>({ type: BusMessageType.CONTENT_TIMEOUT_SET, data });
  };
}
