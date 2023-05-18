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
import { ObjCanvasDto, ObjSnapshotDto, ObjVideoDataDto } from '../../common/model/obj/obj-snapshot.dto';
import { ObjCommentListDto, ObjPagePinDto, PinBorderDataDto } from '../../common/model/obj/obj-pin.dto';
import { ObjDto, ObjLocalDto, ObjUrlDto } from '../../common/model/obj/obj.dto';
import { DrawModel } from './draw.model';
import { ObjDrawDto } from '../../common/model/obj/obj-draw.dto';
import { ObjRectangleDto } from '../../common/model/obj/obj-utils.dto';
import { PinMouseManager } from './pin-mouse.manager';
import { PinPointFactory } from '../factory/pin-point.factory';

export class PinModel {
  private readonly obj: ObjDto<ObjPagePinDto>;
  private refValue: HTMLElement;
  private rectValue: ObjRectangleDto;

  // TODO move draw data to this model
  readonly draw: DrawModel;

  constructor(
    object: ObjDto<ObjPagePinDto>,
    refValue: HTMLElement,
    readonly top: HTMLDivElement,
    readonly bottom: HTMLDivElement,
    private mouseManager: PinMouseManager
  ) {
    this.obj = object;
    this.refValue = refValue;
    this.rectValue = this.canvas ? this.canvas.rect : PinPointFactory.calculateRect(refValue);
    this.draw = new DrawModel();
  }

  get rect(): ObjRectangleDto {
    return this.rectValue;
  }

  set rect(value: ObjRectangleDto) {
    this.rectValue = value;
  }

  get ref(): HTMLElement {
    return this.refValue;
  }

  set ref(value: HTMLElement) {
    this.mouseManager.stop(this.refValue);
    this.refValue.style.border = this.border.style;
    this.refValue.style.borderRadius = this.border.radius;
    this.refValue = value;
    this.mouseManager.start(this.refValue);
  }

  get id(): number {
    return this.obj.id;
  }

  get serverId(): number | undefined {
    return this.obj.server?.id;
  }

  get url(): ObjUrlDto {
    return this.obj.data.snapshot.url;
  }

  get snapshot(): ObjSnapshotDto {
    return this.obj.data.snapshot;
  }

  get border(): PinBorderDataDto {
    return this.obj.data.border;
  }

  get comments(): ObjCommentListDto {
    return this.obj.data.comments;
  }

  get drawData(): ObjDrawDto[] {
    return this.obj.data.draw.data;
  }

  get canvas(): ObjCanvasDto | undefined {
    return this.obj.data.snapshot.canvas;
  }

  get video(): ObjVideoDataDto[] | undefined {
    return this.obj.data.snapshot.video;
  }

  get local(): ObjLocalDto {
    return this.obj.local;
  }

  get object(): ObjDto<ObjPagePinDto> {
    return this.obj;
  }
}
