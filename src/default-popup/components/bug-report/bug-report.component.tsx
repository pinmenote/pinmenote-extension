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
import { BugReportDto, BugReportResponseDto } from '../../../common/model/bug-report.model';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { BrowserApi } from '@pinmenote/browser-api';
import { BusMessageType } from '../../../common/model/bus.model';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import { DEFAULT_BORDER_RADIUS } from '../../../common/components/colors';
import { FetchResponse } from '@pinmenote/fetch-service';
import Link from '@mui/material/Link';
import { LogManager } from '../../../common/popup/log.manager';
import { PopupActiveTabStore } from '../../store/popup-active-tab.store';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { TinyDispatcher } from '@pinmenote/tiny-dispatcher';
import Typography from '@mui/material/Typography';

interface Props {
  cancelCallback: () => void;
}

export const BugReportComponent: FunctionComponent<Props> = (props) => {
  const [bugReported, setBugReported] = useState<number>(0);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    LogManager.log('BugReportComponent->effect');
    const key = TinyDispatcher.getInstance().addListener<FetchResponse<BugReportResponseDto>>(
      BusMessageType.POPUP_BUG_REPORT,
      (event, key, value) => {
        LogManager.log('handleReportBug 2');
        setDescription(value.data.description);
        setBugReported(2);
      }
    );
    return () => {
      TinyDispatcher.getInstance().removeListener(BusMessageType.POPUP_BUG_REPORT, key);
    };
  });

  const handleReportBug = async (description: string, includeUrl: boolean) => {
    const url = includeUrl ? PopupActiveTabStore.url?.href : undefined;
    setBugReported(1);
    await BrowserApi.sendRuntimeMessage<BugReportDto>({
      type: BusMessageType.POPUP_BUG_REPORT,
      data: { description, url }
    });
    LogManager.log('handleReportBug 1');
  };

  let component;
  if (bugReported === 2) {
    component = (
      <div
        style={{
          display: 'flex',
          height: '300px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography fontSize="2em" marginBottom={2} fontWeight="bold">
          Thank You For Feedback
        </Typography>
        <Typography marginBottom={2}>Bug reported as {description}</Typography>
        <Typography marginBottom={2}>You can look up fixed status on</Typography>
        <Link target="_blank" style={{ marginBottom: 20 }} href="https://pinmenote.com/release-notes">
          https://pinmenote.com/release-notes
        </Link>
        <Button variant="outlined" onClick={() => props.cancelCallback()}>
          Go Back
        </Button>
      </div>
    );
  } else if (bugReported === 1) {
    component = (
      <div
        style={{
          display: 'flex',
          height: '300px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography marginTop={2} marginBottom={2}>
          Sending to server
        </Typography>
        <Button variant="outlined" onClick={() => props.cancelCallback()}>
          Go Back
        </Button>
      </div>
    );
  } else {
    component = <ReportBugForm reportBugCallback={handleReportBug} cancelCallback={props.cancelCallback} />;
  }

  return <div style={{ marginTop: 10 }}>{component}</div>;
};

interface FormProps {
  reportBugCallback: (description: string, includeUrl: boolean) => void;
  cancelCallback: () => void;
}

export const ReportBugForm: FunctionComponent<FormProps> = (props) => {
  const [checked, setChecked] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');

  const handleIncludeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleReportBug = () => {
    LogManager.log('handleReportBug');
    props.reportBugCallback(description, checked);
  };
  return (
    <div>
      <div>
        <div>
          <Typography fontSize="2em">Report bug</Typography>
        </div>
        <div style={{ marginTop: 10 }}>
          <TextareaAutosize
            style={{ borderRadius: DEFAULT_BORDER_RADIUS, padding: 5 }}
            value={description}
            onChange={handleDescriptionChange}
            minRows={9}
            maxRows={9}
            cols={34}
            placeholder="Description ex Website renders incorrectly"
          ></TextareaAutosize>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox checked={checked} onChange={handleIncludeUrl}></Checkbox>
          <Typography>Include website url</Typography>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <Button variant="outlined" onClick={props.cancelCallback}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={handleReportBug}>
          Report Bug
        </Button>
      </div>
    </div>
  );
};
