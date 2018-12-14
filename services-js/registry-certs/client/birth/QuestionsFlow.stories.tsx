import React from 'react';
import { storiesOf } from '@storybook/react';

import BirthCertificateRequest from '../store/BirthCertificateRequest';

import QuestionsFlow from './QuestionsFlow';
import ForSelf from './questions/ForSelf';
import NameOnRecord from './questions/NameOnRecord';
import BornInBoston from './questions/BornInBoston';
import ParentsNames from './questions/ParentsNames';
import ParentsMarried from './questions/ParentsMarried';
import DateOfBirth from './questions/DateOfBirth';

const birthCertificateRequest = new BirthCertificateRequest();

storiesOf('Birth/QuestionsFlow', module)
  .add('QuestionsFlow page', () => (
    <QuestionsFlow birthCertificateRequest={birthCertificateRequest} />
  ))
  .add('who is this for?', () => (
    <ForSelf forSelf={null} handleProceed={() => {}} />
  ))
  .add('born in Boston?', () => (
    <BornInBoston
      forSelf={true}
      handleProceed={() => {}}
      handleStepBack={() => {}}
      handleUserReset={() => {}}
    />
  ))

  .add('enter name', () => (
    <NameOnRecord
      forSelf={true}
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('date of birth?', () => (
    <DateOfBirth
      forSelf={true}
      firstName="Stacy"
      birthDate=""
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('were parents married?', () => (
    <ParentsMarried
      forSelf={false}
      firstName="Stacy"
      parentsMarried=""
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('parents’ names?', () => (
    <ParentsNames
      forSelf={true}
      parentsMarried="yes"
      firstName="Stacy"
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ));
