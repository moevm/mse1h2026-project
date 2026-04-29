import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Client, SearchOptions } from 'ldapts';

type LdapUserParams = {
  objectClass: 'inetOrgPerson';
  uid: string;
  cn: string;
  sn: string;
  displayName: string;
  givenName: string;
  mail: string;
  userPassword: string;
};

type LdapGroupParams = {
  objectClass: 'groupOfNames';
  cn: string;
  member: string[];
};

type LdapUserSearchKey = keyof Omit<LdapUserParams, 'userPassword' | 'objectClass'>;
type LdapGroupSearchKey = keyof Omit<LdapGroupParams, 'objectClass'>;

export type LdapUserSearchParams = Partial<Record<LdapUserSearchKey, string | string[]>>;
export type LdapGroupSearchParams = Partial<Record<LdapGroupSearchKey, string | string[]>>;

type LdapServiceParams = {
  url: string;
  bindDN: string;
  bindPassword: string;
  baseDN: string;
};

@Injectable()
export class LdapService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly ldapServiceParams: LdapServiceParams;
  private readonly logger = new Logger(LdapService.name);

  constructor() {
    const url = process.env.LDAP_URL;
    const bindDN = process.env.LDAP_BIND_DN;
    const bindPassword = process.env.LDAP_BIND_PASSWORD;
    const baseDN = process.env.LDAP_BASE_DN;

    if (!bindDN || !bindPassword || !baseDN) {
      throw new ServiceUnavailableException(
        'LDAP_BIND_DN, LDAP_BIND_PASSWORD and LDAP_BASE_DN must be set',
      );
    }

    this.ldapServiceParams = {
      url: url || 'ldap://localhost:389',
      bindDN: bindDN,
      bindPassword: bindPassword,
      baseDN: baseDN,
    };

    this.client = new Client({
      url: this.ldapServiceParams.url,
    });
  }

  async onModuleInit() {
    try {
      await this.client.bind(this.ldapServiceParams.bindDN, this.ldapServiceParams.bindPassword);
      this.logger.log('Successfully connected to LDAP server');
    } catch (error) {
      this.logger.error('Failed to connect to LDAP server', error);
      throw new ServiceUnavailableException('Failed to connect to LDAP server');
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.unbind();
      this.logger.log('Successfully disconnected from LDAP server');
    } catch (error) {
      this.logger.error('Failed to disconnect from LDAP server', error);
    }
  }

  private toFilters(key: string, value: string | string[]): string {
    const values = (Array.isArray(value) ? value : [value]).filter((item) => item !== '');
    // Несколько значений одного поля объединяем через OR.
    if (values.length > 1) {
      return `(|${values.map((item) => `(${key}=${item})`).join('')})`;
    }

    return values.length === 1 ? `(${key}=${values[0]})` : '';
  }

  private buildFilter(
    objectClass: string,
    params: Record<string, string | string[] | undefined>,
  ): string {
    const filters: string[] = [];

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        continue;
      }

      // Собираем фильтры по каждому переданному параметру.
      const filter = this.toFilters(key, value);
      if (filter) {
        filters.push(filter);
      }
    }

    // Всегда ограничиваем objectClass; если параметров нет — только он.
    return filters.length === 0
      ? `(objectClass=${objectClass})`
      : `(&(objectClass=${objectClass})${filters.join('')})`;
  }

  private async getUsersBy(params: LdapUserSearchParams) {
    const options: SearchOptions = {
      scope: 'sub',
      filter: this.buildFilter('inetOrgPerson', params),
      attributes: ['uid', 'cn', 'sn', 'displayName', 'givenName', 'mail', 'objectClass'],
    };

    const { searchEntries } = await this.client.search(this.ldapServiceParams.baseDN, options);
    return searchEntries;
  }

  private async getGroupsBy(params: LdapGroupSearchParams) {
    const options: SearchOptions = {
      scope: 'sub',
      filter: this.buildFilter('groupOfNames', params),
      attributes: ['cn', 'member', 'objectClass'],
    };

    const { searchEntries } = await this.client.search(this.ldapServiceParams.baseDN, options);
    return searchEntries;
  }

  async searchUsers(params: LdapUserSearchParams) {
    return this.getUsersBy(params);
  }

  async searchGroups(params: LdapGroupSearchParams) {
    return this.getGroupsBy(params);
  }

  async getUsersByUid(uid: string) {
    return this.getUsersBy({ uid });
  }

  async getUsersByCn(cn: string) {
    return this.getUsersBy({ cn });
  }

  async getGroupsByCn(cn: string) {
    return this.getGroupsBy({ cn });
  }

  async getGroupsByMember(member: string | string[]) {
    const members = Array.isArray(member) ? member : [member];
    return this.getGroupsBy({ member: members });
  }
}
