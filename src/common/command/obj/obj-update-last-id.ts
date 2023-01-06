import ICommand = Pinmenote.Common.ICommand;
import { BrowserStorageWrapper } from '../../service/browser.storage.wrapper';
import { ObjectStoreKeys } from '../../keys/object.store.keys';

export class ObjUpdateLastId implements ICommand<Promise<void>> {
  constructor(private id: number) {}

  async execute(): Promise<void> {
    await BrowserStorageWrapper.set(ObjectStoreKeys.OBJECT_LAST_ID, this.id);
  }
}
