import { Module } from '@nestjs/common';
import { LdapService } from './ldap.service';

@Module({
  providers: [LdapService]
})
export class LdapModule {}
