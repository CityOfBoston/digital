// @flow
/* eslint react/prefer-stateless-function: 0 */

import React from 'react';
import Head from 'next/head';

import Nav from '../common/Nav';
import SectionHeader from '../common/SectionHeader';

export default class OnTheGoLayout extends React.Component {
  render() {
    return (
      <div className="mn mn--nv-s">
        <Head>
          <title>BOS:311 — On The Go</title>
        </Head>

        <Nav activeSection="onthego" />
        <div className="b b--fw">
          <div className="b-c">
            <SectionHeader>311 on the go</SectionHeader>

            <div className="g">
              <a href="https://twitter.com/bos311" className="lwi lwi--y g--4">
                <span className="lwi-ic"><img src="https://www.cityofboston.gov/311/css/build/images/birdbird.png" alt="" className="lwi-i" /></span>
                <span className="lwi-t">Tweet @bos311</span>
              </a>
              <a href="tel:+311" className="lwi lwi--y g--4">
                <span className="lwi-ic"><img src="https://www.cityofboston.gov/311/css/build/images/oldphone.png" alt="" className="lwi-i" /></span>
                <span className="lwi-t">Dial 311</span>
              </a>
              <a href="https://www.boston.gov/departments/innovation-and-technology/apps" className="lwi lwi--y g--4">
                <span className="lwi-ic"><img src="https://www.cityofboston.gov/311/css/build/images/iphone.png" alt="" className="lwi-i" /></span>
                <span className="lwi-t">Download the App</span>
              </a>
              <a href="/" className="lwi lwi--y g--4">
                <span className="lwi-ic"><img src="https://www.cityofboston.gov/311/css/build/images/screen.png" alt="" className="lwi-i" /></span>
                <span className="lwi-t">Use this site</span>
              </a>
            </div>

            <div className="m-v500">
              <div className="g">
                <div className="g--8 t--intro">
                  Nemo enim ipsam voluptatem quia voluptas sit tu noc aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non.
                </div>
                <div className="g--44">
                  <h3 className="t--sans tt-u">Download the App</h3>
                  <hr className="hr hr--dash m-v300" />
                  <a href="https://itunes.apple.com/us/app/boston-citizens-connect/id330894558?mt=8">
                    <img src="/static/img/app-store-badge.svg" height="60" alt="Download on the App Store" style={{ display: 'block' }} />
                  </a>
                  <hr className="hr hr--dash m-v300" />
                  <a href="https://play.google.com/store/apps/details?id=gov.cityofboston.citizensconnect&hl=en&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
                    <img alt="Get it on Google Play" height="90" style={{ display: 'block', margin: -14 }} src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" />
                  </a>
                </div>
              </div>
            </div>

            <div className="m-v500 t--info">
            Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc., registered in the U.S. and other countries.
            Google Play and the Google Play logo are trademarks of Google Inc.
            </div>

          </div>
        </div>

      </div>
    );
  }
}
