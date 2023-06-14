import React, { FunctionComponent } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import Button from '@mui/material/Button';

export const SettingsButtonComponent: FunctionComponent = () => {
  return (
    <div style={{ position: 'absolute', bottom: 0, width: 300 }}>
      <Button
        sx={{ width: '100%' }}
        style={{ marginBottom: 10 }}
        variant="outlined"
        onClick={() => BrowserApi.openOptionsPage('#settings')}
      >
        Settings
      </Button>
    </div>
  );
};
