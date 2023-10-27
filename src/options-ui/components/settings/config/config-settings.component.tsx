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
import React, { CSSProperties, FunctionComponent } from 'react';
import Typography from '@mui/material/Typography';
import { environmentConfig } from '../../../../common/environment';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

export const ConfigSettingsComponent: FunctionComponent = () => {
  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        default config
      </Typography>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          address:
        </Typography>
        <Typography fontSize="2em" textAlign="left" width={150} style={{ marginRight: 20 }}>
          {environmentConfig.defaultServer}
        </Typography>
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          production:
        </Typography>
        <Typography fontSize="2em" textAlign="left" width={150} style={{ marginRight: 20 }}>
          {environmentConfig.isProduction.toString()}
        </Typography>
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          list limit:
        </Typography>
        <Typography fontSize="2em" textAlign="left" width={150} style={{ marginRight: 20 }}>
          {environmentConfig.objListLimit}
        </Typography>
      </div>
    </div>
  );
};
