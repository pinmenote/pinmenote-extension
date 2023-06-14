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
import { FetchResponse } from '@pinmenote/fetch-service';
import { TinyEventDispatcher } from '../service/tiny.event.dispatcher';
import { fnConsoleLog } from './fn-console';

const emptyResponse: Omit<FetchResponse<string>, 'url'> = {
  ok: false,
  status: 500,
  data: '',
  type: 'BLOB'
};

export const fnFetchImage = (url: string, skipSize = 0): Promise<FetchResponse<string>> => {
  return new Promise<FetchResponse<string>>((resolve) => {
    if (!url) {
      fnConsoleLog('fnFetchImage->EMPTY_URL !!!');
      resolve({ url, ...emptyResponse });
      return;
    }
    const fetchKey = TinyEventDispatcher.addListener<FetchResponse<string>>(
      BusMessageType.CONTENT_FETCH_IMAGE,
      (event, key, value) => {
        // fnConsoleLog('fnFetchImage->CONTENT_FETCH_IMAGE', value.url, url, value.url === url);
        if (value.url === url) {
          TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IMAGE, key);
          const size = Math.floor(value.data.length / 10000) / 100;
          if (skipSize > 0 && size > skipSize) {
            fnConsoleLog(`Skipping image url (${url}) of size ${size}MB exceeding skip size ${skipSize}MB`);
            resolve({ url, ...emptyResponse });
          } else {
            fnConsoleLog('fnFetchImage->resolve', value.url);
            resolve(value);
          }
        }
      }
    );
    BrowserApi.sendRuntimeMessage<FetchImageRequest>({
      type: BusMessageType.CONTENT_FETCH_IMAGE,
      data: { url }
    })
      .then(() => {
        /* SKIP */
      })
      .catch((e) => {
        TinyEventDispatcher.removeListener(BusMessageType.CONTENT_FETCH_IMAGE, fetchKey);
        fnConsoleLog('fnFetchImage->Error', e);
        resolve({ url, ...emptyResponse });
      });
  });
};
