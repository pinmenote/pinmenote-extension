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
import { HtmlComponent, HtmlComponentFocusable } from '../../../common/model/html.model';
import { PinComponent } from '../pin.component';
import { PinUpdateCommand } from '../../../common/command/pin/pin-update.command';
import { applyStylesToElement } from '../../../common/style.utils';
import { fnConsoleLog } from '../../../common/fn/console.fn';

const elStyle = {
  'flex-direction': 'column',
  display: 'none'
};

const actionStyle = {
  'flex-direction': 'row',
  display: 'flex'
};

export class HtmlEditComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private text = document.createElement('textarea');
  private action = document.createElement('div');
  private saveButton = document.createElement('button');
  private cancelButton = document.createElement('button');

  public originalHtml: string;

  constructor(private parent: PinComponent) {
    // TODO fix parent icon click
    this.originalHtml = parent.ref.innerHTML;
  }

  get value(): string | undefined {
    return this.parent.object.data.htmlEdit;
  }

  setOriginalHtml(value: string): void {
    this.originalHtml = value;
  }

  focusin(): void {
    this.el.style.display = 'flex';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  render(): HTMLElement {
    this.text.value = this.parent.object.data.htmlEdit || this.parent.ref.innerHTML;
    this.text.addEventListener('input', this.handleTextInput);
    this.el.appendChild(this.text);

    this.saveButton.addEventListener('click', this.handleSaveClick);
    this.saveButton.innerText = 'Save';
    this.action.appendChild(this.saveButton);

    this.cancelButton.addEventListener('click', this.handleRollbackClick);
    this.cancelButton.innerText = 'Rollback';
    this.action.appendChild(this.cancelButton);

    this.el.appendChild(this.action);
    applyStylesToElement(this.action, actionStyle);

    applyStylesToElement(this.el, elStyle);
    return this.el;
  }

  cleanup(): void {
    this.text.removeEventListener('input', this.handleTextInput);
    this.saveButton.removeEventListener('click', this.handleSaveClick);
    this.cancelButton.removeEventListener('click', this.handleRollbackClick);
  }

  private handleTextInput = () => {
    fnConsoleLog('input !!!');
  };

  private handleSaveClick = async () => {
    this.parent.object.data.htmlEdit = this.text.value;
    this.parent.edit.updateHtml();
    this.parent.editBar.htmlEditTurnOff();
    this.parent.htmlEditComponent.focusout();
    await new PinUpdateCommand(this.parent.object).execute();
  };

  private handleRollbackClick = async () => {
    this.parent.editBar.htmlEditTurnOff();
    this.parent.htmlEditComponent.focusout();
    this.parent.ref.innerHTML = this.originalHtml;
    this.parent.object.data.htmlEdit = undefined;
    await new PinUpdateCommand(this.parent.object).execute();
  };
}
