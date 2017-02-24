// @flow

import React from 'react';
import { css } from 'glamor';
import { connect } from 'react-redux';

import type { Dispatch, State } from '../../data/store';
import { setRequestDescription } from '../../data/store/request';
import type { ServiceSummary } from '../../data/types';

import FormDialog from '../common/FormDialog';
import DescriptionBox from './DescriptionBox';
import ServiceList from './ServiceList';

type ExternalProps = {
  serviceSummaries: ServiceSummary[],
  showServiceForm: (code: string) => void,
}

type ValueProps = {
  request: $PropertyType<State, 'request'>,
};

type ActionProps = {
  descriptionInputChanged: (SyntheticInputEvent) => void,
};

export type Props = ExternalProps & ValueProps & ActionProps;

const FORM_STYLE = css({
  display: 'flex',
  alignItems: 'flex-start',
});

function ReportFormDialog({ request, serviceSummaries, descriptionInputChanged, showServiceForm }: Props) {
  return (
    <FormDialog title="311: Boston City Services">
      <div className={FORM_STYLE}>
        <DescriptionBox text={request.description} onInput={descriptionInputChanged} />
        <ServiceList serviceSummaries={serviceSummaries} onCodeChosen={showServiceForm} />
      </div>
    </FormDialog>
  );
}

const mapStateToProps = ({ request }: State): ValueProps => ({
  request,
});

const mapDispatchToProps = (dispatch: Dispatch): ActionProps => ({
  descriptionInputChanged: (ev) => { dispatch(setRequestDescription(ev.target.value)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportFormDialog);
