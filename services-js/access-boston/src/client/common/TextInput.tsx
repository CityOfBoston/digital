/** @jsx jsx */
import { jsx } from '@emotion/core';
import { InputHTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import hash from 'string-hash';
import { css } from '@emotion/core';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | boolean;
  info?: ReactNode;
  requiredlabelasterisk?: boolean | null;
  /**
   * This function can be used to customize how the input element and error
   * message are rendered. For example, putting the error message next to the
   * input element or adding in a submit button in the same row.
   *
   * This is done inside of TextInput because we often want vertical centering
   * relative directly to the input element, rather than including the label or
   * info.
   *
   * If you chose to render the error from this function you should set the
   * hideErrorMessage prop, otherwise the component will render it as well.
   */
  renderInputFunc?: (arg: {
    inputEl: ReactNode;
    errorEl: ReactNode;
  }) => ReactNode;
  hideErrorMessage?: boolean;

  id?: string;
  type?: string;
  showPassword?: boolean;
  showPassFun?: any;
}

/**
 * Stateless component for rendering a text-like form element. (Type of "text",
 * "tel", "password", &c.)
 *
 * Automatically generates an id for the element if one is not provided. Also
 * automatically adds the "txt-f" class to the element, and the "txt-f--err"
 * class if there's an error.
 *
 * All props besides "label" and "error" are passed along as props for the
 * <input> element.
 *
 * TODO(finh): Merge this with the react-fleet TextInput.
 */
export default function TextInput(props: Props) {
  const {
    error,
    required,
    label,
    info,
    hideErrorMessage,
    requiredlabelasterisk,
    showPassword,
    showPassFun,
  } = props;
  const id = props.id || `input-${hash(label)}`;

  const inputProps = Object.assign({ id, type: 'text' }, props, {
    className: `${props.className || ''} txt-f ${error ? 'txt-f--err' : ''}`,
  });

  const renderInputFunc = props.renderInputFunc || (({ inputEl }) => inputEl);

  // These aren't used for <input> elements
  delete inputProps.error;
  delete inputProps.label;
  delete inputProps.info;
  delete inputProps.hideErrorMessage;
  delete inputProps.renderInputFunc;
  delete inputProps.requiredlabelasterisk;
  delete inputProps.showPassword;
  delete inputProps.showPassFun;

  const showPassRef = useRef(null);

  useEffect(() => {
    const elem: any = showPassRef.current;
    const preventDefault = event => event.preventDefault();

    if (elem) {
      // Prevent Default
      elem.addEventListener('click', preventDefault);

      // SHOWPASSWORD EVENTs
      elem.addEventListener('mousedown', showPassFun);
      elem.addEventListener('mouseup', showPassFun);
      elem.addEventListener('touchstart', showPassFun);
      elem.addEventListener('touchend', showPassFun);
    }

    return () => {
      if (elem) {
        elem.removeEventListener('click', preventDefault);
        elem.removeEventListener('mousedown', showPassFun);
        elem.removeEventListener('mouseup', showPassFun);
        elem.removeEventListener('touchstart', showPassFun);
        elem.removeEventListener('touchend', showPassFun);
      }
    };
  }, []);

  const showPassEl = (
    <button css={SHOWPASS_BUTTON} ref={showPassRef}>
      Show
    </button>
  );
  const inputEl = <input {...inputProps} css={INPUT_ELEM} />;
  const errorEl = (
    <div className="t--info t--err m-v100">
      {/* The &nbsp; is to keep space for the error so the form doesn't jump when one is added. */}
      {error && typeof error === 'string' ? error : <>&nbsp;</>}
    </div>
  );

  return (
    <div className="txt" style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex' }}>
        <label htmlFor={id} className="txt-l" style={{ marginTop: 0 }}>
          {label}

          {required && (
            <span className="t--req" aria-hidden="true">
              {' '}
              Required
              {requiredlabelasterisk && requiredlabelasterisk === true && '*'}
            </span>
          )}
        </label>
      </div>

      <div style={{ display: 'flex' }}>
        {renderInputFunc({ inputEl, errorEl })}

        {showPassword && showPassFun && showPassEl}
      </div>

      {info && <div className="t--subinfo m-t100">{info}</div>}

      {!hideErrorMessage && errorEl}
    </div>
  );
}

export const renderErrorNextToInput = ({ inputEl, errorEl }) => (
  <>
    <div className="g">
      <div className="g--6">{inputEl}</div>
      <div className={`g--6 ${ERROR_NEXT_TO_INPUT_CELL_STYLE}`}>{errorEl}</div>
    </div>
  </>
);

const ERROR_NEXT_TO_INPUT_CELL_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});

const INPUT_ELEM = css({
  width: '80%',
});

const SHOWPASS_BUTTON = css({
  marginLeft: 0,
  height: 'calc(3.5rem + 1px * 1)',
  background: 'none',
  borderWidth: '3px',
  borderLeft: '0',
  borderColor: '#091f2f',
  borderTopColor: '#091f2f',
  color: '#091f2f',
  fontFamily: 'Montserrat, Arial, sans-serif',
  fontSize: 'calc(14px + 2 * ((100vw - 480px) / 960))',
  fontWeight: 'bold',
  textTransform: 'uppercase',

  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});
