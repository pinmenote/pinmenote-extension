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
import * as LanguageDetect from 'languagedetect';
import { fnConsoleLog } from '../fn/fn-console';

export class DetectLanguage {
  private static lang = new LanguageDetect();

  static detect(sample: string): string | undefined {
    this.lang.setLanguageType('iso2');
    const samp = sample.length < 1000 ? sample : sample.substring(0, 1000);
    const languages = this.lang.detect(samp);
    if (!languages[0]) return undefined;
    fnConsoleLog('DetectLanguage', languages[0]);
    return languages[0][0];
  }
}
