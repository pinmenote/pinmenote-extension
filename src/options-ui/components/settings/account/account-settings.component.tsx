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
import { AccessTokenDto, TokenDataDto } from '../../../../common/model/shared/token.dto';
import { TokenDecodeCommand } from '../../../../common/command/server/token/token-decode.command';

const borderContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
};

interface Props {
  token?: AccessTokenDto;
}

export const AccountSettingsComponent: FunctionComponent<Props> = (props) => {
  let accessToken: TokenDataDto | undefined = undefined;
  let subscribedTo = '';
  if (props.token) {
    accessToken = new TokenDecodeCommand(props.token.access_token).execute();
  }

  const getAccountType = (role?: number[]) => {
    if (!role) return '';
    if (!accessToken) return '';
    if (role.includes(3)) {
      if (accessToken.data.subscribed) {
        const dt = new Date(accessToken.data.subscribed);
        const m = dt.toLocaleString('default', { month: 'long' });
        const d = dt.getDate() > 9 ? dt.getDate() : `0${dt.getDate()}`;
        subscribedTo = `${d} ${m} ${dt.getFullYear()}`;
      }
      return 'premium';
    }
    return 'free';
  };

  return (
    <div>
      <Typography fontSize="2.5em" style={{ marginBottom: 10 }}>
        account
      </Typography>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          email
        </Typography>
        <Typography>{accessToken?.data.email}</Typography>
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          username
        </Typography>
        <Typography>{accessToken?.data.username}</Typography>
      </div>
      <div style={borderContainer}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          account type
        </Typography>
        <Typography>{getAccountType(accessToken?.data.role)}</Typography>
      </div>
      <div style={{ display: subscribedTo ? 'flex' : 'none', ...borderContainer }}>
        <Typography fontSize="2em" textAlign="right" width={150} style={{ marginRight: 20 }}>
          subscribed to
        </Typography>
        <Typography>{subscribedTo} (automatic renewal)</Typography>
      </div>
    </div>
  );
};
