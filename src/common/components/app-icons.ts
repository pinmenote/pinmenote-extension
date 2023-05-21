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
import icon128 from '../../assets/icon/light/128.png';
import icon16 from '../../assets/icon/light/16.png';
import icon24 from '../../assets/icon/light/24.png';
import icon32 from '../../assets/icon/light/32.png';
import icon48 from '../../assets/icon/light/48.png';

export const appLightIcons = () => {
  if (BrowserApi.isChrome) {
    const start = BrowserApi.runtimeUrl.length + 1;
    return {
      path: {
        '16': (icon16 as string).substring(start).split('?')[0],
        '24': (icon24 as string).substring(start).split('?')[0],
        '32': (icon32 as string).substring(start).split('?')[0]
      }
    };
  }
  return {
    path: {
      '16': icon16,
      '48': icon48,
      '128': icon128
    }
  };
};

export const appLight32Icon = () => {
  return icon32;
};
