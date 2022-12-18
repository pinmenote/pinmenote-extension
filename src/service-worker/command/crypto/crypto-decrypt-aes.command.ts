import { decrypt, readMessage } from 'openpgp';
import { fnConsoleLog } from '@common/fn/console.fn';
import ICommand = Pinmenote.Common.ICommand;

export class CryptoDecryptAesCommand implements ICommand<Promise<any>> {
  constructor(private message: string, private password: string) {}
  async execute(): Promise<any> {
    const message = await readMessage({
      binaryMessage: this.message
    });
    const decrypted = await decrypt({
      message,
      passwords: [this.password],
      format: 'binary'
    });
    fnConsoleLog('CryptoDecryptAesCommand->decrypted', decrypted);
    return decrypted;
  }
}
