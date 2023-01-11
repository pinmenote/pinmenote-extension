import { BrowserApi } from '../../../common/service/browser.api.wrapper';
import { BusDownloadMessage } from '../../../common/model/bus.model';
import ICommand = Pinmenote.Common.ICommand;

export class ContentDownloadDataCommand implements ICommand<Promise<void>> {
  constructor(private data: BusDownloadMessage) {}
  async execute(): Promise<void> {
    await BrowserApi.downloads.download({
      url: this.data.url,
      filename: this.data.filename,
      conflictAction: 'uniquify'
    });
  }
}
