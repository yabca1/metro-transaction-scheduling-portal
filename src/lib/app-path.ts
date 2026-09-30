const configuredBasePath = process.env.NEXT_PUBLIC_APP_BASE_PATH?.trim() || '';

export const APP_BASE_PATH = configuredBasePath === '/'
  ? ''
  : configuredBasePath
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, '')}`
    : '';

export function appPath(path = ''): string {
  if (!path || path === '/') return APP_BASE_PATH || '/';
  return `${APP_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

export function stripAppBasePath(pathname: string): string {
  if (!APP_BASE_PATH || !pathname.startsWith(APP_BASE_PATH)) return pathname;
  return pathname.slice(APP_BASE_PATH.length) || '/';
}
