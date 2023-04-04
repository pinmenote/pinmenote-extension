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
import { ConstraintsNlp } from './constraints.nlp';

export class WordToVectorNlp {
  static vec2word(vec: number[], num2Gram: { [key: number]: string }): string {
    let out = '';
    for (let i = 0; i < vec.length; i++) {
      out += num2Gram[vec[i]].charAt(0);
    }
    out += num2Gram[vec[vec.length - 1]].charAt(1);
    return out;
  }

  static word2vec(word: string, gram2num: { [key: string]: number }): number[] {
    let key = '';
    let gram2 = '';
    const out = [];
    for (let i = 0; i < word.length; i++) {
      key = word.charAt(i).toLowerCase();
      if (ConstraintsNlp.KEY_MAP[key]) key = ConstraintsNlp.KEY_MAP[key];
      gram2 += key;
      if (gram2.length === 2) {
        out.push(gram2num[gram2]);
        gram2 = gram2.charAt(1);
      }
    }
    return out;
  }
}
