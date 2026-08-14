/**
 * One-off script: extract clean mock data files from capture results into mock/db/
 * Run: node mock/extract.mjs
 */
import { mkdir, writeFile, readFileSync } from 'node:fs';
import { promisify } from 'node:util';

const mkdirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);

const cap = JSON.parse(readFileSync(new URL('./data/capture-result.json', import.meta.url), 'utf8'));
const authed = JSON.parse(readFileSync(new URL('./data/capture-authed.json', import.meta.url), 'utf8'));
const others = JSON.parse(readFileSync(new URL('./data/capture-userinfo-others.json', import.meta.url), 'utf8'));

const DB = new URL('./db/', import.meta.url);
await mkdirAsync(DB, { recursive: true });

const save = (name, data) => writeFileAsync(new URL(`./${name}.json`, DB), JSON.stringify(data, null, 2) + '\n');

// auth: login tokens per account
const loginTokens = {
  Super: cap['auth-login-super'].body.data,
  Admin: cap['auth-login-admin'].body.data,
  User: cap['auth-login-user'].body.data
};
await save('auth-login-tokens', loginTokens);

// auth: user info per account (keyed by userName inside JWT)
const userInfos = {
  Super: authed.userInfo.data,
  Admin: others['auth-login-admin'].data,
  User01: others['auth-login-user'].data
};
await save('auth-user-infos', userInfos);

// auth: refresh token response
await save('auth-refresh-token', authed.refresh.data);

// routes
await save('route-constant-routes', cap['route-get-constant-routes'].body.data);
await save('route-user-routes', authed.userRoutes.data);

// system manage
await save('sm-role-list', cap['sm-get-role-list'].body.data);
await save('sm-all-roles', cap['sm-get-all-roles'].body.data);
await save('sm-user-list', cap['sm-get-user-list'].body.data);
await save('sm-menu-list', cap['sm-get-menu-list'].body.data);
await save('sm-all-pages', cap['sm-get-all-pages'].body.data);

console.log('extracted to mock/db/');
