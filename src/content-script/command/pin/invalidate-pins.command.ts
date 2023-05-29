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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusMessageType } from '../../../common/model/bus.model';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjPinDto } from '../../../common/model/obj/obj-pin.dto';
import { PinAddXpathCommand } from './pin-add-xpath.command';
import { PinPendingStore } from '../../store/pin-pending.store';
import { PinStore } from '../../store/pin.store';
import { RuntimePinGetHrefCommand } from '../runtime/runtime-pin-get-href.command';
import { UrlFactory } from '../../../common/factory/url.factory';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class InvalidatePinsCommand implements ICommand<Promise<void>> {
  constructor(private href: string) {}
  async execute(): Promise<void> {
    // TODO invalidate if pin element exists and show hide pins based on it
    // Sometimes location is changed  without popstate event ex. click on youtube video
    const href = UrlFactory.normalizeHref(window.location.href);
    if (this.href !== href) {
      fnConsoleLog('PinManager->invalidatePins->CLEAR href changed');
      PinStore.clear();
      await new RuntimePinGetHrefCommand().execute();
      return;
    }
    const iframePins = this.invalidatePending();
    await this.propagateIframePins(iframePins);
    this.invalidateVisible();
  }

  private invalidatePending = (): ObjDto<ObjPinDto>[] => {
    // Check for pending pins that should be on page but are not displayed
    // might be deferred rendering and stuff like that
    const pinList = PinPendingStore.values;
    const iframePins = [];
    for (const pin of pinList) {
      switch (pin.type) {
        case ObjTypeDto.PageElementPin:
          if (pin.data.data.iframe) {
            iframePins.push(pin);
          } else if (new PinAddXpathCommand(pin).execute()) {
            PinPendingStore.remove(pin.id);
          }
          break;
      }
    }
    return iframePins;
  };

  private propagateIframePins = async (pins: ObjDto<ObjPinDto>[]) => {
    if (pins.length === 0) return;
    fnConsoleLog('InvalidatePinsCommand->propagateIframePins', pins);
    for (let i = 0; i < pins.length; i++) {
      await BrowserApi.sendRuntimeMessage({ type: BusMessageType.IFRAME_PIN_SEND, data: pins[i] });
    }
  };

  private invalidateVisible = () => {
    // Ok so check if we displayed on some elements that are not visible
    PinStore.each((pinData) => {
      if (pinData.isHidden()) {
        const data = PinStore.delByUid(pinData.model.id);
        if (data) PinPendingStore.add(data.model.object);
      }
      pinData.resize();
    });
  };
}
