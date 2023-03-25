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
export const fnComputeUrl = (value: string): string => {
  let baseurl = window.location.href;
  // cleanup baseurl ending with html/htm
  if (baseurl.endsWith('html') || baseurl.endsWith('htm')) {
    const a = window.location.pathname.split('/');
    const subpath = a.slice(0, a.length - 1).join('/');
    baseurl = `${window.location.origin}${subpath}`;
  }
  // cleanup ending /
  if (baseurl.endsWith('/')) baseurl = baseurl.substring(0, baseurl.length - 1);

  if (value.startsWith('//')) {
    return `${window.location.protocol}${value}`;
  } else if (value.startsWith('/')) {
    return `${window.location.origin}${value}`;
  } else if (value.startsWith('./')) {
    // URL constructor is good with subpath resolution so ../../foo ../foo ./foo
    const url = new URL(baseurl + '/' + value);
    return url.href;
  } else if (!value.startsWith('http')) {
    return `${baseurl}/${value}`;
  }
  return value;
};
