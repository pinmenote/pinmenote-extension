import { ApiStoreChangesCommand } from '../api/api-store-changes.command';
import { ICommand } from '../../../common/model/shared/common.dto';
import { SyncGetTimeCommand } from './sync-get-time.command';
import { fnConsoleLog } from '../../../common/fn/console.fn';

export class SyncIdChangesCommand implements ICommand<Promise<void>> {
  async execute(): Promise<void> {
    const dt = await new SyncGetTimeCommand().execute();

    const remoteChanges = await new ApiStoreChangesCommand(dt).execute();
    fnConsoleLog(remoteChanges);
  }
}
