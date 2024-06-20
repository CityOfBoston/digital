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

/****
 * @name handleParentNameChange$
 * @description Update Session Data with field data for Parents, cropping last name from first field if last name matches Surname
 * @case1 If Surname is entered before Name (FML), check FML value; if `Last` matches Surname then update remove the `Last` (L) from (FML) before updating Session Data
 * @case2 If `First Middle Last` (FML) Name is entered before Surname, if `Last` from (FML) matches `Surname` remove the `Last`|(L) from (FML) in Name field
 */
export const handleParentNameChange$ = (data: {
  e: ChangeEvent<HTMLInputElement>;
  partnerFlag: string;
  parentFlag?: 'A' | 'B';
  requestInformation: any;
  certObj: MarriageIntentionCertificateRequest;
}) => {
  const { e, partnerFlag, requestInformation, certObj } = data;
  const parentFlag = data.parentFlag ? data.parentFlag : 'A';
  const {
    [`partner${partnerFlag}_parent${parentFlag}_Name`]: parentA_Name,
  } = requestInformation;

  const fieldName = e.target && e.target.name ? e.target.name : '';
  const fieldVal = e.target && e.target.value ? e.target.value : '';

  if (partnerFlag === 'B') {
    console.log(`Partner(${partnerFlag})`);
  }

  if (fieldName === `partner${partnerFlag}_parent${parentFlag}_Name`) {
    // ---------------------------- //
    // @case1 - START //
    const {
      [`partner${partnerFlag}_parent${parentFlag}_Surname`]: parentA_Surname,
    } = requestInformation;
    let case1Val = fieldVal;

    const valArr1 = fieldVal.split(' ');
    if (
      parentA_Surname.length > 0 &&
      valArr1.length > 1 &&
      valArr1[valArr1.length - 1] === parentA_Surname
    ) {
      valArr1.pop();
      case1Val = valArr1.join(' ');
    }

    certObj.answerQuestion(
      {
        [fieldName]: case1Val,
      },
      ''
    );
    // @case1 - END //
    // ---------------------------- //
  } else {
    // ---------------------------- //
    // @case2 - END //
    if (fieldName === `partner${partnerFlag}_parent${parentFlag}_Surname`) {
      if (parentA_Name.split(' ').length > 1) {
        let valArr2 = parentA_Name.split(' ');
        if (valArr2[valArr2.length - 1] === fieldVal) {
          valArr2.pop();
          certObj.answerQuestion(
            {
              [`partner${partnerFlag}_parent${parentFlag}_Name`]: valArr2.join(
                ' '
              ),
              [`partner${partnerFlag}_parent${parentFlag}_Surname`]: fieldVal,
            },
            ''
          );
        } else {
          certObj.answerQuestion(
            {
              [fieldName]: fieldVal,
            },
            ''
          );
        }
      } else {
        certObj.answerQuestion(
          {
            [fieldName]: fieldVal,
          },
          ''
        );
      }
    }
    // @case2 - END //
    // ---------------------------- //
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
