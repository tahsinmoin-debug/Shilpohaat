const DEFAULT_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dt0mwoirn";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

type OptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number | "auto";
  crop?: "fill" | "fit" | "limit" | "pad" | "scale";
};

type ResponsiveOptions = OptimizeOptions & {
  widths?: number[];
};

const VERSION_SEGMENT = /^v\d+$/;

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

function buildTransformString(options: OptimizeOptions = {}): string {
  const width = toNumber(options.width);
  const height = toNumber(options.height);
  const crop = options.crop || "fill";
  const quality = options.quality ?? "auto";

  const parts = ["f_auto", `q_${quality}`];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);

  return parts.join(",");
}

function normalizeToAbsoluteUrl(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/") && SITE_URL) {
    return `${SITE_URL.replace(/\/$/, "")}${src}`;
  }
  return src;
}

export function isCloudinaryAssetUrl(src: string): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  return /^https?:\/\/res\.cloudinary\.com\//i.test(trimmed);
}

export function toCloudinaryOptimizedUrl(src: string, options: OptimizeOptions = {}): string {
  if (!src) return src;

  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("about:") ||
    trimmed.startsWith("/_next/image")
  ) {
    return trimmed;
  }

  const normalized = normalizeToAbsoluteUrl(trimmed);
  const transform = buildTransformString(options);

  const cloudinaryUploadMatch = normalized.match(
    /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/i
  );

  if (cloudinaryUploadMatch) {
    const cloudName = cloudinaryUploadMatch[1];
    const pathAfterUpload = cloudinaryUploadMatch[2];
    const pathSegments = pathAfterUpload.split("/");
    const versionIndex = pathSegments.findIndex((segment) => VERSION_SEGMENT.test(segment));
    const assetPath =
      versionIndex >= 0 ? pathSegments.slice(versionIndex).join("/") : pathAfterUpload;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${assetPath}`;
  }

  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    return trimmed;
  }

  const encodedSource = encodeURIComponent(normalized);
  return `https://res.cloudinary.com/${DEFAULT_CLOUD_NAME}/image/fetch/${transform}/${encodedSource}`;
}

export function toCloudinaryResponsiveSrcSet(src: string, options: ResponsiveOptions = {}): string {
  if (!src) return '';

  const widths = (options.widths || [320, 480, 640, 768, 960, 1200, 1600])
    .map((w) => toNumber(w))
    .filter((w): w is number => !!w);

  if (!widths.length) return '';

  const uniqueSortedWidths = [...new Set(widths)].sort((a, b) => a - b);

  return uniqueSortedWidths
    .map((width) => {
      const url = toCloudinaryOptimizedUrl(src, {
        width,
        quality: options.quality,
        crop: options.crop,
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

