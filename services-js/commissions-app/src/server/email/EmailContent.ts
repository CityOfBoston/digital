import fs from 'fs';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

require('./handlebars-helpers');

export interface TemplateData {
  commissionNames: string[];
  firstName: string;
  lastName: string;
  email: string;
  applicationId: string;
  uri?: string;
}

interface Templates {
  MJML: any;
  TEXT: any;
}

interface RenderedEmailBodies {
  html: string;
  text: string;
}

export default class EmailContent {
  commissionsUri: string;
  handlebarsTemplates: any;
  templates: any;

  constructor(commissionsUri: string) {
    this.commissionsUri = commissionsUri;

    this.handlebarsTemplates = {
      applicant: this.readTemplateFiles('applicant'),
      policyOffice: this.readTemplateFiles('policyOffice'),
    };

    this.templates = {
      applicant: {
        mjml: Handlebars.compile(this.handlebarsTemplates.applicant.MJML),
        text: Handlebars.compile(this.handlebarsTemplates.applicant.TEXT),
      },
      policyOffice: {
        mjml: Handlebars.compile(this.handlebarsTemplates.policyOffice.MJML),
        text: Handlebars.compile(this.handlebarsTemplates.policyOffice.TEXT),
      },
    };
  }

  public renderApplicantBodies(data: TemplateData): RenderedEmailBodies {
    return this.renderEmailBodies('applicant', data);
  }

  public renderPolicyOfficeBodies(data: TemplateData): RenderedEmailBodies {
    return this.renderEmailBodies('policyOffice', data);
  }

  private renderEmailBodies(
    recipient: 'applicant' | 'policyOffice',
    data: TemplateData
  ): RenderedEmailBodies {
    const templateData = {
      ...data,
      uri: this.commissionsUri,
    };

    const htmlTemplate = this.templates[recipient].mjml;
    const textTemplate = this.templates[recipient].text;

    const mjmlTemplate = htmlTemplate(templateData);

    return {
      html: mjml2html(mjmlTemplate).html,
      text: textTemplate(templateData),
    };
  }

  private readTemplateFiles(recipient: string): Templates {
    const path = 'src/server/email';

    return {
      MJML: fs.readFileSync(`${path}/${recipient}.mjml.hbs`, 'utf-8'),
      TEXT: fs.readFileSync(`${path}/${recipient}.text.hbs`, 'utf-8'),
    };
  }
}
