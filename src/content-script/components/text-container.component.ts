import { HtmlComponent, HtmlComponentFocusable } from '../../common/model/html.model';
import { PinObject } from '../../common/model/pin.model';
import { TextBarComponent } from './text-bar/text-bar.component';
import { TextEditorComponent } from './text-editor.component';
import PinRectangle = Pinmenote.Pin.PinRectangle;

export class TextContainerComponent implements HtmlComponent<HTMLElement>, HtmlComponentFocusable {
  private el = document.createElement('div');

  private textBar: TextBarComponent;
  private textEditor: TextEditorComponent;
  constructor(private object: PinObject, rect: PinRectangle) {
    this.textBar = new TextBarComponent();
    this.textEditor = new TextEditorComponent(object, rect);
  }

  render(): HTMLElement {
    const bar = this.textBar.render();
    const text = this.textEditor.render();
    this.el.appendChild(bar);
    this.el.appendChild(text);
    return this.el;
  }

  focus(goto = false): void {
    this.textEditor.focus(goto);
  }

  resize(rect: PinRectangle): void {
    this.textEditor.resize(rect);
  }

  cleanup(): void {
    this.textEditor.cleanup();
  }

  focusin(): void {
    this.textEditor.focusin();
  }

  focusout(): void {
    this.textEditor.focusout();
  }
}
