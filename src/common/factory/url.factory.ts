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
import { ObjUrlDto } from '../model/obj/obj.dto';

interface QueryParam {
  key: string;
  value: string;
}

export class UrlFactory {
  static newUrl(): ObjUrlDto {
    return {
      href: this.normalizeHref(window.location.href),
      origin: this.normalizeOrigin(window.location.origin),
      pathname: window.location.pathname,
      search: window.location.search
    };
  }

  static normalizeOrigin = (value: string): string => {
    if (value.startsWith('https')) {
      value = value.substring(8);
    } else if (value.startsWith('http')) {
      value = value.substring(7);
    }
    if (value.startsWith('www')) {
      value = value.substring(4);
    }
    return value;
  };

  static normalizeHref = (value: string): string => {
    const url = new URL(value);
    if (url.search) {
      const query = url.search.slice(1);
      const result: QueryParam[] = [];
      query.split('&').forEach(function (part) {
        const item = part.split('=');
        result.push({
          key: item[0],
          value: decodeURIComponent(item[1])
        });
      });
      const search = trimParams(url.host, result);
      if (search) {
        return `${url.origin}${url.pathname}?${search}`;
      }
      return `${url.origin}${url.pathname}`;
    }
    return `${url.origin}${url.pathname}`;
  };

  static toDataUri = async (value: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(this.result as string);
      };
      reader.onerror = function () {
        reject(this.error);
      };
      reader.readAsDataURL(value);
    });
  };
}

const trimParams = (host: string, queryParams: QueryParam[]): string => {
  let out = '';
  const toDelete = ['referre'];
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }
  if (host.startsWith('youtube')) {
    toDelete.push('t', 'start_radio', 'list');
  }
  if (host.startsWith('twitter')) {
    toDelete.push('src');
  }
  for (const param of queryParams) {
    // skip utm_ args https://en.wikipedia.org/wiki/UTM_parameters
    if (param.key.startsWith('utm_')) continue;
    // allegro.pl details
    if (param.key.startsWith('bi_')) continue;
    // reference skip
    if (param.key.startsWith('ref_')) continue;
    // fb
    if (param.key.startsWith('fbclid')) continue;
    if (!toDelete.includes(param.key) && !!param.key && param.value !== 'undefined') {
      out += `&${param.key}=${encodeURIComponent(param.value)}`;
    }
  }
  return out.slice(1);
};
