import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { css } from 'emotion';

import { MEDIA_MEDIUM } from '@cityofboston/react-fleet';

import FeedbackBanner from '../common/FeedbackBanner';
import Footer from '../common/Footer';
import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';

import { assetUrl } from '../style-constants';

const SPRITE_URL = assetUrl('img/svg/faq-icons.svg');

const ICON_STYLE = css({
  width: '90%',
  maxHeight: 72,
  [MEDIA_MEDIUM]: {
    width: '100%',
    height: '100%',
    maxHeight: 'auto',
  },
});

type QuestionProps = {
  title: string;
  children: ReactNode;
};

function Question({ title, children }: QuestionProps) {
  return (
    <div className="cd cd--plain m-v300 g--4" key={title}>
      <div className="cd-c">
        <div className="cd-t">{title}</div>
        <div className="cd-d">{children}</div>
      </div>
    </div>
  );
}

type Props = {
  suppressQuestions?: boolean;
};

type State = {
  hoveredIcon: 'twitter' | 'app' | 'phone' | 'computer' | null;
};

export default class FaqLayout extends React.Component<Props, State> {
  state: State = {
    hoveredIcon: null,
  };

  handleEnterTwitter = () => {
    this.setState({ hoveredIcon: 'twitter' });
  };

  handleEnterPhone = () => {
    this.setState({ hoveredIcon: 'phone' });
  };

  handleEnterApp = () => {
    this.setState({ hoveredIcon: 'app' });
  };

  handleEnterComputer = () => {
    this.setState({ hoveredIcon: 'computer' });
  };

  handleLeave = () => {
    this.setState({ hoveredIcon: null });
  };

  render() {
    // Used in test to keep the contents of the questions out of the
    // snapshot so that updating them is easier.
    const { suppressQuestions } = this.props;

    return (
      <div>
        <Head>
          <title>BOS:311 — Frequently Asked Questions</title>
        </Head>

        <Nav activeSection="faq" />

        <div className="mn--full">
          <div className="b">
            <div className="b-c">
              <SectionHeader>How to 311</SectionHeader>

              <div className="g m-v500">
                <a
                  href="https://twitter.com/bos311"
                  className="lwi lwi--y g--3 m-v100"
                  onMouseEnter={this.handleEnterTwitter}
                  onMouseLeave={this.handleLeave}
                >
                  {this.renderIcon('Twitter', 'twitter')}
                  <span className="lwi-t">Tweet @bos311</span>
                </a>
                <a
                  href="tel:+311"
                  className="lwi lwi--y g--3 m-v100"
                  onMouseEnter={this.handleEnterPhone}
                  onMouseLeave={this.handleLeave}
                >
                  {this.renderIcon('Phone', 'phone')}
                  <span className="lwi-t">Dial 311</span>
                </a>
                <a
                  href="https://www.boston.gov/departments/innovation-and-technology/apps#bos-311"
                  className="lwi lwi--y g--3 m-v100"
                  onMouseEnter={this.handleEnterApp}
                  onMouseLeave={this.handleLeave}
                >
                  {this.renderIcon('App_store', 'app')}
                  <span className="lwi-t">Download the App</span>
                </a>
                <a
                  href="/"
                  className="lwi lwi--y g--3 m-v100"
                  onMouseEnter={this.handleEnterComputer}
                  onMouseLeave={this.handleLeave}
                >
                  {this.renderIcon('Computer', 'computer')}
                  <span className="lwi-t">Use this site</span>
                </a>
              </div>
            </div>
          </div>

          <div className="b b--g">
            <div className="b-c">
              <SectionHeader>FAQ</SectionHeader>

              {!suppressQuestions && (
                <div className="g m-v500">
                  <Question title="What is 311?">
                    311 is an easy-to-remember telephone number that connects
                    you with highly-trained Constituent Service Center
                    representatives who are ready to help you with requests for
                    non-emergency City services and information.
                  </Question>

                  <Question title="When can I call 311?">
                    The 311 Constituent Service Center is open 24 hours a day, 7
                    days a week, 365 days a year.
                  </Question>

                  <Question title="What’s the difference between 911 and 311?">
                    311 is the number to call to obtain information and access
                    to all non-emergency City services. 911 is the number to
                    call in case of emergency (burning house, robbery, crime in
                    progress).
                  </Question>

                  <Question title="Can I call 311 from my cell phone?">
                    Yes. If you cannot connect to 311 on your cell phone, you
                    can access Boston 311 services by dialing{' '}
                    <a href="tel:+16176354500">617-635-4500</a>.
                  </Question>

                  <Question title="Is calling 311 from my cell free?">
                    Cellular air time charges will apply.
                  </Question>

                  <Question title="How can I track my request?">
                    Once you have successfully submitted your request, you will
                    receive an email with a tracking number that you can use to
                    monitor your request. You can track your service request{' '}
                    <Link href="/search">
                      <a>here</a>
                    </Link>
                    .
                  </Question>

                  <Question title="Why can’t I get through when I dial 311?">
                    Many offices and institutions have complex routing and
                    telephone systems that may need to be configured to allow
                    users to dial 311. You can contact the telecomm office for
                    your company or institution and request they reconfigure the
                    system to allow calls to 311. Alternatively, you can access
                    Boston 311 services by dialing{' '}
                    <a href="tel:+16176354500">617-635-4500</a>.
                  </Question>

                  <Question title="Can I request city services and information without calling?">
                    There are several ways Residents can request city services
                    other than calling 311. Residents are encouraged to{' '}
                    <a href="https://www.boston.gov/departments/innovation-and-technology/apps#bos-311">
                      download the BOS:311 mobile app
                    </a>
                    , Tweet <a href="https://twitter.com/bos311">@BOS311</a>, or
                    visit{' '}
                    <a href="https://www.boston.gov/departments/city-hall-go">
                      City Hall To Go
                    </a>
                    , Boston’s mobile city services truck. To speak with someone
                    from the Mayor’s Office of Constituent Service in person,
                    please come to the Mayor’s Office on the 5th Floor of City
                    Hall weekdays between 9 a.m. and 5 p.m.
                  </Question>

                  <Question title="Can you call 311 from a VOIP phone?">
                    If you are a VOIP customer and having difficulty calling
                    311, it is best to contact your VOIP provider and let them
                    know you cannot connect. It is up to individual VOIP
                    providers to make 311 services available to their customers.
                    Once configured, VOIP service should work properly as long
                    as you are registered as located within the boundaries of
                    the City of Boston. Alternatively, you can access Boston 311
                    services by dialing{' '}
                    <a href="tel:+16176354500">617-635-4500</a>.
                  </Question>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
        <FeedbackBanner fit="PAGE" />
      </div>
    );
  }

  renderIcon(svgName: string, stateName: string) {
    const { hoveredIcon } = this.state;

    return (
      <div className="lwi-ic">
        <svg role="img" className={ICON_STYLE}>
          <use
            xlinkHref={`${SPRITE_URL}#${svgName}_${
              hoveredIcon === stateName ? 'on' : 'off'
            }`}
            height="100%"
          />
        </svg>
      </div>
    );
  }
}
