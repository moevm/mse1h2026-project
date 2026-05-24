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
    const url = process.env.LDAP_URL || 'ldap://localhost:389';
    const bindDN = process.env.LDAP_BIND_DN || 'ou=users';
    const bindPassword = process.env.LDAP_BIND_PASSWORD || 'mse-ldap-password';
    const baseDN = process.env.LDAP_BASE_DN || 'dc=moevm,dc=info';

    this.ldapServiceParams = {
      url: url,
      bindDN: bindDN,
      bindPassword: bindPassword,
      baseDN: baseDN,
    };

    this.client = new Client({
      url: this.ldapServiceParams.url,
      timeout: 10000,
      connectTimeout: 5000,
      strictDN: true,
    });
  }

  async findUserByUID(uid: string): Promise<LdapUserParams> {
    const searchOptions: SearchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=inetOrgPerson)(uid=${uid}))`,
      attributes: ['uid', 'cn', 'sn', 'displayName', 'givenName', 'mail', 'userPassword'],
    };

    try {
      const { searchEntries } = await this.client.search(
        this.ldapServiceParams.baseDN,
        searchOptions,
      );
      if (searchEntries.length === 0) {
        throw new ServiceUnavailableException('User not found');
      }
      // Тип Entry не может в полной мере быть покрыт типом LdapUserParams.
      const user = searchEntries[0] as unknown as LdapUserParams;
      return user;
    } catch (error) {
      this.logger.error('Error searching for user in LDAP', error);
      throw new ServiceUnavailableException('Error searching for user in LDAP');
    }
  }

  async checkUserPassword(uid: string, password: string): Promise<boolean> {
    try {
      // Берём только userPassword.
      const { userPassword } = await this.findUserByUID(uid);
      return userPassword === password;
    } catch (error) {
      this.logger.error('Error checking user password in LDAP', error);
      throw new ServiceUnavailableException('Error checking user password in LDAP');
    }
  }

  async findGroupsByUserUID(uid: string): Promise<LdapGroupParams[]> {
    const searchOptions: SearchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=groupOfNames)(member=uid=${uid},ou=users,${this.ldapServiceParams.baseDN}))`,
      attributes: ['cn', 'member'],
    };
    try {
      const { searchEntries } = await this.client.search(
        this.ldapServiceParams.baseDN,
        searchOptions,
      );
      // Тип Entry не может в полной мере быть покрыт типом LdapGroupParams.
      const groups = searchEntries.map((entry) => entry as unknown as LdapGroupParams);
      return groups;
    } catch (error) {
      this.logger.error('Error searching for groups in LDAP', error);
      throw new ServiceUnavailableException('Error searching for groups in LDAP');
    }
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
}
