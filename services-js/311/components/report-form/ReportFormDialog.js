// @flow

import React from 'react';
import { css } from 'glamor';

import FormDialog from '../common/FormDialog';
import MetadataFields from './MetadataFields';

import type { Service, SubmittedRequest } from '../../data/types';
import type { LoopbackGraphql } from '../../data/graphql/loopback-graphql';
import type { State as Request } from '../../data/store/request';

import SubmitRequestGraphql from '../../data/graphql/SubmitRequest.graphql';
import type { SubmitRequestMutationVariables, SubmitRequestMutation } from '../../data/graphql/schema.flow';

export type ExternalProps = {
  service: ?Service,
  loopbackGraphql: LoopbackGraphql,
}

export type ValueProps = {
  request: Request,
}

export type ActionProps = {
  onShowService: (Service) => void,
  onFirstNameChange: (SyntheticInputEvent) => void,
  onLastNameChange: (SyntheticInputEvent) => void,
  onEmailChange: (SyntheticInputEvent) => void,
  onPhoneChange: (SyntheticInputEvent) => void,
  onAttributeChange: (string, string | string[]) => void,
}

export type Props = ExternalProps & ValueProps & ActionProps;

const DESCRIPTION_STYLE = css({
  fontFamily: '"Lora", Georgia, serif',
  fontSize: 28,
  fontStyle: 'italic',
  lineHeight: 1.7,
});

const ADDRESS_STYLE = css({
  textTransform: 'uppercase',
  whiteSpace: 'pre-line',
  margin: '30px 0 0',
  fontSize: 16,
  fontWeight: 'bold',
});

const ERROR_STYLE = css({
  backgroundColor: 'red',
  padding: 30,
  borderRadius: 15,
});

const CONTACT_HEADER_STYLE = css({
  fontSize: 30,
  textTransform: 'uppercase',
  marginTop: 20,
});

const CONTACT_SUBHEADER_STYLE = css({
  fontFamily: '"Lora", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 22,
  marginBottom: 20,
});

const CONTACT_LABEL_STYLE = css({
  display: 'block',
  marginBottom: 15,
  '& > span': {
    display: 'block',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 2,
  },
});

const TEXT_INPUT_STYLE = css({
  border: '3px solid black',
  padding: 20,
  display: 'block',
  fontFamily: '"Lora", Georgia, serif',
  fontStyle: 'italic',
  fontSize: 18,
  width: '100%',
});

export default class ReportFormDialog extends React.Component {
  props: Props;

  state: {
    submitting: boolean,
    error: ?Object,
    submittedRequest: ?SubmittedRequest,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      submitting: false,
      error: null,
      submittedRequest: null,
    };
  }

  componentWillMount() {
    if (this.props.service) {
      this.props.onShowService(this.props.service);
    }
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.service !== this.props.service && newProps.service) {
      this.props.onShowService(newProps.service);
    }
  }

  whenSubmitClicked = async () => {
    if (!this.props.service) {
      return;
    }

    const { code } = this.props.service;
    const { description, firstName, lastName, email, phone, location, address, attributes } = this.props.request;

    const attributesArray = [];
    Object.keys(attributes).forEach((c) => {
      const value = attributes[c];
      if (Array.isArray(value)) {
        value.forEach((v) => attributesArray.push({ code: c, value: v }));
      } else {
        attributesArray.push({ code: c, value });
      }
    });


    const vars: SubmitRequestMutationVariables = {
      code,
      description,
      firstName,
      lastName,
      email,
      phone,
      location,
      address,
      attributes: attributesArray,
    };

    this.setState({ submitting: true });
    try {
      const response: SubmitRequestMutation = await this.props.loopbackGraphql(SubmitRequestGraphql, vars);

      window.scrollTo(0, 0);

      this.setState({
        submittedRequest: response.createRequest,
        submitting: false,
      });
    } catch (e) {
      this.setState({
        error: e,
        submitting: false,
      });
    }
  };

  render() {
    const {
      service,
      request,
      onAttributeChange,
    } = this.props;

    const {
      submitting,
      error,
      submittedRequest,
    } = this.state;

    if (!service) {
      return <FormDialog title="Service not found" />;
    }

    if (submittedRequest) {
      return this.renderSubmittedRequest(submittedRequest);
    }

    const allowSubmit = !submitting && request.lastName && request.firstName && request.email;

    return (
      <FormDialog title={(service.name)}>
        { this.renderDescription(request) }
        { this.renderLocation(request) }

        <MetadataFields service={service} attributeChanged={onAttributeChange} attributes={request.attributes} />

        { this.renderContactFields() }

        { error && this.renderError(error) }

        <button onClick={this.whenSubmitClicked} disabled={!allowSubmit}>Submit</button>
      </FormDialog>
    );
  }

  renderDescription({ description }: Request) {
    if (description.length) {
      return <div className={DESCRIPTION_STYLE}>“{description}”</div>;
    } else {
      return null;
    }
  }

  renderLocation({ address }: Request) {
    return <div className={ADDRESS_STYLE}>{address}</div>;
  }

  renderContactFields() {
    const {
      request: { firstName, lastName, email, phone },
      onFirstNameChange,
      onLastNameChange,
      onEmailChange,
      onPhoneChange,
    } = this.props;

    return (
      <div>
        <h2 className={CONTACT_HEADER_STYLE}>CONTACT FORM</h2>
        <div className={CONTACT_SUBHEADER_STYLE}>(will not be shared with public; leave blank to submit anonymously)</div>

        <label className={CONTACT_LABEL_STYLE}>
          <span>First Name (required)</span>
          <input className={TEXT_INPUT_STYLE} placeholder="First Name" name="firstName" value={firstName} onChange={onFirstNameChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Last Name (required)</span>
          <input className={TEXT_INPUT_STYLE} placeholder="Last Name" name="lastName" value={lastName} onChange={onLastNameChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Email (required)</span>
          <input className={TEXT_INPUT_STYLE} type="email" placeholder="Email" name="email" value={email} onChange={onEmailChange} />
        </label>

        <label className={CONTACT_LABEL_STYLE}>
          <span>Phone</span>
          <input className={TEXT_INPUT_STYLE} type="tel" placeholder="Phone" name="phone" value={phone} onChange={onPhoneChange} />
        </label>
      </div>
    );
  }

  renderError(error: Object) {
    return (
      <div className={ERROR_STYLE}>
        { error.errors.map((e, i) => <p key={i}>{e.message}</p>) }
      </div>
    );
  }

  renderSubmittedRequest({ id, status, requestedAt }: SubmittedRequest) {
    return (
      <FormDialog title="Success!">
        <dl>
          <dt>Case #:</dt>
          <dd>{ id }</dd>
          <dt>Status:</dt>
          <dd>{ status }</dd>
          <dt>Submitted At</dt>
          <dd>{ new Date(requestedAt * 1000).toLocaleDateString() }</dd>
        </dl>
      </FormDialog>
    );
  }
}
