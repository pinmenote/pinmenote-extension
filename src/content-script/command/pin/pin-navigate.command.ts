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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj.model';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ObjPagePinDto } from '../../../common/model/obj-pin.model';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinStore } from '../../store/pin.store';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { fnNormalizeHref } from '../../../common/fn/normalize.url.fn';
import { resolveVideoTimeFn } from '../../fn/resolve-video-time.fn';
import ICommand = Pinmenote.Common.ICommand;

export class PinNavigateCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const url = fnNormalizeHref(window.location.href);

    const obj = await BrowserStorageWrapper.get<ObjDto<ObjPagePinDto> | undefined>(ObjectStoreKeys.PIN_NAVIGATE);
    if (!obj) return;
    if (obj.type == ObjTypeDto.PageElementPin) {
      if (obj.data.url.href === url) {
        await BrowserStorageWrapper.remove(ObjectStoreKeys.PIN_NAVIGATE);
        PinStore.focusPin(obj);
        resolveVideoTimeFn(obj.data.video);
      } else {
        window.location.href = obj.data.url.href;
      }
    } else {
      fnConsoleLog('Navigation not supported', obj);
    }
  }
}
