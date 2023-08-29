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
import { BrowserStorage } from '@pinmenote/browser-api';
import { ICommand } from '../../model/shared/common.dto';
import { LinkHrefStore } from '../../store/link-href.store';
import { ObjPdfDto } from '../../model/obj/obj-pdf.dto';
import { ObjRemoveIdCommand } from '../obj/id/obj-remove-id.command';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class PdfRemoveCommand implements ICommand<Promise<void>> {
  constructor(private id: number, private dto: ObjPdfDto) {}
  async execute(): Promise<void> {
    await BrowserStorage.remove(`${ObjectStoreKeys.PDF_DATA}:${this.dto.hash}`);
    await BrowserStorage.remove(`${ObjectStoreKeys.OBJECT_ID}:${this.id}`);

    await LinkHrefStore.del(this.dto.url, this.id);

    await new ObjRemoveIdCommand(this.id, ObjectStoreKeys.OBJECT_LIST).execute();
  }
}
