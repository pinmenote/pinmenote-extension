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
import { ContentPageElementSnapshotAddCommand } from '../command/snapshot/content-page-element-snapshot-add.command';
import { ContentSettingsStore } from '../store/content-settings.store';
import { DocumentMediator } from '../mediator/document.mediator';
import { UrlFactory } from '../../common/factory/url.factory';

export class PinSnapshotFactory {
  private static currentElement: HTMLElement | null = null;
  private static borderStyle = '';
  private static borderRadius = '';

  static get hasElement(): boolean {
    return !!this.currentElement;
  }

  static clear(): void {
    if (!this.currentElement) return;
    this.currentElement?.removeEventListener('click', this.handleElementClick);
    this.currentElement.style.border = this.borderStyle;
    this.currentElement.style.borderRadius = this.borderRadius;
    this.borderStyle = '';
    this.borderRadius = '';
    this.currentElement = null;
  }

  static updateElement(element: HTMLElement): void {
    if (this.currentElement !== element) {
      this.currentElement?.removeEventListener('click', this.handleElementClick);
      this.currentElement = element;
      this.currentElement.addEventListener('click', this.handleElementClick);
      this.borderStyle = this.currentElement.style.border;
      this.borderRadius = this.currentElement.style.borderRadius;
      this.currentElement.style.border = ContentSettingsStore.newElementStyle;
      this.currentElement.style.borderRadius = ContentSettingsStore.borderRadius;
    }
  }

  private static handleElementClick = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const element = this.currentElement;
    DocumentMediator.stopListeners();
    if (element) {
      const url = UrlFactory.newUrl();
      await new ContentPageElementSnapshotAddCommand(url, element).execute();
    }
  };
}
