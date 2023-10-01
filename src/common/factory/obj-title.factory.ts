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
import { ObjDto, ObjTypeDto } from '../model/obj/obj.dto';
import { ObjPdfDto } from '../model/obj/obj-pdf.dto';
import { ObjPageDto } from '../model/obj/obj-page.dto';
import { ObjPageNoteDto } from '../model/obj/obj-note.dto';
import { ObjPinDto } from '../model/obj/obj-pin.dto';

interface TitleData {
  title: string;
  small: string;
}

export class ObjTitleFactory {
  static computeTitle(obj: ObjDto): string {
    switch (obj.type) {
      case ObjTypeDto.Pdf: {
        const a = (obj as ObjDto<ObjPdfDto>).data.data.url.pathname.split('/');
        return a[a.length - 1];
      }
      case ObjTypeDto.PageSnapshot:
      case ObjTypeDto.PageElementSnapshot: {
        return (obj as ObjDto<ObjPageDto>).data.snapshot.info.title;
      }
      case ObjTypeDto.PageNote: {
        return (obj as ObjDto<ObjPageNoteDto>).data.data.title;
      }
      case ObjTypeDto.PageElementPin: {
        return (obj as ObjDto<ObjPinDto>).data.description.title;
      }
    }
    return `computeTitle - ${obj.type} - NOT SUPPORTED`;
  }

  static computeTitleSize(obj: ObjDto, maxSize = 30): TitleData {
    const title = this.computeTitle(obj);
    return {
      title,
      small: title.length > maxSize ? `${title.substring(0, maxSize)}...` : title
    };
  }
}
