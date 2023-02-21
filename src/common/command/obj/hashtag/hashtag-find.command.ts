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
import { ICommand } from '../../../model/shared/common.dto';

const HASHTAG_REGEX = new RegExp(/#(\w+)/g);

export class HashtagFindCommand implements ICommand<string[]> {
  constructor(private value: string) {}

  execute(): string[] {
    const match = this.value.match(HASHTAG_REGEX);
    return match ? Array.from(match) : [];
  }
}
