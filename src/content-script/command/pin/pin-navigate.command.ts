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
import { BrowserStorageWrapper } from '../../../common/service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../../common/keys/object.store.keys';
import { PinObject } from '../../../common/model/pin.model';
import { PinStore } from '../../store/pin.store';
import { fnNormalizeHref } from '../../../common/fn/normalize.url.fn';
import { resolveVideoTime } from '../../fn/resolve-video-time';
import ICommand = Pinmenote.Common.ICommand;

export class PinNavigateCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const url = fnNormalizeHref(window.location.href);
    const data = await BrowserStorageWrapper.get<PinObject>(ObjectStoreKeys.PIN_NAVIGATE);
    if (data.url.href === url) {
      PinStore.focusPin(data);
      resolveVideoTime(data.content.videoTime);
      await BrowserStorageWrapper.remove(ObjectStoreKeys.PIN_NAVIGATE);
    } else {
      window.location.href = data.url.href;
    }
  }
}
