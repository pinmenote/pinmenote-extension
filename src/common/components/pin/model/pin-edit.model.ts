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
import { ObjDto, ObjLocalDto, ObjUrlDto } from '../../../model/obj/obj.dto';
import { ObjPinDto, PinBorderDataDto, PinIframeDto } from '../../../model/obj/obj-pin.dto';
import { ObjVideoDataDto, PageCanvasDto } from '../../../model/obj/page-snapshot.dto';
import { ObjCommentListDto } from '../../../model/obj/obj-comment.dto';
import { ObjRectangleDto } from '../../../model/obj/obj-utils.dto';
import { PinComponent } from '../pin.component';
import { PinDocument } from './pin-view.model';
import { PinDrawEditModel } from './pin-draw-edit.model';
import { PinMouseManager } from '../pin-mouse.manager';
import { PinPointFactory } from '../../../factory/pin-point.factory';
import { TopBarComponent } from '../top-bar/top-bar.component';

export class PinEditModel {
  private readonly obj: ObjDto<ObjPinDto>;
  private refValue: HTMLElement;
  private rectValue: ObjRectangleDto;

  // TODO move draw data to this model
  readonly draw: PinDrawEditModel;

  constructor(
    object: ObjDto<ObjPinDto>,
    refValue: HTMLElement,
    private component: PinComponent,
    private mouseManager: PinMouseManager,
    readonly doc: PinDocument
  ) {
    this.obj = object;
    this.refValue = refValue;
    this.rectValue = this.canvas ? this.canvas.rect : PinPointFactory.calculateRect(refValue);
    this.draw = new PinDrawEditModel(this.obj.data.draw);
  }

  get top(): HTMLDivElement {
    return this.component.top;
  }

  get topBar(): TopBarComponent {
    return this.component.topBar;
  }

  get bottom(): HTMLDivElement {
    return this.component.bottom;
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
    return this.obj.data.data.url;
  }

  get iframe(): PinIframeDto | undefined {
    return this.obj.data.data.iframe;
  }

  get border(): PinBorderDataDto {
    return this.obj.data.data.border;
  }

  get comments(): ObjCommentListDto {
    return this.obj.data.comments;
  }

  get canvas(): PageCanvasDto | undefined {
    return this.obj.data.data.canvas;
  }

  get video(): ObjVideoDataDto | undefined {
    return this.obj.data.video;
  }

  get local(): ObjLocalDto {
    return this.obj.local;
  }

  get object(): ObjDto<ObjPinDto> {
    return this.obj;
  }

  remove() {
    this.component.cleanup();
  }
}
