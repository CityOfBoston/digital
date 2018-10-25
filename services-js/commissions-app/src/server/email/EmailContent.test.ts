import dotenv from 'dotenv';

import EmailContent from './EmailContent';

dotenv.config();

describe('Renders email body', () => {
  // @ts-ignore
  const emailContent = new EmailContent(process.env.COMMISSIONS_URI);
  const applicationData = {
    commissionNames: [
      'Animal Control Commission',
      'Boston Redevelopment Authority (BRA)/Economic Development Industrial Corp (EDIC)',
      'Neighborhood Jobs Trust',
    ],
    firstName: 'Anna',
    lastName: 'Applicant',
    email: 'x@y.com',
    applicationId: '23',
  };

  const singleBoardApplicationData = {
    ...applicationData,
    commissionNames: ['Zoning Commission'],
  };

  const applicantEmailBodies = emailContent.renderApplicantBodies(
    applicationData
  );
  const policyOfficeEmailBodies = emailContent.renderPolicyOfficeBodies(
    applicationData
  );

  test('applicant HTML', () => {
    expect(applicantEmailBodies.html).toMatchSnapshot();
  });

  test('applicant text', () => {
    expect(applicantEmailBodies.text).toMatchSnapshot();
  });

  test('applicant HTML, single board', () => {
    expect(
      emailContent.renderApplicantBodies(singleBoardApplicationData).html
    ).toMatchSnapshot();
  });

  test('policy office HTML', () => {
    expect(policyOfficeEmailBodies.html).toMatchSnapshot();
  });

  test('policy office text', () => {
    expect(policyOfficeEmailBodies.text).toMatchSnapshot();
  });
});
