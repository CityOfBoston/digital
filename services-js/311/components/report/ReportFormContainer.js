// @flow

import React from 'react';
import { css } from 'glamor';
import { connect } from 'react-redux';

import type { Dispatch, State } from '../../store';
import { setRequestServiceCode, setRequestDescription } from '../../store/modules/request';
import { navigate } from '../../store/modules/route';
import { loadServiceMetadata } from '../../store/modules/services';
import type { Service } from '../../store/modules/services';

import ReportBox from './ReportBox';
import ServiceList from './ServiceList';

export type ValueProps = {
  request: $PropertyType<State, 'request'>,
  services: ?Service[],
  servicesError: ?Object,
};

export type ActionProps = {
  descriptionInputChanged: (SyntheticInputEvent) => void,
  dispatchServiceCode: (string) => void,
};

const STYLE = {
  form: css({
    display: 'flex',
  }),
};

const setCodeAndContinue = (code) => () => async (dispatch) => {
  await dispatch(setRequestServiceCode(code));
  await dispatch(loadServiceMetadata(code));
  await dispatch(navigate(
    '/report',
    { step: 'contact' },
    '/report/contact',
  ));
};

class ReportFormContainer extends React.Component {
  props: ValueProps & ActionProps;

  onCodeChosen = (code) => {
    this.props.dispatchServiceCode(code);
  }

  render() {
    const { request, services, servicesError, descriptionInputChanged } = this.props;

    const actions = [
      setRequestServiceCode('code'),
      setRequestDescription('description'),
    ];

    return (
      <form className={STYLE.form} action="/report/submit" method="POST">
        <input type="hidden" name="initialState" value={JSON.stringify({ request })} />
        <input type="hidden" name="actions" value={JSON.stringify(actions)} />

        <ReportBox text={request.description} onInput={descriptionInputChanged} />
        <ServiceList services={services} servicesError={servicesError} onCodeChosen={this.onCodeChosen} />
      </form>
    );
  }
}

const mapStateToProps = ({ request, services }: State): ValueProps => ({
  request,
  services: services.services,
  servicesError: services.servicesError,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  descriptionInputChanged: (ev) => dispatch(setRequestDescription(ev.target.value)),
  dispatchServiceCode: (code) => dispatch(setCodeAndContinue(code)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportFormContainer);
