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
import { StopWordProfile } from './stop-word-profile';
import { fnConsoleLog } from '../../fn/fn-console';
import stopWords from '../../../vendor/stopwords-iso/stopwords-iso.json';

// skipping those from url
const skipWords = ['https', 'http'];

export class StopWordRemove {
  static execute(iso2lang: string, inputWords: string[]): string[] {
    const profiles: string[] = StopWordProfile.profiles;
    if (profiles.includes(iso2lang)) {
      const out = [];
      const languageProfile: string[] = stopWords[iso2lang];
      for (let i = 0; i < inputWords.length; i++) {
        const word = inputWords[i];
        if (languageProfile.includes(word)) continue;
        if (skipWords.includes(word)) continue;
        // word not in stopword profile so add to output
        out.push(word);
      }
      fnConsoleLog('StopWordRemove', iso2lang, ' input', inputWords.length, 'output', out.length);
      return out;
    }
    fnConsoleLog('TextStopWordRemove->not supported:', iso2lang);
    return inputWords;
  }
}
