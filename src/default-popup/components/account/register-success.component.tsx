import React, { FunctionComponent } from 'react';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import { TinyEventDispatcher } from '../../../common/service/tiny.event.dispatcher';
import Typography from '@mui/material/Typography';

interface RegisterSuccessProps {
  registerSuccess: boolean;
}

export const RegisterSuccessComponent: FunctionComponent<RegisterSuccessProps> = (props) => {
  const handleAccountClick = () => {
    TinyEventDispatcher.dispatch(BusMessageType.POP_ACCOUNT_CLICK, undefined);
  };

  return (
    <div
      style={{
        display: props.registerSuccess ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300
      }}
    >
      <div>
        <Typography style={{ fontSize: '24pt' }}>
          Thank you for registering, check your inbox to verify email
        </Typography>
      </div>
      <div>
        <Button sx={{ width: '100%' }} variant="outlined" onClick={handleAccountClick}>
          Go To Account
        </Button>
      </div>
    </div>
  );
};
