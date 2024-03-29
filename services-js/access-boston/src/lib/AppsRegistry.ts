import yaml from 'js-yaml';

export interface Notice {
  label: string;
  pretext: string;
  text: string;
}

export interface AppsCategory {
  title: string;
  showRequestAccessLink: boolean;
  icons: boolean;
  apps: App[];
}

export interface App {
  title: string;
  url: string;
  iconUrl: string | null;
  description: string;
  // null groups means "everyone can see this"
  groups: string[] | null;
  mfaDeviceRequired: boolean;
  // null agencies means "all agencies"
  agencies: string[] | null;
  target: string;
}

export class NoticeClass implements Notice {
  label: string = '';
  pretext: string = '';
  text: string = '';

  constructor(opts: { label?: any; pretext?: any; text?: any }) {
    (this.label = opts.label ? opts.label : ''),
      (this.pretext = opts.pretext ? opts.pretext : ''),
      (this.text = opts.text ? opts.text : '');
  }
}

/**
 * This class is in lib rather than server just so we can use it in Storybook
 * stories. It doesn’t actually get used by the client app.
 */
export default class AppsRegistry {
  showAll: boolean;
  allCategories: AppsCategory[];
  noticeMsg: Notice[];

  constructor(appsYaml: any, showAll = false) {
    this.showAll = showAll;
    const yamlCategories = appsYaml.categories;
    const yamlNotice = appsYaml.notice;

    if (!yamlCategories || !Array.isArray(yamlCategories)) {
      throw new Error('Missing categories array');
    }

    this.noticeMsg = yamlNotice ? yamlNotice : new NoticeClass({});

    this.allCategories = yamlCategories.map(c => {
      const { title, apps: yamlApps, show_request_access_link, icons } = c;

      if (!title || typeof title !== 'string') {
        throw new Error('Category missing title: ' + JSON.stringify(c));
      }

      if (!yamlApps || !Array.isArray(yamlApps)) {
        throw new Error('Category missing apps array: ' + JSON.stringify(c));
      }

      const apps: App[] = yamlApps.map(a => {
        const {
          title,
          url,
          groups,
          description,
          icon,
          mfa_device_required,
          agencies,
          target,
        } = a;

        if (!title || typeof title !== 'string') {
          throw new Error('App missing a title: ' + JSON.stringify(a));
        }

        if (!url || typeof url !== 'string') {
          throw new Error('App missing a url: ' + JSON.stringify(a));
        }

        if (groups && !Array.isArray(groups)) {
          throw new Error('groups is not an array: ' + JSON.stringify(a));
        }

        if (agencies && !Array.isArray(agencies)) {
          throw new Error('agencies is not an array: ' + JSON.stringify(a));
        }

        return {
          title,
          url,
          iconUrl: icon || null,
          description: description || '',
          groups: groups || null,
          mfaDeviceRequired: mfa_device_required || false,
          agencies: agencies || null,
          target: target || '',
        };
      });
      return {
        title,
        apps,
        showRequestAccessLink: !!show_request_access_link,
        icons: !!icons,
      };
    });
  }

  appsForNotice(): Notice[] {
    return this.noticeMsg;
  }

  appsForGroups(
    userGroups: string[],
    hasMfaDevice: boolean,
    cobAgency: string | null
  ): AppsCategory[] {
    return (
      this.allCategories
        .map(c => ({
          ...c,
          apps: c.apps.filter(({ groups, mfaDeviceRequired, agencies }) => {
            // this.showAll = false;

            const mfaRequirementMet = !mfaDeviceRequired || hasMfaDevice;

            const groupsRequirementMet = groups
              ? groups && groups.find(g => userGroups.includes(g))
                ? true
                : false
              : false;

            const agencyRequirementMet = agencies
              ? agencies && (cobAgency && agencies.includes(cobAgency))
              : false;

            const isGroupOrAgencies =
              (groupsRequirementMet || agencyRequirementMet) &&
              mfaRequirementMet;

            return this.showAll || (!groups && !agencies) || isGroupOrAgencies;
          }),
        }))
        // Filter out apps with no categories
        .filter(c => c.apps.length > 0)
    );
  }
}

export function makeAppsRegistry(
  yamlString: string,
  showAll = false
): AppsRegistry {
  const appsYaml = yaml.safeLoad(yamlString);
  return new AppsRegistry(appsYaml, showAll);
}
