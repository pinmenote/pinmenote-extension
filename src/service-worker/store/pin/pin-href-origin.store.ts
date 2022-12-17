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
import { BrowserStorageWrapper } from '@common/service/browser.storage.wrapper';
import PinUrl = Pinmenote.Pin.PinUrl;

export class PinHrefOriginStore {
  private static PIN_HREF = 'pin:href';
  private static PIN_ORIGIN = 'pin:origin';
  private static PIN_URL_LIST = 'pin:url:list';

  static async addHrefOriginId(url: PinUrl, id: number): Promise<void> {
    // Update hrefs
    const hrefIds = await this.hrefIds(url.href);
    hrefIds.push(id);
    await BrowserStorageWrapper.set(`${this.PIN_HREF}:${url.href}`, hrefIds);
    // Update origin
    const originIds = await this.originIds(url.origin);
    originIds.push(id);
    await BrowserStorageWrapper.set(`${this.PIN_ORIGIN}:${url.origin}`, originIds);
    await this.addOriginUrl(url);
  }

  static async delHrefOriginId(url: PinUrl, id: number): Promise<void> {
    // Update hrefs
    const hrefIds = await this.hrefIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorageWrapper.remove(`${this.PIN_HREF}:${url.href}`);
    } else {
      await BrowserStorageWrapper.set(`${this.PIN_HREF}:${url.href}`, newHref);
    }
    // Update origin
    const originIds = await this.originIds(url.origin);
    const newOrigin = originIds.filter((i) => i !== id);
    if (newOrigin.length === 0) {
      await BrowserStorageWrapper.remove(`${this.PIN_ORIGIN}:${url.origin}`);
    } else {
      await BrowserStorageWrapper.set(`${this.PIN_ORIGIN}:${url.origin}`, newOrigin);
    }
  }

  static async hrefIds(url: string): Promise<number[]> {
    const key = `${this.PIN_HREF}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }

  static async originIds(url: string): Promise<number[]> {
    const key = `${this.PIN_ORIGIN}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }

  static async getOriginUrls(): Promise<string[]> {
    const value = await BrowserStorageWrapper.get<string[] | undefined>(this.PIN_URL_LIST);
    return value || [];
  }

  private static async addOriginUrl(url: PinUrl): Promise<void> {
    const urls = await this.getOriginUrls();
    if (urls.indexOf(url.origin) === -1) {
      urls.push(url.origin);
    }
    await BrowserStorageWrapper.set(this.PIN_URL_LIST, urls);
  }
}
