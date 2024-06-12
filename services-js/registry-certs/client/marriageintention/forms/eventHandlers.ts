import { ChangeEvent } from 'react';
import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import { BOSTON_NEIGHBORHOODS } from './inputData';

export const handleFormPageComplete$ = (data: {
  partnerFlag: string;
  val: string;
  certObj: MarriageIntentionCertificateRequest;
}): void => {
  data.certObj.answerQuestion(
    {
      [`partner${data.partnerFlag}_formPageComplete`]: data.val,
    },
    ''
  );
};

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
  val: string;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { val, partnerFlag, certObj } = data;
  certObj.answerQuestion(
    {
      [`partner${partnerFlag}_useSurname`]: val,
    },
    ''
  );

  if (val === '0') {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_surName`]: '',
      },
      ''
    );
  }
};

export const handleAdditionalParentChange$ = (data: {
  val: string;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { val, partnerFlag, certObj } = data;
  certObj.answerQuestion(
    {
      [`partner${partnerFlag}_additionalParent`]: val,
    },
    ''
  );

  if (val === '0') {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_parentB_Name`]: '',
        [`partner${partnerFlag}_parentB_Surname`]: '',
      },
      ''
    );
  }
};

export const handleBloodRelDescChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, certObj } = data;

  certObj.answerQuestion(
    {
      [`partnerA_bloodRelationDesc`]: e.target.value,
      [`partnerB_bloodRelationDesc`]: e.target.value,
    },
    ''
  );
};

export const handleBloodRelChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, certObj } = data;

  certObj.answerQuestion(
    {
      [`partnerA_bloodRelation`]: e.target.value,
      [`partnerB_bloodRelation`]: e.target.value,
    },
    ''
  );

  if (e.target.value === '0') {
    certObj.answerQuestion(
      {
        [`partnerA_bloodRelationDesc`]: '',
        [`partnerB_bloodRelationDesc`]: '',
      },
      ''
    );
  }
};

export const handleMarriedBeforeChange$ = (data: {
  val: string;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { val, partnerFlag, certObj } = data;
  certObj.answerQuestion(
    {
      [`partner${partnerFlag}_marriedBefore`]: val,
    },
    ''
  );

  if (val === '0') {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_marriageNumb`]: '',
      },
      ''
    );
  }
};

export const handleBirthplaceCountryChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerFlag, certObj } = data;
  certObj.answerQuestion(
    {
      [e.target.name]: e.target.value,
    },
    ''
  );

  if (e.target.value !== 'USA') {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_birthState`]: '',
      },
      ''
    );
  }
};

export const handleZipCodeChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, certObj } = data;

  const val = e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');

  certObj.answerQuestion(
    {
      [e.target.name]: val,
    },
    ''
  );
};

export const handleResidenceStateChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerFlag: string;
  requestInformation: any;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerFlag, requestInformation, certObj } = data;
  const {
    [`partner${partnerFlag}_residenceCity`]: residenceCity,
    [`partner${partnerFlag}_residenceCountry`]: residenceCountry,
  } = requestInformation;

  const inlowerCase = residenceCity.toLowerCase();
  const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

  certObj.answerQuestion(
    {
      [e.target.name]: e.target.value,
    },
    ''
  );

  if (
    residenceCountry === 'USA' &&
    e.target.value === 'MA' &&
    isBosNeighborhood > -1
  ) {
    replaceBosNeighborhoods$({
      e: {
        target: {
          name: `partner${partnerFlag}_residenceCity`,
          value: residenceCity,
        },
      },
      partnerFlag: '',
      requestInformation,
      certObj,
    });
  }
};

export const replaceBosNeighborhoods$ = (data: {
  e:
    | ChangeEvent<HTMLInputElement>
    | {
        target: { name: string; value: string };
      };
  partnerFlag: string;
  requestInformation: any;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerFlag, requestInformation, certObj } = data;
  const {
    [`partner${partnerFlag}_residenceCity`]: residenceCity,
    [`partner${partnerFlag}_residenceState`]: residenceState,
  } = requestInformation;

  const inlowerCase = e.target.value.toLowerCase();
  const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

  if (
    residenceCity === 'USA' &&
    residenceState === 'MA' &&
    isBosNeighborhood > -1
  ) {
    certObj.answerQuestion(
      {
        [e.target.name]: 'Boston',
      },
      ''
    );
  }
};

export const checkBirthCityForNeighborhood$ = (data: {
  partnerFlag: string;
  requestInformation: any;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { partnerFlag, requestInformation, certObj } = data;
  const {
    [`partner${partnerFlag}_birthCountry`]: birthCountry,
    [`partner${partnerFlag}_birthCity`]: birthCity,
    [`partner${partnerFlag}_birthState`]: birthState,
  } = requestInformation;

  const inlowerCase = birthCity.toLowerCase();
  const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

  if (
    birthCountry === 'USA' &&
    (birthState === 'MA' || birthState === 'Massachusetts') &&
    isBosNeighborhood > -1
  ) {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_birthCity`]: 'Boston',
      },
      ''
    );
  }
};

export const handleResidenceCountryChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerFlag, certObj } = data;

  certObj.answerQuestion(
    {
      [e.target.name]: e.target.value,
    },
    ''
  );

  if (e.target.value !== 'USA') {
    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_residenceState`]: '',
      },
      ''
    );

    certObj.answerQuestion(
      {
        [`partner${partnerFlag}_residenceZip`]: '',
      },
      ''
    );
  }
};

export const handleBirthDateChange$ = (data: {
  val: Date;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { val, partnerFlag, certObj } = data;
  const isDate = isDateObj$(val);
  let age: string = '';

  if (isDate) {
    age = `${calcAge$(val)}`;
    updateAge$({ val: age, partnerFlag, certObj });
  }

  certObj.answerQuestion(
    {
      [`partner${partnerFlag}_dob`]: val,
    },
    ''
  );
};

export const updateAge$ = (data: {
  val: string;
  partnerFlag: string;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { val, partnerFlag, certObj } = data;

  certObj.answerQuestion(
    {
      [`partner${partnerFlag}_age`]: val,
    },
    ''
  );
};

export const calcAge$ = (dateObj: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const m = today.getMonth() - dateObj.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
    age = age - 1;
  }

  return age;
};

export const isDateObj$ = (dateObj: Date | null) => {
  if (Object.prototype.toString.call(dateObj) === '[object Date]') {
    return true;
  }
  return false;
};

export default handleChange$;
