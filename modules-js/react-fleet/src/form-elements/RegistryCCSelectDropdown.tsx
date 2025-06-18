/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import hash from 'string-hash';

interface Options {
  label: string;
  value: string;
}

interface Props {
  label: string;
  name?: string;
  value?: string;
  id?: string;
  options: Options[];

  onBlur?(e: any): void;
  onChange?(e: any): void;
  onFocus?(e: any): void;
}

export default function RegistryCCSelectDropDown(props: Props): JSX.Element {
  const { label, id, options } = props;

  const key = id || `select-${hash(props.label)}`;

  const opts = (options: Options[]) => {
    return options.map((option: { value: string; label: React.ReactNode }) => {
      return (
        <option value={option.value} key={`${id}_${option.label}`}>
          {option.label}
        </option>
      );
    });
  };

  return (
    <span
      css={CS_SELECT}
      className="labeled-select"
      key={`select--key-${hash(props.label)}`}
    >
      <label htmlFor={key}>{label}:</label>
      <div className="select--wrapper">
        <select
          id={key}
          name={props.name}
          value={props.value}
          onBlur={props.onBlur}
          onChange={props.onChange}
          onFocus={props.onFocus}
        >
          {opts(options)}
        </select>
      </div>
    </span>
  );
}

const CS_SELECT = css`
  display: flex;

  color: #000;
  font-family: Lora;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  width: max-content;
  align-content: center;
  align-items: center;

  .select--wrapper {
    display: flex;

    select {
      appearance: none;
      border-radius: 0;
      border: 0;
      padding: 0.3em 1em 0.25em 0.25em;
      margin-left: 0.25rem;

      font-family: Lora;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;

      color: #1871bd;
      text-align: center;
      text-decoration-line: underline;
      text-decoration-style: solid;
      text-decoration-skip-ink: auto;
      text-decoration-thickness: auto;
      text-underline-offset: auto;
      text-underline-position: from-font;

      background-image: url('data:image/svg+xml, %3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%0A%20%20%3Cpath%20d%3D%22M20.0306%209.53062L12.5306%2017.0306C12.4609%2017.1003%2012.3782%2017.1557%2012.2871%2017.1934C12.1961%2017.2312%2012.0985%2017.2506%2011.9999%2017.2506C11.9014%2017.2506%2011.8038%2017.2312%2011.7127%2017.1934C11.6217%2017.1557%2011.539%2017.1003%2011.4693%2017.0306L3.9693%209.53062C3.82857%209.38988%203.74951%209.19901%203.74951%208.99999C3.74951%208.80097%203.82857%208.61009%203.9693%208.46936C4.11003%208.32863%204.30091%208.24957%204.49993%208.24957C4.69895%208.24957%204.88982%208.32863%205.03055%208.46936L11.9999%2015.4397L18.9693%208.46936C19.039%208.39968%2019.1217%208.34441%2019.2128%208.30669C19.3038%208.26898%2019.4014%208.24957%2019.4999%208.24957C19.5985%208.24957%2019.6961%208.26898%2019.7871%208.30669C19.8781%208.34441%2019.9609%208.39968%2020.0306%208.46936C20.1002%208.53905%2020.1555%208.62177%2020.1932%208.71282C20.2309%208.80386%2020.2503%208.90144%2020.2503%208.99999C20.2503%209.09854%2020.2309%209.19612%2020.1932%209.28716C20.1555%209.37821%2020.1002%209.46093%2020.0306%209.53062Z%22%20fill%3D%22%231871BD%22%2F%3E%0A%3C%2Fsvg%3E');

      background-repeat: no-repeat;
      padding-right: calc(0.5em + 0.75rem);
      background-position: center right;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  }
`;
