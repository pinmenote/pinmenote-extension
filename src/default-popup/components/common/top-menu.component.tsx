import React, { FunctionComponent, useState } from 'react';

export interface TopMenuComponentProps {
  firstLabel: string;
  secondLabel: string;
  firstClickCallback: () => void;
  secondClickCallback: () => void;
}

export const TopMenuComponent: FunctionComponent<TopMenuComponentProps> = (props) => {
  const [selected, setSelected] = useState<string>(props.firstLabel);

  const handleFirstClick = () => {
    setSelected(props.firstLabel);
    props.firstClickCallback();
  };

  const handleSecondClick = () => {
    setSelected(props.secondLabel);
    props.secondClickCallback();
  };

  return (
    <div>
      <div
        style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
      >
        <div
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            width: 150,
            fontSize: '1.5em',
            textAlign: 'center',
            fontWeight: selected === props.firstLabel ? 'bold' : ''
          }}
          onClick={handleFirstClick}
        >
          {props.firstLabel}
        </div>
        <div style={{ fontSize: '2em', userSelect: 'none' }}>|</div>
        <div
          style={{
            userSelect: 'none',
            cursor: 'pointer',
            width: 150,
            fontSize: '1.5em',
            textAlign: 'center',
            fontWeight: selected === props.secondLabel ? 'bold' : ''
          }}
          onClick={handleSecondClick}
        >
          {props.secondLabel}
        </div>
      </div>
    </div>
  );
};
