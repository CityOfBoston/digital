/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { format as formatDate, parse as parseDate } from 'date-fns';
import Autolinker from 'autolinker';

import Head from 'next/head';
import Router from 'next/router';

import {
  AppLayout,
  SectionHeader,
  MEDIA_LARGE,
  MEDIA_MEDIUM,
  MEDIA_XX_LARGE,
  MEDIA_SMALL,
  GRAY_000,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_LIGHT,
  PUBLIC_CSS_URL,
} from '@cityofboston/react-fleet';
import { getParam } from '@cityofboston/next-client-common';

import { PermitKind } from '../client/graphql/queries';
import loadPermit, { Permit, Milestone } from '../client/graphql/load-permit';

import BUILDING_MILESTONE_TRANSLATIONS from '../client/translations/building-milestones.json';
import FIRE_MILESTONE_TRANSLATIONS from '../client/translations/fire-milestones.json';

import { GetInitialProps, RedirectError } from './_app';
import IndexPage from './index';

type Props = {
  permitNumber: string;
  permit: Permit | null;
  currentTimeMs: number;
};

type State = {
  searchPermitNumber: string;
};

type MilestoneStep = {
  /**
   * The displayed "step" for the milestone. Several different "milestoneName"
   * values all map to the same step in the UI.
   */
  displayStatus: string;
  description: string;
  contactInstructions: string;

  milestoneStartDate: Date;
  contactName: string | null;
};

/**
 * Combination of milestones for building and fire permits.
 *
 * In practice, as of 5/24/19, only one of these will be non-null.
 *
 * We have tentative support for multiple milestone objects, which could be nice
 * to show "completed" dates, but some work would need to be done to make it
 * work properly.
 */
type MilestoneRenderInfo = {
  intakePayment: MilestoneStep | null;
  // building only
  projectReview: MilestoneStep | null;
  // building only
  zoningReview: MilestoneStep | null;
  // Fire only
  permitReview: MilestoneStep | null;
  issuance: MilestoneStep | null;
  inspections: MilestoneStep | null;
  // building only
  occupancy: MilestoneStep | null;
  completed: MilestoneStep | null;
};

const BUILDING_MILESTONE_ORDER: Array<keyof MilestoneRenderInfo> = [
  'intakePayment',
  'projectReview',
  'zoningReview',
  'issuance',
  'inspections',
  'occupancy',
  'completed',
];

const FIRE_MILESTONE_ORDER: Array<keyof MilestoneRenderInfo> = [
  'intakePayment',
  'permitReview',
  'issuance',
  'inspections',
  'completed',
];

export default class PermitPage extends React.Component<Props, State> {
  static getInitialProps: GetInitialProps<
    Props,
    'query',
    'fetchGraphql'
  > = async ({ query }, { fetchGraphql }) => {
    const permitNumber = getParam(query.id, '')
      .replace(/[^a-z0-9]/gi, '')
      .toUpperCase();

    if (!permitNumber) {
      throw new RedirectError('/');
    }

    return {
      permitNumber,
      permit: await loadPermit(fetchGraphql, permitNumber),
      currentTimeMs: Date.now(),
    };
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      searchPermitNumber: '',
    };
  }

  private handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    this.setState({ searchPermitNumber: '' });

    Router.push(
      `/permit?id=${encodeURIComponent(this.state.searchPermitNumber)}`
    );
  };

  render() {
    const { permitNumber, permit, currentTimeMs } = this.props;

    // If the permit wasn’t found, we render the main page with an error
    // message.
    if (!permit) {
      return <IndexPage permitNumber={permitNumber} notFound />;
    }

    let renderInfo: MilestoneRenderInfo;
    let latestStep: MilestoneStep | null = null;
    let latestStepIdx = -1;

    switch (permit.kind) {
      case PermitKind.BUILDING:
        renderInfo = generateBuildingMilestoneRenderInfo(permit.milestones);

        BUILDING_MILESTONE_ORDER.forEach((stepName, i) => {
          if (renderInfo[stepName]) {
            latestStepIdx = i;
          }
        });

        latestStep =
          renderInfo[BUILDING_MILESTONE_ORDER[latestStepIdx]] || null;
        break;

      case PermitKind.FIRE:
        renderInfo = generateFireMilestoneRenderInfo(permit.milestones);

        FIRE_MILESTONE_ORDER.forEach((stepName, i) => {
          if (renderInfo[stepName]) {
            latestStepIdx = i;
          }
        });

        latestStep = renderInfo[FIRE_MILESTONE_ORDER[latestStepIdx]] || null;
        break;

      default:
        throw new Error('UNEXPECTED PERMIT KIND: ' + permit.kind);
    }

    return (
      <AppLayout>
        <Head>
          <link rel="stylesheet" href={PUBLIC_CSS_URL} />
          <title>Boston.gov — Permit Finder – {permitNumber}</title>
        </Head>

        <div className="b-c b-c--nbp b-c--ntp">
          <form
            method="get"
            action="/permit"
            className="m-v500"
            onSubmit={this.handleSubmit}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <input
                aria-label="Search box"
                type="text"
                name="id"
                placeholder="Permit number"
                className="txt-f txt-f--sm"
                value={this.state.searchPermitNumber}
                onChange={ev =>
                  this.setState({ searchPermitNumber: ev.currentTarget.value })
                }
                css={{ marginRight: '1rem', width: '11rem' }}
              />

              <button
                className="btn btn--sm btn--100"
                css={{ whiteSpace: 'nowrap' }}
                type="submit"
              >
                Look Up
              </button>
            </div>
          </form>

          <SectionHeader title="Permit Finder" />

          <div className="t--intro">
            {latestStep ? (
              <>
                Permit <strong>{permitNumber}</strong> is in the{' '}
                <strong>{latestStep.displayStatus}</strong> phase as of{' '}
                {formatDate(currentTimeMs, 'M/D/YYYY')}.
              </>
            ) : (
              <>
                No progress data is available for permit{' '}
                <strong>{permitNumber}</strong>.
              </>
            )}
          </div>

          {latestStep && latestStep.description && (
            <p className="t--s500 lh--300">{latestStep.description}</p>
          )}

          <ul
            className="m-b700"
            css={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'stretch',
              marginLeft: '-1rem',
            }}
          >
            {permit.kind === PermitKind.BUILDING &&
              this.renderBuildingPermitSteps(renderInfo, latestStepIdx)}

            {permit.kind === PermitKind.FIRE &&
              this.renderFirePermitSteps(renderInfo, latestStepIdx)}
          </ul>

          <div className="g m-v700">
            <div className="g--4 m-b500">
              <h3 className="h3 tt-u m-b200">About this Permit</h3>

              <div className="m-b200">{permit.type}</div>

              <div>{permit.address}</div>
              <div>
                {permit.city}, {permit.state} {permit.zip}
              </div>
            </div>

            <div className="g--4 m-b500">
              <h3 className="h3 tt-u m-b200">Open reviews</h3>
              <ul className="ul">
                {permit.reviews.map((review, i) =>
                  review.isComplete ? null : <li key={i}>{review.type}</li>
                )}
              </ul>
            </div>

            <div className="g--4 m-b500">
              <h3 className="h3 tt-u m-b200">Have questions?</h3>

              <div
                css={AUTOLINKED_CONTAINER_STYLE}
                dangerouslySetInnerHTML={{
                  __html: Autolinker.link(
                    (latestStep && latestStep.contactInstructions) ||
                      (permit.kind === PermitKind.BUILDING &&
                        'Call the Boston Inspectional Services Department at (617) 635-5300.') ||
                      (permit.kind === PermitKind.FIRE &&
                        'Call the Boston Fire Department at (617) 343-3628.') ||
                      '',
                    {
                      className: 'autolinked',
                    }
                  ),
                }}
              />

              {latestStep && latestStep.contactName && (
                <div className="m-t200">
                  <h4
                    className="t--sans tt-u t--cb t--s100"
                    style={{ fontWeight: 'bold' }}
                  >
                    Assigned to:
                  </h4>{' '}
                  {latestStep.contactName}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  private renderBuildingPermitSteps(
    renderInfo: MilestoneRenderInfo,
    latestStepIdx: number
  ) {
    const commonOpts = {
      numSteps: 7,
      activeStep: latestStepIdx,
      translations: BUILDING_MILESTONE_TRANSLATIONS,
    };

    return (
      <>
        {this.renderStep('Intake and Payment', renderInfo.intakePayment, {
          ...commonOpts,
          step: 0,
          translationTitle: 'Intake & Payment',
        })}

        {this.renderStep('Project Review', renderInfo.projectReview, {
          ...commonOpts,
          step: 1,
        })}

        {this.renderStep('Zoning Review', renderInfo.zoningReview, {
          ...commonOpts,
          step: 2,
        })}

        {this.renderStep('Issuance', renderInfo.issuance, {
          ...commonOpts,
          step: 3,
        })}

        {this.renderStep('Inspection', renderInfo.inspections, {
          ...commonOpts,
          step: 4,
        })}

        {this.renderStep('Occupancy', renderInfo.occupancy, {
          ...commonOpts,
          step: 5,
        })}

        {this.renderStep('Completed', renderInfo.completed, {
          ...commonOpts,
          step: 6,
        })}
      </>
    );
  }

  private renderFirePermitSteps(
    renderInfo: MilestoneRenderInfo,
    latestStepIdx: number
  ) {
    const commonOpts = {
      numSteps: 5,
      activeStep: latestStepIdx,
      translations: FIRE_MILESTONE_TRANSLATIONS,
    };

    return (
      <>
        {this.renderStep('Intake and Payment', renderInfo.intakePayment, {
          ...commonOpts,
          step: 0,
          translationTitle: 'Intake & Payment',
        })}

        {this.renderStep('Permit Review', renderInfo.permitReview, {
          ...commonOpts,
          step: 1,
        })}

        {this.renderStep('Issuance', renderInfo.issuance, {
          ...commonOpts,
          step: 2,
        })}

        {this.renderStep('Inspection', renderInfo.inspections, {
          ...commonOpts,
          step: 3,
          dateLabel: 'Ready to Be Assigned:',
        })}

        {this.renderStep('Completed', renderInfo.completed, {
          ...commonOpts,
          step: 4,
        })}
      </>
    );
  }
  /**
   * Renders the box for a milestone. The logic here is a bit squirrley. We
   * don’t show "Started On" for steps that have passed, or ever for the
   * "Completed" step.
   */
  private renderStep(
    title: string,
    milestoneStep: MilestoneStep | null,
    opts: {
      activeStep: number;
      step: number;
      numSteps: number;
      translations:
        | typeof BUILDING_MILESTONE_TRANSLATIONS
        | typeof FIRE_MILESTONE_TRANSLATIONS;
      translationTitle?: string;
      dateLabel?: string;
    }
  ) {
    const isActive = opts.activeStep === opts.step;
    const isLastStep = opts.step === opts.numSteps - 1;
    const isCompleted = opts.step < opts.activeStep;

    const targetDuration = lookupTargetDuration(
      opts.translations,
      opts.translationTitle || title
    );

    return (
      <li
        className="cdp m-t500"
        tabIndex={0}
        css={{
          marginLeft: '1rem',
          [MEDIA_SMALL]: { width: `calc(${100}% - 1rem)` },
          [MEDIA_MEDIUM]: { width: `calc(${100 / 2}% - 1rem)` },
          [MEDIA_LARGE]: { width: `calc(${100 / 4}% - 1rem)` },
          [MEDIA_XX_LARGE]: { width: `calc(${100 / opts.numSteps}% - 1rem)` },
        }}
      >
        <div
          className="ta-c t--upper t--sans t--w t--s100 p-a200"
          css={{
            minHeight: '4.5em',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-around',
            backgroundColor: isActive ? OPTIMISTIC_BLUE_LIGHT : CHARLES_BLUE,
          }}
        >
          {title}
        </div>

        <div
          className="p-a200 t--s100"
          css={{
            textAlign: 'left',
            backgroundColor: GRAY_000,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            minHeight: '8em',
          }}
        >
          <div className="m-b200" css={{ flex: 1 }}>
            {milestoneStep && isLastStep && (
              <>
                <i>Completed on:</i>
                <br />
                {formatDate(milestoneStep.milestoneStartDate, 'M/D/YYYY')}
              </>
            )}
            {/* Not all steps have "TargetDuration" values in the translations */}
            {targetDuration && (
              <>
                <i>Target duration:</i>
                <br /> {targetDuration}
              </>
            )}
          </div>

          <div css={{ flex: 1 }}>
            {milestoneStep && !isLastStep && (
              <>
                <i>{opts.dateLabel || 'Started on:'}</i>
                <br />
                {formatDate(milestoneStep.milestoneStartDate, 'M/D/YYYY')}
              </>
            )}

            {!milestoneStep && !isCompleted && !isLastStep && (
              <>
                <i>{opts.dateLabel || 'Started on:'}</i>
                <br /> Not yet started
              </>
            )}
          </div>
        </div>
      </li>
    );
  }
}

/**
 * Given a "DisplayStatus" that indicates which milestone box we’re talking
 * about, finds an ExpectedDuration in our translations that matches.
 *
 * Note that more than one entry in the translations can match this
 * DisplayStatus, so we return the last one. This matches the behavior of the
 * PHP app.
 */
function lookupTargetDuration(
  translations:
    | typeof BUILDING_MILESTONE_TRANSLATIONS
    | typeof FIRE_MILESTONE_TRANSLATIONS,
  displayStatus: string
): string | null {
  const matchingTranslations = translations.filter(
    ({ DisplayStatus, ExpectedDuration }) =>
      DisplayStatus === displayStatus && !!ExpectedDuration
  );

  if (matchingTranslations.length) {
    // We take the last one to match the PHP behavior. Keeps us from returning
    // "Waiting"’s jank duration.
    return matchingTranslations.pop()!.ExpectedDuration;
  } else {
    return null;
  }
}

/**
 * Adapted from the existing jQuery-based JS, hence things feeling a little
 * peculiar.
 */
export function generateBuildingMilestoneRenderInfo(
  milestones: Milestone[]
): MilestoneRenderInfo {
  const info: MilestoneRenderInfo = {
    intakePayment: null,
    projectReview: null,
    zoningReview: null,
    permitReview: null,
    issuance: null,
    inspections: null,
    occupancy: null,
    completed: null,
  };

  milestones.forEach(milestone => {
    BUILDING_MILESTONE_TRANSLATIONS.forEach(translation => {
      if (
        milestone.milestoneName.toUpperCase() ===
        translation.Milestones.toUpperCase()
      ) {
        const step: MilestoneStep = {
          displayStatus: translation.DisplayStatus,
          description: translation.Description,
          contactInstructions: translation.ContactInstructions,

          // We use parse from date-fns because it will default to the same TZ
          // that format outputs in
          milestoneStartDate: parseDate(milestone.milestoneStartDate),
          contactName: milestone.cityContactName,
        };

        switch (translation.DisplayStatus) {
          case 'Intake & Payment':
            info.intakePayment = step;
            break;

          case 'Project Review':
            info.projectReview = step;
            break;

          case 'Zoning Review':
            info.zoningReview = step;
            break;

          case 'Issuance':
            info.issuance = step;
            break;

          case 'Inspections':
          case 'Inspection':
            info.inspections = step;
            break;

          case 'Occupancy':
            info.occupancy = step;
            break;

          case 'Completed':
          case 'Revoked':
          case 'Abandoned':
          case '** NOT USED **':
            info.completed = step;
            break;

          default:
            return;
        }
      }
    });
  });

  return info;
}

export function generateFireMilestoneRenderInfo(
  milestones: Milestone[]
): MilestoneRenderInfo {
  const info: MilestoneRenderInfo = {
    intakePayment: null,
    projectReview: null,
    zoningReview: null,
    permitReview: null,
    issuance: null,
    inspections: null,
    occupancy: null,
    completed: null,
  };

  milestones.forEach(milestone => {
    FIRE_MILESTONE_TRANSLATIONS.forEach(translation => {
      if (
        milestone.milestoneName.toUpperCase() ===
        translation.Milestones.toUpperCase()
      ) {
        const step: MilestoneStep = {
          displayStatus: translation.DisplayStatus,
          description: translation.Description,
          contactInstructions: translation.ContactInstructions,

          // We use parse from date-fns because it will default to the same TZ
          // that format outputs in
          milestoneStartDate: parseDate(milestone.milestoneStartDate),
          contactName: milestone.cityContactName,
        };

        switch (translation.DisplayStatus) {
          case 'Intake & Payment':
            info.intakePayment = step;
            break;

          case 'Permit Review':
            info.permitReview = step;
            break;

          case 'Issuance':
            info.issuance = step;
            break;

          case 'Inspections':
          case 'Inspection':
            info.inspections = step;
            break;

          case 'Completed':
          case 'Revoked':
          case 'Abandoned':
          case '** NOT USED **':
            info.completed = step;
            break;

          default:
            return;
        }
      }
    });
  });

  return info;
}

const AUTOLINKED_CONTAINER_STYLE = css({
  '& .autolinked-phone': {
    whiteSpace: 'nowrap',
  },
});
