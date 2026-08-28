#!/usr/bin/env node

// ==============================================================================
// Script: broadcast_release_notes_test.js
// Purpose: Send dummy release-note GChat cards through the same helper path as
//          production broadcasts. Pattern mirrors boston.gov-d8 chat_test.js.
//
// Local usage (optional webhook):
//   GOOGLE_CHAT_WEBHOOK=https://... node .github/scripts/broadcast_release_notes_test.js
// ==============================================================================

const helper = require('./broadcast_release_notes.js');

function buildTestRelease() {
  return {
    tag_name: 'v0.0.0-gchat-test',
    name: '[TEST] Dummy Digital Release',
    html_url: 'https://github.com/CityOfBoston/digital/releases/tag/v0.0.0-gchat-test',
    created_at: '2026-01-15T15:00:00Z',
    body: [
      '### This is a TEST broadcast',
      '',
      'Dummy release notes for Google Chat integration testing.',
      'No real deployment occurred. Safe to ignore.',
      '',
      '- Changed: sample UI copy',
      '- Fixed: sample validation message',
      '- Added: sample checklist item'
    ].join('\n'),
    author: {
      login: 'gchat-test-bot',
      name: 'GChat Test Bot',
      html_url: 'https://github.com/ghost',
      avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
    }
  };
}

function buildTestContext(overrides = {}) {
  const release = buildTestRelease();

  return {
    number: undefined,
    runNumber: 999001,
    runId: 999001,
    workflow: 'Broadcast Release Notes (Test)',
    eventName: 'workflow_dispatch',
    actor: 'gchat-test-bot',
    sha: '00000000deadbeef',
    payload: {
      sender: {
        avatar_url: release.author.avatar_url
      },
      repository: {
        name: 'digital',
        full_name: 'CityOfBoston/digital',
        html_url: 'https://github.com/CityOfBoston/digital',
        homepage: 'https://boston.gov',
        description: '[TEST] Dummy repository description for GChat release broadcast testing.'
      },
      release
    },
    ...overrides
  };
}

/**
 * Build and optionally post a dummy release card using the production helper.
 * @param {object} context - GitHub Actions context (optional; used for runNumber/actor)
 * @param {object} core - actions/core-compatible object with setFailed()
 * @param {string} webhookUrl - Google Chat webhook URL
 */
async function run(context, core, webhookUrl) {
  const testContext = buildTestContext({
    runNumber: context?.runNumber || 999001,
    runId: context?.runId || 999001,
    actor: context?.actor || 'gchat-test-bot',
    sha: context?.sha || '00000000deadbeef',
    workflow: context?.workflow || 'Broadcast Release Notes (Test)',
    eventName: context?.eventName || 'workflow_dispatch'
  });
  const release = buildTestRelease();

  // Exact same payload path as production: notifyRelease → post
  const payload = helper.notifyRelease(testContext, release);
  console.log('Payload:\n' + JSON.stringify(payload));

  if (!webhookUrl) {
    console.log('No webhook provided — payload built only (dry run).');
    return payload;
  }

  await helper.post(webhookUrl, payload, core);
  return payload;
}

module.exports = {
  run,
  buildTestContext,
  buildTestRelease
};

// Allow local CLI execution (same idea as d8 chat_test.js).
if (require.main === module) {
  const core = {
    setFailed(message) {
      console.error(`FAILED: ${message}`);
      process.exitCode = 1;
    }
  };

  run(
    buildTestContext(),
    core,
    process.env.GOOGLE_CHAT_WEBHOOK || process.env.GCHAT_WEBHOOK_URL || ''
  );
}
