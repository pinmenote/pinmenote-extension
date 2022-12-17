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
import { PinObject } from '@common/model/pin.model';
import { PinStore } from '../../store/pin.store';
import { resolveVideoTime } from '../../fn/resolve-video-time';
import ICommand = Pinmenote.Common.ICommand;

export class PinFocusCommand implements ICommand<void> {
  constructor(private data?: PinObject) {}
  execute(): void {
    if (!this.data) return;
    PinStore.focusPin(this.data);
    // TODO fixme
    setTimeout(() => resolveVideoTime(this.data?.content.videoTime), 1000);
  }
}
