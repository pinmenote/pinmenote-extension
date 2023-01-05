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
import { PinAddCommand } from '../../../common/command/pin/pin-add.command';
import { PinObject } from '../../../common/model/pin.model';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class ContentPinAddCommand implements ICommand<void> {
  constructor(private pin: PinObject) {}
  async execute(): Promise<void> {
    try {
      await new PinAddCommand(this.pin).execute();
    } catch (e) {
      fnConsoleLog('Error', this.pin, e);
    }
  }
}
