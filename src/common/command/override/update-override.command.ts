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
import { ICommand } from '../../model/shared/common.dto';
import { ObjOverrideDto } from '../../model/obj/obj-override.dto';
import { fnSha256Object } from '../../fn/fn-hash';

export class UpdateOverrideCommand implements ICommand<ObjOverrideDto> {
  constructor(private newOverride: Omit<ObjOverrideDto, 'hash'>, private oldOverride?: ObjOverrideDto) {}
  execute(): ObjOverrideDto {
    this.mergeOverlays();
    const hash = fnSha256Object(this.newOverride);
    return { ...this.newOverride, hash };
  }

  private mergeOverlays() {
    if (!this.oldOverride) return;
    if (!this.newOverride.title && this.oldOverride.title) this.newOverride.title = this.oldOverride.title;
    if (!this.newOverride.words && this.oldOverride.words) this.newOverride.words = this.oldOverride.words;
  }
}
