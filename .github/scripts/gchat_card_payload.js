#!/usr/bin/env node

// ==============================================================================
// Script: format_gchat_payload.js
// Purpose: Generate GChat Card V2 JSON string using native JS object parsing.
// Inputs: Command line arguments (process.argv)
// Returns: Valid JSON string on stdout.
// ==============================================================================

function createPayload(threadId, cards) {
  if (typeof cards === "undefined") {
    console.log("Cards argument is required.");
    return { error: "Missing cards argument" };
  }
  if (typeof threadId === "undefined") {
    console.log("ThreadId argument is required.");
    return { error: "Missing threadId argument" };
  }
  if (!Array.isArray(cards)) {
    cards = [cards];
  }
  return {
    thread: {threadKey: `${ threadId }`},
    cardsV2: cards
  }
}

// @see https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#card
function createCard(config) {

  let output = {
    cardId: `${ config.cardId }`,
    card: {
      header: {
        imageType: "CIRCLE"
      }
    }
  }

  if (typeof config.title !== "undefined") {
    output.card.header.title = config.title;
  }
  if (typeof config.subtitle !== "undefined") {
    output.card.header.subtitle = config.subtitle;
  }
  if (typeof config.imageUrl !== "undefined") {
    output.card.header.imageUrl = config.imageUrl;
  }
  if (typeof config.sections !== "undefined") {
    if (!Array.isArray(config.sections)) {
      config.sections = [config.sections];
    }
    output.card.sections = config.sections;
  }

  return output;

}

// @see https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#section
function createSection(config) {
  if (!Array.isArray(config.widgets)) {
    config.widgets = [config.widgets];
  }
  output = {widgets: config.widgets, collapsible: false };
  if (typeof config.header !== "undefined") {
    output.header = config.header;
  }
  if (typeof config.collapsible !== "undefined") {
    output.collapsible = config.collapsible;
  }
  return output;
}

// @see https://developers.google.com/workspace/chat/api/reference/rest/v1/cards#widget
function createWidget(type, config) {
  return {
    [type]: config
  };
}

async function post(webhookUrl, payload) {
  try {
    webhookUrl = `${ webhookUrl }&messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Google Chat responded with status ${response.status}`);
    }

    if (response.status > 400) {
      console.log(`ERROR CODE: ${response.status}`);
      console.log(JSON.stringify(response.body));
      return {result: "fail", reason: `Failed to send GChat message: ${error.message}`};
    }

    console.log("Notification sent successfully!");
    return {result: "ok"};
  }
  catch (error) {
    return {result: "fail", reason: `Failed to send GChat message: ${error.message}`};
  }
}

function getCommitMessage(context) {
  try {
    if (context.payload.head_commit) {
      return context.payload.head_commit.message;
    }
    else if (context.pull_request.head.message) {
      return context.pull_request.head.message;
    }
    // Old-school.
    const msg = require('child_process')
      .execSync('git log -1 --pretty=%B')
      .toString()
      .trim()
      .split('\n')[0]
      .substring(0, 100);
    return msg ? msg : 'No commit message found';
  }
  catch (error) {
    return "No commit message found";
  }
}

function getPrDescription(context) {
  const prBody = context.payload.pull_request.body;
  return prBody ? prBody : "No description provided.";
}

function getShortSha(context) {
  return context.sha.slice(0,8);
}

function getPrettyDate(isoString, tz = 'local') {
  const date = new Date(isoString);

  let timeZone = tz;
  if (tz === 'local') {
    timeZone = 'America/New_York';
  }

  // Configure the pieces we need
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Forces 24-hour format
    timeZone: timeZone,
    timeZoneName: 'short'
  });

  // Break the formatted date into an easily accessible object
  const parts = formatter.formatToParts(date);
  const p = Object.fromEntries(parts.map(part => [part.type, part.value]));

  // Assemble into your exact required format: "Sat 4 July, 2026 17:02 EDT"
  let output = `${p.weekday} ${p.day} ${p.month}, ${p.year} ${p.hour}:${p.minute}`;
  if (tz !== 'local') {
    output = `${output} ${p.timeZoneName}`;
  }
  return output;

}

// Export the functions so GitHub Actions can see them
module.exports = {
  createPayload,
  createCard,
  createSection,
  createWidget,
  post,
  getCommitMessage,
  getPrDescription,
  getShortSha,
  getPrettyDate
};
