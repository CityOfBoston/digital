// @flow

import React from 'react';
import { css } from 'glamor';
import { connect } from 'react-redux';

import type { Dispatch, State } from '../../data/store';
import { setRequestServiceCode, setRequestDescription } from '../../data/store/request';
import { navigate } from '../../data/store/route';
import type { ServiceSummary } from '../../data/types';

import ReportBox from './ReportBox';
import ServiceList from './ServiceList';

export type ExternalProps = {
  serviceSummaries: ServiceSummary[],
}

export type ValueProps = {
  request: $PropertyType<State, 'request'>,
};

export type ActionProps = {
  descriptionInputChanged: (SyntheticInputEvent) => void,
  dispatchServiceCode: (string) => void,
};

const STYLE = {
  form: css({
    display: 'flex',
    alignItems: 'flex-start',
  }),
};

const setCodeAndContinue = (code) => () => async (dispatch) => {
  await dispatch(setRequestServiceCode(code));
  await dispatch(navigate(
    '/report',
    { step: 'contact' },
    '/report/contact',
  ));
};

class ReportFormContainer extends React.Component {
  props: ExternalProps & ValueProps & ActionProps;

  onCodeChosen = (code) => {
    this.props.dispatchServiceCode(code);
  }

  render() {
    const { request, serviceSummaries, descriptionInputChanged } = this.props;

    return (
      <div className={STYLE.form}>
        <ReportBox text={request.description} onInput={descriptionInputChanged} />
        <ServiceList serviceSummaries={serviceSummaries} onCodeChosen={this.onCodeChosen} />
      </div>
    );
  }
}

const mapStateToProps = ({ request }: State): ValueProps => ({
  request,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  descriptionInputChanged: (ev) => dispatch(setRequestDescription(ev.target.value)),
  dispatchServiceCode: (code) => dispatch(setCodeAndContinue(code)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportFormContainer);
