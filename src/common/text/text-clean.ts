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
export class TextClean {
  static allTextClean(inputText: string) {
    let output = this.cleanParenthesis(inputText);
    output = this.removeDoubleSpaceEnter(output);
    return output;
  }

  static wordClean(wordList: string[]): string[] {
    const out: string[] = [];
    for (let word of wordList) {
      // Special characters
      word = word.replaceAll(/[()!-.'/:\-–\t\n\r,"„%\u8195]+/g, '');
      if (word === '') continue;
      if (word.length <= 2) continue;
      out.push(word.toLowerCase());
    }
    return out;
  }

  private static removeDoubleSpaceEnter(inputText: string): string {
    return inputText.replaceAll('\n', ' ').replaceAll('  ', ' ');
  }

  private static cleanParenthesis(inputText: string): string {
    return inputText.replaceAll(/\[[\w ]+\]/g, '');
  }
}
