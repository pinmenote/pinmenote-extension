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
import { fnUid } from '../fn/uid.fn';

export class TinyEventDispatcher {
  private static listeners: { [key: string]: { [key: string]: any } } = {};

  static addListener<T>(event: string, handler: (event: string, key: string, value: T) => void): string {
    if (!this.listeners[event]) {
      this.listeners[event] = {};
    }
    const key = fnUid();
    this.listeners[event][key] = handler;
    // LogManager.log(`Add listener ${event} ${key} ${JSON.stringify(Object.keys(this.listeners[event]))}`);
    return key;
  }

  static dispatch<T>(event: string, value: T): void {
    if (this.listeners[event]) {
      for (const key in this.listeners[event]) {
        this.listeners[event][key](event, key, value); // eslint-disable-line @typescript-eslint/no-unsafe-call
      }
    }
  }

  static removeListener(event: string, key: string): boolean {
    // LogManager.log(`Remove listener ${event} ${key}`);
    if (!this.listeners[event]) return false;
    if (this.listeners[event][key]) {
      delete this.listeners[event][key];
      return true;
    }
    // LogManager.log(`Not Removed ${JSON.stringify(this.listeners[event])}`);
    return false;
  }

  static removeAllListener(event: string): boolean {
    if (!this.listeners[event]) return false;
    delete this.listeners[event];
    return true;
  }

  static cleanup() {
    this.listeners = {};
  }
}
