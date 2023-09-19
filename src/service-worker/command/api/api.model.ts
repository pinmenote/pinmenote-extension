import { ApiErrorCode } from '../../../common/model/shared/api.error-code';
import { FetchResponse } from '@pinmenote/fetch-service';
import { ServerErrorDto } from '../../../common/model/shared/common.dto';

export const apiResponseError: Omit<FetchResponse<ServerErrorDto>, 'url'> = {
  ok: false,
  status: 500,
  type: 'JSON',
  data: { code: ApiErrorCode.ANY, message: 'Send request problem' }
};
