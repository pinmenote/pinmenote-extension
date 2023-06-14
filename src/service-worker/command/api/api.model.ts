import { FetchResponse } from '@pinmenote/fetch-service';
import { ServerErrorDto } from '../../../common/model/shared/common.dto';

export const apiResponseError: Omit<FetchResponse<ServerErrorDto>, 'url'> = {
  ok: false,
  status: 500,
  type: 'JSON',
  data: { message: 'Send request problem' }
};
