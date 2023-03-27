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
import { ObjDto, ObjTypeDto } from '../../../common/model/obj/obj.dto';
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjPagePinDto } from '../../../common/model/obj/obj-pin.dto';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinStore } from '../../store/pin.store';
import { UrlFactory } from '../../../common/factory/url.factory';
import { fnConsoleLog } from '../../../common/fn/console.fn';
import { resolveVideoTimeFn } from '../../fn/resolve-video-time.fn';

export class PinNavigateCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const url = UrlFactory.normalizeHref(window.location.href);

    const obj = await BrowserStorageWrapper.get<ObjDto<ObjPagePinDto> | undefined>(ObjectStoreKeys.PIN_NAVIGATE);
    if (!obj) return;
    if (obj.type == ObjTypeDto.PageElementPin) {
      if (obj.data.snapshot.url.href === url) {
        await BrowserStorageWrapper.remove(ObjectStoreKeys.PIN_NAVIGATE);
        PinStore.focusPin(obj);
        resolveVideoTimeFn(obj.data.video);
      } else {
        window.location.href = obj.data.snapshot.url.href;
      }
    } else {
      fnConsoleLog('Navigation not supported', obj);
    }
  }
}
