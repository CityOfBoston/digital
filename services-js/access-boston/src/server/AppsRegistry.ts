import fs from 'fs';
import yaml from 'js-yaml';

export interface AppsCategory {
  title: string;
  showRequestAccessLink: boolean;
  icons: boolean;
  apps: App[];
}

export interface App {
  title: string;
  url: string;
  iconUrl?: string;
  description: string;
  // null groups means "everyone can see this"
  groups: string[] | null;
}

export default class AppsRegistry {
  showAll: boolean;
  allCategories: AppsCategory[];

  constructor(appsYaml: any, showAll = false) {
    this.showAll = showAll;
    const yamlCategories = appsYaml.categories;

    if (!yamlCategories || !Array.isArray(yamlCategories)) {
      throw new Error('Missing categories array');
    }

    this.allCategories = yamlCategories.map(c => {
      const { title, apps: yamlApps, show_request_access_link, icons } = c;

      if (!title || typeof title !== 'string') {
        throw new Error('Category missing title: ' + JSON.stringify(c));
      }

      if (!yamlApps || !Array.isArray(yamlApps)) {
        throw new Error('Category missing apps array: ' + JSON.stringify(c));
      }

      const apps: App[] = yamlApps.map(a => {
        const { title, url, groups, description, icon } = a;

        if (!title || typeof title !== 'string') {
          throw new Error('App missing a title: ' + JSON.stringify(a));
        }

        if (!url || typeof url !== 'string') {
          throw new Error('App missing a url: ' + JSON.stringify(a));
        }

        if (groups && !Array.isArray(groups)) {
          throw new Error('groups is not an array: ' + JSON.stringify(a));
        }

        return {
          title,
          url,
          iconUrl: icon,
          description: description || '',
          groups: groups || null,
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

  appsForGroups(userGroups: string[]): AppsCategory[] {
    return (
      this.allCategories
        .map(c => ({
          ...c,
          apps: c.apps.filter(
            ({ groups }) =>
              this.showAll ||
              !groups ||
              !!groups.find(g => userGroups.includes(g))
          ),
        }))
        // Filter out apps with no categories
        .filter(c => c.apps.length > 0)
    );
  }
}

export async function makeAppsRegistry(yamlPath: string, showAll = false) {
  const yamlString = await new Promise<string>((resolve, reject) => {
    fs.readFile(yamlPath, 'utf-8', (err, contents: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents);
      }
    });
  });

  const appsYaml = yaml.safeLoad(yamlString, { filename: yamlPath });
  return new AppsRegistry(appsYaml, showAll);
}
