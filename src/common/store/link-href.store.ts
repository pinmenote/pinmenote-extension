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
import { BrowserStorage } from '@pinmenote/browser-api';
import { LinkOriginStore } from './link-origin.store';
import { ObjUrlDto } from '../model/obj/obj.dto';
import { fnConsoleLog } from '../fn/fn-console';

export class LinkHrefStore {
  private static NOTE_HREF = 'note:href';
  private static PIN_HREF = 'pin:href';
  private static OBJ_HREF = 'obj:href';

  static async add(url: ObjUrlDto, id: number): Promise<void> {
    // Update hrefs
    const hrefIds = await this.hrefIds(url.href);
    hrefIds.push(id);
    await BrowserStorage.set(`${this.OBJ_HREF}:${url.href}`, hrefIds);

    await LinkOriginStore.add(LinkOriginStore.OBJ_ORIGIN, id, url.origin);
  }

  static async del(url: ObjUrlDto, id: number): Promise<void> {
    // Update hrefs
    fnConsoleLog('LinkHrefOriginStore->delHrefOriginId', url.href);
    const hrefIds = await this.hrefIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorage.remove(`${this.OBJ_HREF}:${url.href}`);
    } else {
      await BrowserStorage.set(`${this.OBJ_HREF}:${url.href}`, newHref);
    }
    await LinkOriginStore.del(LinkOriginStore.OBJ_ORIGIN, id, url.origin);
  }

  static async hrefIds(url: string): Promise<number[]> {
    const key = `${this.OBJ_HREF}:${url}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }

  static async pinAdd(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.pinIds(url.href);
    hrefIds.push(id);
    await BrowserStorage.set(`${this.PIN_HREF}:${url.href}`, hrefIds);

    await LinkOriginStore.add(LinkOriginStore.PIN_ORIGIN, id, url.origin);
  }

  static async pinDel(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.pinIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorage.remove(`${this.PIN_HREF}:${url.href}`);
    } else {
      await BrowserStorage.set(`${this.PIN_HREF}:${url.href}`, newHref);
    }

    await LinkOriginStore.del(LinkOriginStore.PIN_ORIGIN, id, url.origin);
  }

  static async pinIds(url: string): Promise<number[]> {
    const key = `${this.PIN_HREF}:${url}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }

  static async noteAdd(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.noteIds(url.href);
    hrefIds.push(id);
    await BrowserStorage.set(`${this.NOTE_HREF}:${url.href}`, hrefIds);

    await LinkOriginStore.add(LinkOriginStore.NOTE_ORIGIN, id, url.origin);
  }

  static async noteDel(url: ObjUrlDto, id: number): Promise<void> {
    const hrefIds = await this.noteIds(url.href);
    const newHref = hrefIds.filter((i) => i !== id);
    if (newHref.length === 0) {
      await BrowserStorage.remove(`${this.NOTE_HREF}:${url.href}`);
    } else {
      await BrowserStorage.set(`${this.NOTE_HREF}:${url.href}`, newHref);
    }

    await LinkOriginStore.del(LinkOriginStore.NOTE_ORIGIN, id, url.origin);
  }

  static async noteIds(url: string): Promise<number[]> {
    const key = `${this.NOTE_HREF}:${url}`;
    const value = await BrowserStorage.get<number[] | undefined>(key);
    return value || [];
  }
}
