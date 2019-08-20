import React from 'react';
import { FormikProps } from 'formik';
import Link from 'next/link';

import { SectionHeader, RadioGroup } from '@cityofboston/react-fleet';

import TextInput, { renderErrorNextToInput } from '../common/TextInput';

// Pull of only the FormikProps we actually use. This keeps us from needing to
// pass fake versions of everything in our Storybook stories.
type Props = Pick<
  FormikProps<FormValues>,
  | 'values'
  | 'errors'
  | 'touched'
  | 'handleSubmit'
  | 'handleChange'
  | 'handleBlur'
  | 'isValid'
  | 'isSubmitting'
> &
  AdditionalProps;

interface AdditionalProps {
  serverError: string | null;
}

export interface FormValues {
  // Even though this value is only changed by the query parameter to the mfa
  // page, and not through a form field, we keep it in Formik so that it can be
  // referenced by the validation rules.
  phoneOrEmail: 'phone' | 'email';
  smsOrVoice: string;
  email: string;
  phoneNumber: string;
}

/**
 * Formik form component to render the UI for adding a phone or email address as
 * an MFA device.
 *
 * Factored out of mfa.tsx page so that it’s easier to test all of its states by
 * passing in props.
 */
export default function DeviceVerificationForm(props: Props) {
  const {
    values: { phoneOrEmail, smsOrVoice, email, phoneNumber },
    errors,
    touched,
    handleSubmit,
    handleChange,
    handleBlur,
    isValid,
    isSubmitting,
    serverError,
  } = props;

  return (
    <>
      <div className="b b-c b-c--hsm">
        <SectionHeader title="Set up security codes" />

        <p className="lh--400 t--s400">
          Access Boston will send you a security code when you log in on a new
          computer, tablet, or phone. You’ll also need a code to reset your
          password if you forget it.
        </p>

        <p className="lh--400 t--s400">
          This is called multi-factor authentication. It keeps your account
          secure even if someone steals your password.
        </p>

        <p className="lh--400 t--s400">
          Use your cell phone number if you have one. This is the most secure
          option. If you don’t have a phone, you can use a personal email
          address instead.
        </p>

        <hr className="hr hr--sq" aria-hidden />

        <form className="m-v500" onSubmit={handleSubmit}>
          {phoneOrEmail === 'phone' && (
            <>
              <TextInput
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                placeholder="(XXX) XXX-XXXX"
                onChange={handleChange}
                onBlur={handleBlur}
                value={phoneNumber}
                error={touched.phoneNumber && (errors.phoneNumber as any)}
                required
                info={
                  <>
                    You should use your cell phone number if you have one.
                    <br />
                    Note: normal cell phone charges will apply.
                  </>
                }
                renderInputFunc={renderErrorNextToInput}
                hideErrorMessage
              />

              <RadioGroup
                groupLabel="How should we send security codes?"
                name="smsOrVoice"
                checkedValue={smsOrVoice}
                handleItemChange={handleChange}
                handleItemBlur={handleBlur}
                items={[
                  {
                    label: (
                      <span className="ra-l">
                        Text message — <i>recommended</i>
                      </span>
                    ),
                    value: 'sms',
                  },
                  {
                    label: 'Phone call',
                    value: 'voice',
                  },
                ]}
              />
            </>
          )}

          {phoneOrEmail === 'email' && (
            <>
              <TextInput
                label="Email address"
                type="email"
                name="email"
                placeholder="you@example.com"
                error={touched.email && (errors.email as any)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={email}
                required
                info="Choose a personal address, not a City of Boston one."
                renderInputFunc={renderErrorNextToInput}
                hideErrorMessage
              />

              <div className="t--subinfo m-v500">
                Switch to{' '}
                <Link href="/mfa">
                  <a>get codes via phone call or text</a>
                </Link>
              </div>
            </>
          )}

          {serverError && (
            <div className="m-v500 t--intro t--err">{serverError}</div>
          )}

          <div className="m-v500 ta-r">
            <button
              type="submit"
              className="btn"
              disabled={!(process as any).browser || !isValid || isSubmitting}
            >
              Next Step
            </button>
          </div>

          {phoneOrEmail === 'phone' && (
            <div className="t--subinfo m-v500">
              Don’t have access to a phone?
              <br />
              <Link href="/mfa?email=1">
                <a>Get codes via personal email</a>
              </Link>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
