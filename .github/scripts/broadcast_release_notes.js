#!/usr/bin/env node

// ==============================================================================
// Script: broadcast_release_notes.js
// Purpose: Generate GChat Card V2 JSON for GitHub release broadcasts.
// Shared helpers/post/footer/thread patterns match boston.gov-d8
// .github/scripts/D10-Deploy_reporting.js; card content is release-specific.
// ==============================================================================

const gchat = require('./gchat_card_payload.js');

// Production boston.gov hosts the Digital Services custom icons (same as d8).
const path = 'https://boston.gov';

function makeFooterWidget(context, release) {
  const prettyDate = release.created_at
    ? gchat.getPrettyDate(release.created_at)
    : gchat.getPrettyDate(new Date().toISOString());
  const id = release.tag_name
    ? `<code>${release.tag_name}</code>`
    : `<code>${gchat.getShortSha(context)}</code>`;
  return gchat.createWidget(
    'decoratedText',
    {
      text: '',
      bottomLabel: `<b><a href='${ context.payload.repository.html_url }'>${ context.payload.repository.full_name }</a> ${id}</b> | <b>${ prettyDate }</b> | GitHub Action`
    }
  );
}

async function resolveRelease(context, github) {
  if (context.payload.release) {
    return context.payload.release;
  }

  // workflow_dispatch: use the latest published release
  const { data } = await github.rest.repos.getLatestRelease({
    owner: context.repo.owner,
    repo: context.repo.repo
  });
  return data;
}

function notifyRelease(context, release) {
  const repo = context.payload.repository;
  const author = release.author || {};
  const authorName = author.name || author.login || context.actor;
  const homepage = repo.homepage || repo.html_url;
  const description = repo.description || '';
  const releaseBody = release.body || 'No release notes provided.';
  // Same thread key pattern as d8 deploy reporting.
  const threadId = `cob-${ context.number ? context.number : context.runNumber }`;

  return gchat.createPayload(
    threadId,
    [
      gchat.createCard({
        cardId: `${threadId}-${context.runNumber}-release`,
        title: 'Code Release',
        subtitle: 'A production deployment has been completed and release notes have been published.',
        imageUrl: path + '/sites/default/files/custom/digital-service-team.png',
        sections: [
          gchat.createSection({
            collapsible: true,
            widgets: [
              gchat.createWidget(
                'decoratedText',
                {
                  startIcon: {
                    altText: authorName,
                    imageType: "SQUARE",
                    iconUrl: author.avatar_url
                      || context.payload.sender?.avatar_url
                      || (path + '/sites/default/files/custom/pass-icon.png')
                  },
                  contentText: {
                    text: `<b>${ authorName }</b>`
                  }
                }
              ),
              gchat.createWidget(
                'decoratedText',
                {
                  topLabel: 'Release',
                  text: `Release <a href='${ release.html_url }'>${ release.name || release.tag_name }</a>`,
                  bottomLabel: `Tag: <code>${ release.tag_name }</code>`,
                  wrapText: true
                }
              ),
              gchat.createWidget(
                'decoratedText',
                {
                  topLabel: 'Repository',
                  text: `<a href='${ homepage }'>${ repo.name }</a>${ description ? `<br /><i>${ description }</i>` : '' }`,
                  wrapText: true
                }
              ),
              gchat.createWidget(
                'divider',
                {}
              ),
              gchat.createWidget(
                'textParagraph',
                {
                  text: releaseBody,
                  textSyntax: "MARKDOWN"
                }
              ),
              gchat.createWidget(
                'divider',
                {}
              ),
              // Add in footer (in case thread gets messed up).
              makeFooterWidget(context, release)
            ]
          })
        ]
      })
    ]
  );
}

async function startRelease(context, github) {
  const release = await resolveRelease(context, github);
  return notifyRelease(context, release);
}

async function post(webhookUrl, payload, core) {

  if (typeof payload.error !== 'undefined') {
    core.setFailed(`Error building payload. ${payload.error}`);
    return;
  }

  if (!webhookUrl) {
    core.setFailed('Missing webook global secret -access may not be enabled for this repo.');
    return;
  }

  const result = await gchat.post(webhookUrl, payload);
  if (result.result === 'fail') {
    core.setFailed(result.reason);
  }

}

module.exports = {
  startRelease,
  notifyRelease,
  post
};
