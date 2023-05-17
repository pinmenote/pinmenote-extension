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
const pad = (val: number): string => {
  return val < 10 ? `0${val}` : `${val}`;
};

export const fnDateFormat = (dt: Date): string => {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(
    dt.getMinutes()
  )}:${pad(dt.getSeconds())}`;
};

export const fnTimestampKeyFormat = (timestamp: number): string => {
  const dt = new Date(timestamp);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`;
};

export const fnVideoSecondsTime = (seconds: number): string => {
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  let out = m > 9 ? `${m}:` : `0${m}:`;
  s > 9 ? (out += `${s}`) : (out += `0${s}`);
  return out;
};
