import EmailContent from './EmailContent';

describe('Renders email body', () => {
  const emailContent = new EmailContent();
  const applicationData = {
    commissionNames: ['Board 1', 'Board 3', 'Board 5'],
    firstName: 'Anna',
    lastName: 'Applicant',
    email: 'x@y.com',
    applicationId: '23',
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

  test('policy office HTML', () => {
    expect(policyOfficeEmailBodies.html).toMatchSnapshot();
  });

  test('policy office text', () => {
    expect(policyOfficeEmailBodies.text).toMatchSnapshot();
  });
});
