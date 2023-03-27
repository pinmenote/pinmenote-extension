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
import { HtmlPrettifyFactory } from '../../factory/html-prettify.factory';
import { applyStylesToElement } from '../../../common/style.utils';

const elStyle = {
  'margin-top': '48px',
  'flex-direction': 'column',
  display: 'none'
};

const actionStyle = {
  'flex-direction': 'row',
  display: 'flex'
};

const textStyle = {
  resize: 'auto'
};

const btnStyle = {
  'background-color': '#000000',
  border: '1px solid #ffffff',
  color: '#ffffff',
  padding: '4px',
  'text-align': 'center',
  'text-decoration': 'none',
  display: 'inline-block',
  'font-size': '16px'
};

export class HtmlEditComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private readonly el = document.createElement('div');

  private text = document.createElement('textarea');
  private action = document.createElement('div');
  private saveButton = document.createElement('button');
  private rollbackButton = document.createElement('button');

  public originalHtml: string;
  private htmlValue = '';

  constructor(private ref: HTMLElement) {
    // TODO fix parent icon click
    this.originalHtml = ref.innerHTML;
  }

  get value(): string | undefined {
    return this.htmlValue;
  }

  setOriginalHtml(value: string): void {
    this.originalHtml = value;
  }

  focusin(): void {
    this.text.value = HtmlPrettifyFactory.prettify(this.htmlValue || this.ref.innerHTML);
    this.el.style.display = 'flex';
  }

  focusout(): void {
    this.el.style.display = 'none';
  }

  render(): HTMLElement {
    applyStylesToElement(this.text, textStyle);
    this.el.appendChild(this.text);

    this.saveButton.addEventListener('click', this.handleSaveClick);
    this.saveButton.innerText = 'Save';
    applyStylesToElement(this.saveButton, btnStyle);
    this.action.appendChild(this.saveButton);

    this.rollbackButton.addEventListener('click', this.handleRollbackClick);
    this.rollbackButton.innerText = 'Rollback';
    applyStylesToElement(this.rollbackButton, btnStyle);
    this.action.appendChild(this.rollbackButton);

    this.el.appendChild(this.action);
    applyStylesToElement(this.action, actionStyle);

    applyStylesToElement(this.el, elStyle);
    return this.el;
  }

  cleanup(): void {
    this.saveButton.removeEventListener('click', this.handleSaveClick);
    this.rollbackButton.removeEventListener('click', this.handleRollbackClick);
  }

  rollback = (): void => {
    this.ref.innerHTML = this.originalHtml;
  };

  private handleSaveClick = () => {
    this.htmlValue = this.text.value;
  };

  private handleRollbackClick = () => {
    this.ref.innerHTML = this.originalHtml;
  };
}
