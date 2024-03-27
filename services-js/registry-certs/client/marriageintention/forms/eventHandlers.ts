import { ChangeEvent } from 'react';
import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

export const handleChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, certObj } = data;
  certObj.answerQuestion(
    {
      [e.target.name]: e.target.value,
    },
    ''
  );
};

export const handleUseSurnameChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  inputName: string;
  textInput: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, inputName, textInput, certObj } = data;
  certObj.answerQuestion(
    {
      [inputName]: e.target.value,
    },
    ''
  );

  if (e.target.value === '0') {
    certObj.answerQuestion(
      {
        [textInput]: '',
      },
      ''
    );
  }
};

export const handleAdditionalParentChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  additionalParent: string;
  parentB_Name: string;
  parentB_Surname: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, additionalParent, parentB_Name, parentB_Surname, certObj } = data;
  certObj.answerQuestion(
    {
      [additionalParent]: e.target.value,
    },
    ''
  );

  if (e.target.value === '0') {
    certObj.answerQuestion(
      {
        [parentB_Surname]: '',
        [parentB_Name]: '',
      },
      ''
    );
  }
};

export const handleBloodRelDescChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerA: string;
  partnerB: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerA, partnerB, certObj } = data;

  certObj.answerQuestion(
    {
      [partnerA]: e.target.value,
      [partnerB]: e.target.value,
    },
    ''
  );
};

export const handleBloodRelChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerA: string;
  partnerB: string;
  partnerADesc: string;
  partnerBDesc: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerA, partnerB, partnerADesc, partnerBDesc, certObj } = data;

  certObj.answerQuestion(
    {
      [partnerA]: e.target.value,
      [partnerB]: e.target.value,
    },
    ''
  );

  if (e.target.value === '0') {
    certObj.answerQuestion(
      {
        [partnerADesc]: '',
        [partnerBDesc]: '',
      },
      ''
    );
  }
};

export default handleChange$;
