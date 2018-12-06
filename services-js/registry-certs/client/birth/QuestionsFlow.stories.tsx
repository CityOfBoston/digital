import React from 'react';
import { storiesOf } from '@storybook/react';

import QuestionsFlow from './QuestionsFlow';
import ForSelf from './questions/ForSelf';
import NameOnRecord from './questions/NameOnRecord';
import BornInBoston from './questions/BornInBoston';
import ParentsNames from './questions/ParentsNames';
import ParentsMarried from './questions/ParentsMarried';
import DateOfBirth from './questions/DateOfBirth';

storiesOf('Birth/QuestionsFlow', module)
  .add('QuestionsFlow page', () => <QuestionsFlow />)
  .add('who is this for?', () => <ForSelf handleProceed={() => {}} />)
  .add('born in Boston?', () => (
    <>
      <BornInBoston
        forSelf={true}
        handleProceed={() => {}}
        handleStepBack={() => {}}
        handleUserReset={() => {}}
      />
      <BornInBoston
        forSelf={false}
        handleProceed={() => {}}
        handleStepBack={() => {}}
        handleUserReset={() => {}}
      />
    </>
  ))

  .add('enter name', () => (
    <NameOnRecord handleProceed={() => {}} handleStepBack={() => {}} />
  ))
  .add('date of birth?', () => (
    <>
      <DateOfBirth
        forSelf={true}
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />

      <DateOfBirth
        forSelf={false}
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ))
  .add('were parents married?', () => (
    <>
      <ParentsMarried
        forSelf={true}
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
      <ParentsMarried
        forSelf={false}
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ))
  .add('parents’ names?', () => (
    <>
      <ParentsNames
        forSelf={true}
        parentsMarried="yes"
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
      <ParentsNames
        forSelf={true}
        parentsMarried="no"
        firstName="Stacy"
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ));
