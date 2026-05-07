const configuredProfileImageBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const PROFILE_IMAGE_PUBLIC_BASE_URL =
  configuredProfileImageBaseUrl && !configuredProfileImageBaseUrl.includes('PLACEHOLDER')
    ? configuredProfileImageBaseUrl
    : 'https://images.updrafted.us';

const LEGACY_PROFILE_IMAGE_HOSTS = new Set([
  'images.updrafted.us',
  'bucket.updrafted.us',
  'pub-19c0754937db426497ca014f0e2a297c.r2.dev',
]);

function getProfileImageBaseUrl(): string {
  return PROFILE_IMAGE_PUBLIC_BASE_URL.replace(/\/+$/, '');
}

function cleanProfileImagePath(profileImage: string): string {
  return profileImage
    .trim()
    .replace(/^undefined\/+/, '')
    .replace(/\/undefined\/+/g, '/')
    .replace(/^\/+/, '');
}

export function getProfileImageUrl(profileImage: string | null | undefined): string | undefined {
  if (!profileImage || typeof profileImage !== 'string') {
    return undefined;
  }

  const cleanedProfileImage = cleanProfileImagePath(profileImage);

  if (!cleanedProfileImage || cleanedProfileImage === 'undefined') {
    return undefined;
  }

  try {
    const url = new URL(cleanedProfileImage);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    if (!LEGACY_PROFILE_IMAGE_HOSTS.has(url.hostname)) {
      return cleanedProfileImage;
    }

    const key = cleanProfileImagePath(url.pathname);
    if (!key) {
      return undefined;
    }

    return `${getProfileImageBaseUrl()}/${key}${url.search}`;
  } catch {
    return `${getProfileImageBaseUrl()}/${cleanedProfileImage}`;
  }
}
