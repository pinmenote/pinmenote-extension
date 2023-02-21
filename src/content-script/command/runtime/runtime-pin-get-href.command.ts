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
import { ICommand } from '../../../common/model/shared/common.dto';
import { PinAddXpathCommand } from '../pin/pin-add-xpath.command';
import { PinGetHrefCommand } from '../../../common/command/pin/pin-get-href.command';
import { PinNavigateCommand } from '../pin/pin-navigate.command';
import { PinStore } from '../../store/pin.store';
import { UrlFactory } from '../../../common/factory/url.factory';

export class RuntimePinGetHrefCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const data = await new PinGetHrefCommand(UrlFactory.newUrl(), true).execute();
    PinStore.clear();
    for (const pin of data) {
      new PinAddXpathCommand(pin).execute();
    }
    // Navigate possible if url was different
    await new PinNavigateCommand().execute();
  }
}
