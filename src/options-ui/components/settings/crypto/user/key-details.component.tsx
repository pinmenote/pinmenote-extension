import React, { FunctionComponent, useEffect, useState } from 'react';
import { CryptoStore } from '../../../../../common/store/crypto.store';
import IconButton from '@mui/material/IconButton';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export interface KeyDetailsComponent {
  username: string;
  hideDetails: () => void;
}

export const KeyDetailsComponent: FunctionComponent<KeyDetailsComponent> = (props) => {
  const [publicKey, setPublicKey] = useState<string>('');

  useEffect(() => {
    setTimeout(async () => {
      const key = await CryptoStore.getUserPublicKey(props.username);
      if (!key) return;
      setPublicKey(key);
    }, 0);
  });

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <h3>{props.username}</h3>
        <IconButton onClick={props.hideDetails}>
          <VisibilityOffIcon />
        </IconButton>
      </div>
      <div>
        <TextareaAutosize minRows={10} maxRows={10} cols={65} value={publicKey}></TextareaAutosize>
      </div>
    </div>
  );
};
