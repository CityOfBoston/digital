/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { format as formatDate, parse as parseDate } from 'date-fns';

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
 * In practice, as of 5/24/19, only one of these will be non-null.
 *
 * We have tentative support for multiple milestone objects, which could be nice
 * to show "completed" dates, but some work would need to be done to make it
 * work properly.
 */
type BuildingMilestoneRenderInfo = {
  intakePayment: MilestoneStep | null;
  projectReview: MilestoneStep | null;
  zoningReview: MilestoneStep | null;
  issuance: MilestoneStep | null;
  inspections: MilestoneStep | null;
  occupancy: MilestoneStep | null;
  completed: MilestoneStep | null;
};

const BUILDING_MILESTONE_ORDER: Array<keyof BuildingMilestoneRenderInfo> = [
  'intakePayment',
  'projectReview',
  'zoningReview',
  'issuance',
  'inspections',
  'occupancy',
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

    const renderInfo = generateBuildingMilestoneRenderInfo(permit.milestones);

    let latestStepIdx = -1;

    BUILDING_MILESTONE_ORDER.forEach((stepName, i) => {
      if (renderInfo[stepName]) {
        latestStepIdx = i;
      }
    });

    const latestStep =
      renderInfo[BUILDING_MILESTONE_ORDER[latestStepIdx]] || null;

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

          <div
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
          </div>

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

              <div>
                {latestStep
                  ? latestStep.contactInstructions
                  : 'Call 617-635-5300 and ask for your assigned inspector.'}
              </div>
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
    renderInfo: BuildingMilestoneRenderInfo,
    latestStepIdx: number
  ) {
    return (
      <>
        {this.renderStep('Intake and Payment', renderInfo.intakePayment, {
          isActive: latestStepIdx === 0,
          showNotYetStarted: false,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Intake & Payment'
          ),
        })}

        {this.renderStep('Project Review', renderInfo.projectReview, {
          isActive: latestStepIdx === 1,
          showNotYetStarted: latestStepIdx < 1,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Project Review'
          ),
        })}

        {this.renderStep('Zoning Review', renderInfo.zoningReview, {
          isActive: latestStepIdx === 2,
          showNotYetStarted: latestStepIdx < 2,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Zoning Review'
          ),
        })}

        {this.renderStep('Issuance', renderInfo.issuance, {
          isActive: latestStepIdx === 3,
          showNotYetStarted: latestStepIdx < 3,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Issuance'
          ),
        })}

        {this.renderStep('Inspection', renderInfo.inspections, {
          isActive: latestStepIdx === 4,
          showNotYetStarted: latestStepIdx < 4,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Inspection'
          ),
        })}

        {this.renderStep('Occupancy', renderInfo.occupancy, {
          isActive: latestStepIdx === 5,
          showNotYetStarted: latestStepIdx < 5,
          targetDuration: lookupTargetDuration(
            BUILDING_MILESTONE_TRANSLATIONS,
            'Occupancy'
          ),
        })}

        {this.renderStep('Completed', renderInfo.completed, {
          isActive: latestStepIdx === 6,
          showNotYetStarted: false,
          completedStep: true,
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
      isActive: boolean;
      showNotYetStarted: boolean;
      completedStep?: boolean;
      targetDuration?: string | null;
    }
  ) {
    return (
      <div
        className="cdp m-t500"
        css={{
          marginLeft: '1rem',
          [MEDIA_SMALL]: { width: `calc(${100}% - 1rem)` },
          [MEDIA_MEDIUM]: { width: `calc(${100 / 2}% - 1rem)` },
          [MEDIA_LARGE]: { width: `calc(${100 / 4}% - 1rem)` },
          [MEDIA_XX_LARGE]: { width: `calc(${100 / 7}% - 1rem)` },
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
            backgroundColor: opts.isActive
              ? OPTIMISTIC_BLUE_LIGHT
              : CHARLES_BLUE,
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
            {milestoneStep && opts.completedStep && (
              <>
                <i>Completed on:</i>
                <br />
                {formatDate(milestoneStep.milestoneStartDate, 'M/D/YYYY')}
              </>
            )}
            {/* Not all steps have "TargetDuration" values in the translations */}
            {opts.targetDuration && (
              <>
                <i>Target duration:</i>
                <br /> {opts.targetDuration}
              </>
            )}
          </div>

          <div css={{ flex: 1 }}>
            {milestoneStep && !opts.completedStep && (
              <>
                <i>Started on:</i>
                <br />
                {formatDate(milestoneStep.milestoneStartDate, 'M/D/YYYY')}
              </>
            )}

            {!milestoneStep && opts.showNotYetStarted && (
              <>
                <i>Started on:</i>
                <br /> Not yet started
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Given a "DisplayStatus" that indicates which milestone box we’re talking
 * about, finds an ExpectedDuration in our translations that matches.
 *
 * Note that more than one entry in the translations can match this
 * DisplayStatus, so we return the first one that starts with a number. In
 * practice, the different milestone kinds for a given DisplayStatus are
 * consistent.
 */
function lookupTargetDuration(
  translations:
    | typeof BUILDING_MILESTONE_TRANSLATIONS
    | typeof FIRE_MILESTONE_TRANSLATIONS,
  displayStatus: string
): string | null {
  const translation = translations.find(
    ({ DisplayStatus, ExpectedDuration }) =>
      // We need to make sure the first element is a digit because there are
      // some expected durations that have help text in them.
      DisplayStatus === displayStatus && !!ExpectedDuration.match(/^\d/)
  );

  if (translation) {
    return translation.ExpectedDuration;
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
): BuildingMilestoneRenderInfo {
  const info: BuildingMilestoneRenderInfo = {
    intakePayment: null,
    projectReview: null,
    zoningReview: null,
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
