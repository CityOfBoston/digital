import React from 'react';
import CrumbContext from '../client/CrumbContext';

interface Props {
  path: string;
}

/**
 * Makes a form that can be used to redirect to a page with a CSRF-protected
 * POST.
 *
 * Save off a ref to this, and call "redirect" when you’re ready to go.
 *
 * You can also provide children that will be rendered in the form. This is
 * useful for putting in a submit button.
 */
export default class RedirectForm extends React.Component<Props> {
  private readonly formRef = React.createRef<HTMLFormElement>();

  redirect() {
    const form = this.formRef.current;
    if (form) {
      form.submit();
    }
  }

  render() {
    const { path, children } = this.props;

    return (
      <CrumbContext.Consumer>
        {crumb => (
          <form action={path} method="POST" ref={this.formRef}>
            <input name="crumb" type="hidden" value={crumb} />
            {children}
          </form>
        )}
      </CrumbContext.Consumer>
    );
  }
}
