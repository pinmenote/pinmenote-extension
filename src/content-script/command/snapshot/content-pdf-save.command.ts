import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import { FetchPDFRequest } from '../../../common/model/obj-request.model';
import { FetchResponse } from '@pinmenote/fetch-service';
import { ICommand } from '../../../common/model/shared/common.dto';
import { ObjUrlDto } from '../../../common/model/obj/obj.dto';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import { fnConsoleLog } from '../../../common/fn/fn-console';

export class ContentPdfSaveCommand implements ICommand<Promise<void>> {
  constructor(private url: ObjUrlDto) {}
  async execute(): Promise<void> {
    const data: FetchPDFRequest = { url: this.url.href };
    TinyDispatcher.getInstance().addListener<FetchResponse<string>>(
      BusMessageType.CONTENT_FETCH_PDF,
      (event, key, value) => {
        if (value.url === this.url.href) {
          TinyDispatcher.getInstance().removeListener(event, key);
          fnConsoleLog('GOT PDF BUT MAYBE JUST SAVE IT INSIDE SERVICE WORKER!!!', value);
        }
      }
    );
    await BrowserApi.sendRuntimeMessage({ type: BusMessageType.CONTENT_FETCH_PDF, data });
  }
}
