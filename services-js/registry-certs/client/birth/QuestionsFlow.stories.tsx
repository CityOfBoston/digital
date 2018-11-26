import React from 'react';
import { storiesOf } from '@storybook/react';

import QuestionsFlow from './QuestionsFlow';
import ForSelf from './questions/ForSelf';
import HowRelated from './questions/HowRelated';
import NameOnRecord from './questions/NameOnRecord';
import BornInBoston from './questions/BornInBoston';
import ParentsLivedInBoston from './questions/ParentsLivedInBoston';
import ParentsNames from './questions/ParentsNames';
import ParentsMarried from './questions/ParentsMarried';
import DateOfBirth from './questions/DateOfBirth';

storiesOf('Birth/QuestionsFlow', module)
  .add('QuestionsFlow page', () => <QuestionsFlow />)
  .add('who is this for?', () => <ForSelf handleChange={() => {}} />)
  .add('how are you related?', () => (
    <HowRelated
      howRelated={'parent'}
      handleChange={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('born in Boston?', () => (
    <>
      <BornInBoston
        forSelf={true}
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
      <BornInBoston
        forSelf={false}
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ))
  .add('did parents live in Boston?', () => (
    <>
      <ParentsLivedInBoston
        forSelf={true}
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
      <ParentsLivedInBoston
        forSelf={false}
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ))
  .add('enter name', () => (
    <NameOnRecord
      handleTextInput={() => {}}
      handleProceed={() => {}}
      handleStepBack={() => {}}
    />
  ))
  .add('were parents married?', () => (
    <>
      <ParentsMarried
        forSelf={true}
        firstName="Stacy"
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
      <ParentsMarried
        forSelf={false}
        firstName="Stacy"
        handleChange={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ))
  .add('date of birth?', () => (
    <>
      <DateOfBirth
        forSelf={true}
        firstName="Stacy"
        handleTextInput={() => {}}
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />

      <DateOfBirth
        forSelf={false}
        firstName="Stacy"
        handleTextInput={() => {}}
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
        handleTextInput={() => {}}
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
      <ParentsNames
        forSelf={true}
        parentsMarried="no"
        firstName="Stacy"
        handleTextInput={() => {}}
        handleProceed={() => {}}
        handleStepBack={() => {}}
      />
    </>
  ));
