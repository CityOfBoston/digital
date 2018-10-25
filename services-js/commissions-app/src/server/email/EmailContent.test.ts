import EmailContent from './EmailContent';

const commissionsUri = 'http://zpappweb01/cityclerk/commissions/applications';

describe('Renders email body', () => {
  const emailContent = new EmailContent(commissionsUri);
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

  test('applicant HTML, single board', () => {
    expect(
      emailContent.renderApplicantBodies(singleBoardApplicationData).html
    ).toMatchSnapshot();
  });

  test('applicant text', () => {
    expect(applicantEmailBodies.text).toMatchSnapshot();
  });

  test('policy office HTML', () => {
    expect(policyOfficeEmailBodies.html).toMatchSnapshot();
  });

  test('policy office text', () => {
    expect(policyOfficeEmailBodies.text).toMatchSnapshot();
  });
});
