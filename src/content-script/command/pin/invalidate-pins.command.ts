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
import { CreateLinkCommand } from '../link/create-link.command';
import { ObjectTypeDto } from '../../../common/model/html.model';
import { PinAddXpathCommand } from './pin-add-xpath.command';
import { PinObject } from '../../../common/model/pin.model';
import { PinPendingStore } from '../../store/pin-pending.store';
import { PinStore } from '../../store/pin.store';
import { RuntimePinGetHrefCommand } from '../runtime/runtime-pin-get-href.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnNormalizeHref } from '../../../common/fn/normalize.url.fn';
import ICommand = Pinmenote.Common.ICommand;

export class InvalidatePinsCommand implements ICommand<Promise<void>> {
  constructor(private href: string) {}
  async execute(): Promise<void> {
    // TODO invalidate if pin element exists and show hide pins based on it
    // Sometimes location is changed  without popstate event ex. click on youtube video
    const href = fnNormalizeHref(window.location.href);
    if (this.href !== href) {
      fnConsoleLog('PinManager->invalidatePins->CLEAR href changed');
      PinStore.clear();
      await new RuntimePinGetHrefCommand().execute();
      return;
    }
    // Check for pending pins that should be on page but are not displayed
    // might be deferred rendering and stuff like that
    const pinList = PinPendingStore.values;
    for (const pin of pinList) {
      switch (pin.type) {
        case ObjectTypeDto.Pin:
          if (new PinAddXpathCommand(pin as PinObject).execute()) {
            PinPendingStore.remove(pin.uid);
          }
          break;
        case ObjectTypeDto.Link:
          if (new CreateLinkCommand(pin).execute()) {
            PinPendingStore.remove(pin.uid);
          }
          break;
      }
    }
    // Ok so check if we displayed on some elements that are not visible
    PinStore.each((pinData) => {
      if (pinData.isHidden()) {
        const data = PinStore.delByUid(pinData.object.uid);
        if (data) PinPendingStore.add(data.object);
      }
      pinData.resize();
    });
  }
}
