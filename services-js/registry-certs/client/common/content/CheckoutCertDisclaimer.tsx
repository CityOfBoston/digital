export const $CHECKOUT_DISCLAIMER_CONTENT = () => {
  return (
    <>
      <p>
        You can only order copies of one person's birth certificate at a time.
      </p>

      <p>
        <span className="bold">
          Want to order copies of a certificate for another person?
        </span>{' '}
        Please put in a separate request.
      </p>

      <p>
        <span className="bold">
          Do you need a certificate for international use that requires an
          Apostille from the Massachusetts Secretary of State's Office?
        </span>{' '}
        Follow these steps:
      </p>

      <ol>
        <li>
          Request a certified birth certificate from the City of Boston
          Registry. You don’t need extra information or paperwork.
        </li>
        <li>
          Submit the certificate to the{' '}
          <a href="https://www.sec.state.ma.us/divisions/public-records/public-records.htm">
            Massachusetts Secretary of State's Office
          </a>
          .
        </li>
      </ol>
    </>
  );
};
