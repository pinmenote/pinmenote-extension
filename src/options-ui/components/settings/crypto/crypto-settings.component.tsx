/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CryptoGenerateKeyPairCommand } from '../../../../common/command/crypto/crypto-generate-key-pair.command';
import { CryptoStore } from '../../../../common/store/crypto.store';
import IconButton from '@mui/material/IconButton';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const CryptoSettingsComponent: FunctionComponent = () => {
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(async () => {
      if (!publicKey || !privateKey) {
        await CryptoStore.loadKeys();
        setPublicKey(CryptoStore.publicKey);
      }
    }, 0);
  }, []);

  const handleShowHidePrivateKey = () => {
    setShowPrivateKey(!showPrivateKey);
    setPrivateKey(CryptoStore.privateKey);
  };

  const handleCopyClick = () => {
    const copyFn = (event: ClipboardEvent) => {
      event.preventDefault();
      event.clipboardData?.setData('text/plain', CryptoStore.privateKey);
    };
    document.addEventListener('copy', copyFn);
    document.execCommand('copy');
    document.removeEventListener('copy', copyFn);
  };

  const handleRotateKey = async () => {
    await CryptoStore.delPrivateKey();
    await new CryptoGenerateKeyPairCommand().execute();
    setPublicKey(CryptoStore.publicKey);
    if (showPrivateKey) setPrivateKey(CryptoStore.privateKey);
  };

  const privateKeyComponent = showPrivateKey ? <TextareaAutosize maxRows={10} cols={60} value={privateKey} /> : '';
  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        cryptography
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          private key
        </Typography>
        {privateKeyComponent}
        <IconButton onClick={handleShowHidePrivateKey} title={showPrivateKey ? 'hide private key' : 'show private key'}>
          {showPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        <IconButton onClick={handleCopyClick} title="copy private key to clipboard">
          <ContentCopyIcon />
        </IconButton>
        <IconButton title="rotate private key" onClick={handleRotateKey}>
          <RestartAltIcon />
        </IconButton>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          public key
        </Typography>
        <TextareaAutosize maxRows={10} cols={60} value={publicKey} />
        <IconButton>
          <ContentCopyIcon />
        </IconButton>
      </div>
    </div>
  );
};
