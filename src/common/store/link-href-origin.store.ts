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
import { BrowserStorageWrapper } from '../service/browser.storage.wrapper';
import { ObjUrlDto } from '../model/obj/obj.dto';
import { fnConsoleLog } from '../fn/console.fn';

export class LinkHrefOriginStore {
  private static NOTE_HREF = 'note:href';
  private static PIN_HREF = 'pin:href';
  private static OBJ_HREF = 'obj:href';
  private static OBJ_ORIGIN = 'obj:origin';

  static async addHrefOriginId(url: ObjUrlDto, id: number): Promise<void> {
    // Update hrefs
    fnConsoleLog('LinkHrefOriginStore->addHrefOriginId', url.href);
    const hrefIds = await this.hrefIds(url.href);
    hrefIds.push(id);
    await BrowserStorageWrapper.set(`${this.OBJ_HREF}:${url.href}`, hrefIds);

    // Update origin
    const originIds = await this.originIds(url.origin);
    originIds.push(id);
    await BrowserStorageWrapper.set(`${this.OBJ_ORIGIN}:${url.origin}`, originIds);
  }

  static async delHrefOriginId(url: ObjUrlDto, id: number): Promise<void> {
    // Update hrefs
    fnConsoleLog('LinkHrefOriginStore->delHrefOriginId', url.href);
    const hrefIds = await this.hrefIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorageWrapper.remove(`${this.OBJ_HREF}:${url.href}`);
    } else {
      await BrowserStorageWrapper.set(`${this.OBJ_HREF}:${url.href}`, newHref);
    }
    // Update origin
    const originIds = await this.originIds(url.origin);
    const newOrigin = originIds.filter((i) => i !== id);
    if (newOrigin.length === 0) {
      await BrowserStorageWrapper.remove(`${this.OBJ_ORIGIN}:${url.origin}`);
    } else {
      await BrowserStorageWrapper.set(`${this.OBJ_ORIGIN}:${url.origin}`, newOrigin);
    }
  }

  static async hrefIds(url: string): Promise<number[]> {
    fnConsoleLog('LinkHrefOriginStore->hrefIds', url);
    const key = `${this.OBJ_HREF}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }

  static async originIds(url: string): Promise<number[]> {
    fnConsoleLog('LinkHrefOriginStore->originIds', url);
    const key = `${this.OBJ_ORIGIN}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }

  static async pinAdd(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.pinIds(url.href);
    hrefIds.push(id);
    await BrowserStorageWrapper.set(`${this.PIN_HREF}:${url.href}`, hrefIds);
  }

  static async pinDel(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.pinIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorageWrapper.remove(`${this.PIN_HREF}:${url.href}`);
    } else {
      await BrowserStorageWrapper.set(`${this.PIN_HREF}:${url.href}`, newHref);
    }
  }

  static async pinIds(url: string): Promise<number[]> {
    const key = `${this.PIN_HREF}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }

  static async noteAdd(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.noteIds(url.href);
    hrefIds.push(id);
    await BrowserStorageWrapper.set(`${this.NOTE_HREF}:${url.href}`, hrefIds);
  }

  static async noteDel(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.noteIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorageWrapper.remove(`${this.NOTE_HREF}:${url.href}`);
    } else {
      await BrowserStorageWrapper.set(`${this.NOTE_HREF}:${url.href}`, newHref);
    }
  }

  static async noteIds(url: string): Promise<number[]> {
    const key = `${this.NOTE_HREF}:${url}`;
    const value = await BrowserStorageWrapper.get<number[] | undefined>(key);
    return value || [];
  }
}
