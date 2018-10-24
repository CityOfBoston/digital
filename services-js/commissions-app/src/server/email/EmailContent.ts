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
  handlebarsTemplates: any;

  constructor() {
    this.handlebarsTemplates = {
      applicant: this.readTemplateFiles('applicant'),
      policyOffice: this.readTemplateFiles('policyOffice'),
    };
  }

  public renderApplicantBodies(data: TemplateData): RenderedEmailBodies {
    return this.renderEmailBodies('applicant', data);
  }

  public renderPolicyOfficeBodies(data: TemplateData): RenderedEmailBodies {
    return this.renderEmailBodies(
      'policyOffice',
      data,
      process.env.COMMISSIONS_URI
    );
  }

  private renderEmailBodies(
    recipient: 'applicant' | 'policyOffice',
    data: TemplateData,
    uri?: string
  ): RenderedEmailBodies {
    const templateData = { ...data, uri };

    const htmlTemplate = Handlebars.compile(
      this.handlebarsTemplates[recipient].MJML
    );
    const textTemplate = Handlebars.compile(
      this.handlebarsTemplates[recipient].TEXT
    );

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
