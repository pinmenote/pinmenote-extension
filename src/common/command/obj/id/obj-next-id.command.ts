import ICommand = Pinmenote.Common.ICommand;
import { BrowserStorageWrapper } from '../../../service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../../keys/object.store.keys';

export class ObjNextIdCommand implements ICommand<Promise<number>> {
  async execute(): Promise<number> {
    const value = await BrowserStorageWrapper.get<number | undefined>(ObjectStoreKeys.OBJECT_ID);
    if (value) return value + 1;
    return 1;
  }
}
