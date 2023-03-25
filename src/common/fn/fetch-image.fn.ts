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
import { BrowserApi } from '../service/browser.api.wrapper';
import { BusMessageType } from '../model/bus.model';
import { FetchImageRequest } from '../model/obj-request.model';
import { FetchResponse } from '../model/api.model';
import { TinyEventDispatcher } from '../service/tiny.event.dispatcher';

export const fnFetchImage = (url: string): Promise<FetchResponse<string>> => {
  return new Promise<FetchResponse<string>>((resolve, reject) => {
    TinyEventDispatcher.addListener<FetchResponse<string>>(BusMessageType.CONTENT_FETCH_IMAGE, (event, key, value) => {
      if (value.url === url) {
        TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IMAGE, key);
        resolve(value);
      }
    });
    BrowserApi.sendRuntimeMessage<FetchImageRequest>({
      type: BusMessageType.CONTENT_FETCH_IMAGE,
      data: { url }
    })
      .then(() => {
        /* SKIP */
      })
      .catch((e) => {
        reject(e);
      });
  });
};
