import React from 'react';
import { FormikProps } from 'formik';
import * as yup from 'yup';

import { SectionHeader, RadioGroup } from '@cityofboston/react-fleet';

import { MAIN_CLASS } from '../styles';
import TextInput, { renderErrorNextToInput } from '../TextInput';
import { testNotCityEmailAddress } from '../../lib/validation';

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
  phoneOrEmail: string;
  smsOrVoice: string;
  email: string;
  phoneNumber: string;
}

export const validationSchema = yup.object<FormValues>().shape({
  phoneOrEmail: yup.string().oneOf(['phone', 'email']),
  smsOrVoice: yup.string().oneOf(['sms', 'voice']),
  phoneNumber: yup.string().when('phoneOrEmail', {
    is: 'phone',
    then: yup.string().required('Please put in your phone number.'),
  }),
  email: yup.string().when('phoneOrEmail', {
    is: 'email',
    then: yup
      .string()
      .required('Please put in an email address.')
      .email('This doesn’t look like an email address.')
      .test(
        'not-cob',
        'Please use a personal email, not a work email.',
        testNotCityEmailAddress
      ),
  }),
});

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
      <div className={MAIN_CLASS}>
        <div className="b b-c b-c--hsm">
          <SectionHeader title="Set up MFA/mobile device" />

          <div className="t--intro m-v300">
            You will need to register a mobile device to protect your Access
            Boston account.
          </div>

          <div className="m-v300 lh--400 t--s400">
            Access Boston will send you a code whenever you log in on a new
            computer. You’ll also need a code to reset your password if you
            forget it.
          </div>

          <hr className="hr hr--sq" />

          <form
            action=""
            method="POST"
            className="m-v500"
            onSubmit={handleSubmit}
          >
            <div className="m-b500">
              <RadioGroup
                groupLabel="Where do you want to get your security codes?"
                name="phoneOrEmail"
                checkedValue={phoneOrEmail}
                handleItemChange={handleChange}
                handleItemBlur={handleBlur}
                items={[
                  {
                    label: (
                      <span className="ra-l">
                        Phone — <i>recommended</i>
                      </span>
                    ),
                    value: 'phone',
                  },
                  { label: 'Email', value: 'email' },
                ]}
              />
            </div>
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
                  info="You should use your cell phone number if you have one."
                  renderInputFunc={renderErrorNextToInput}
                  hideErrorMessage
                />

                <RadioGroup
                  groupLabel="How should we send the codes?"
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
              </>
            )}

            {serverError && (
              <div className="m-v500 t--intro t--err">{serverError}</div>
            )}

            <div className="m-v500">
              <button
                type="submit"
                className="btn"
                disabled={!(process as any).browser || !isValid || isSubmitting}
              >
                {phoneOrEmail === 'phone'
                  ? 'Register Phone Number'
                  : 'Register Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
