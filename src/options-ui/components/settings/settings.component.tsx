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
import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { ContentSettingsComponent } from './content/content-settings.component';
import { DEFAULT_BORDER_RADIUS } from '../../../common/components/colors';
import { ScreenshotSettingsComponent } from './screenshot/screenshot-settings.component';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { OptionsConvertObjectsCommand } from '../../command/options-convert-objects.command';
import { environmentConfig } from '../../../common/environment';
import { OpenSourceListComponent } from './open-source/open-source-list.component';
import { AccountSettingsComponent } from './account/account-settings.component';
import { TokenStorageGetCommand } from '../../../common/command/server/token/token-storage-get.command';
import { AccessTokenDto } from '../../../common/model/shared/token.dto';
import { ConfigSettingsComponent } from './config/config-settings.component';

const containerStyle: CSSProperties = {
  margin: 10,
  width: '70vw',
  borderRadius: DEFAULT_BORDER_RADIUS,
  border: '2px dashed #000',
  padding: 20
};

export const SettingsComponent: FunctionComponent = () => {
  const [tokenData, setTokenData] = useState<AccessTokenDto | undefined>();
  useEffect(() => {
    new TokenStorageGetCommand()
      .execute()
      .then((data) => {
        setTokenData(data);
      })
      .catch(() => {
        /* IGNORE */
      });
  }, []);
  const handleConvert = async () => {
    await new OptionsConvertObjectsCommand().execute();
  };

  let convertComponent = null;
  if (!environmentConfig.isProduction) {
    convertComponent = (
      <div style={{ marginLeft: 20 }}>
        <Button variant="outlined" onClick={handleConvert}>
          Convert Objects
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', zIndex: 1 }}>
      {convertComponent}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography fontSize="3em" style={{ margin: 20 }}>
          Settings
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', height: 'calc(100vh - 160px)' }}>
        <div style={{ display: tokenData ? 'flex' : 'none', ...containerStyle }}>
          <AccountSettingsComponent token={tokenData} />
        </div>
        <div style={containerStyle}>
          <ScreenshotSettingsComponent />
        </div>
        <div style={containerStyle}>
          <ContentSettingsComponent />
        </div>
        <div style={{ marginBottom: 120, ...containerStyle }}>
          <OpenSourceListComponent />
        </div>
        <div style={containerStyle}>
          <ConfigSettingsComponent />
        </div>
      </div>
    </div>
  );
};
