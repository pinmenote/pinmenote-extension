import { HtmlComponent } from '../../../../common/model/html.model';
import { fnConsoleLog } from '../../../../common/fn/console.fn';

export class CopyIconComponent implements HtmlComponent<HTMLElement> {
  private el = document.createElement('div');
  render(): HTMLElement {
    return this.el;
  }

  cleanup() {
    fnConsoleLog('cleanup');
  }
}
