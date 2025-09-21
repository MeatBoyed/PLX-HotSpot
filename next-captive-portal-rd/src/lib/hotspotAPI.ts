import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const BrandingConfigCreate = z
  .object({
    ssid: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    brandPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    brandPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    brandSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    brandAccent: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    textPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    textSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    textTertiary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    textMuted: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    surfaceCard: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    surfaceWhite: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    surfaceBorder: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonPrimaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonSecondaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    buttonSecondaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
      .optional(),
    logo: z.string().min(1).max(255).optional(),
    logoWhite: z.string().min(1).max(255).optional(),
    connectCardBackground: z.string().min(1).max(255).optional(),
    bannerOverlay: z.string().max(255).nullish(),
    favicon: z.string().max(255).nullish(),
    adsReviveServerUrl: z.string().max(255).nullish(),
    adsZoneId: z.string().max(255).nullish(),
    adsReviveId: z.string().max(255).nullish(),
    adsVastUrl: z.string().max(255).nullish(),
    termsLinks: z.string().nullish(),
    heading: z.string().max(255).nullish(),
    subheading: z.string().max(255).nullish(),
    buttonText: z.string().max(255).nullish(),
    splashBackground: z.string().max(255).nullish(),
    splashHeading: z.string().max(255).nullish(),
    authMethods: z.array(z.enum(["free", "voucher"])).optional(),
  })
  .strict();
const BrandingConfigCreateResponse = z
  .object({ id: z.number().int().gt(0) })
  .strict()
  .passthrough();
const BrandingConfig = z
  .object({
    id: z.number().int().gt(0),
    ssid: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    brandPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandAccent: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textTertiary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textMuted: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceCard: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceWhite: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceBorder: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    logo: z.string().min(1).max(255),
    logoWhite: z.string().min(1).max(255),
    connectCardBackground: z.string().min(1).max(255),
    bannerOverlay: z.string().max(255).nullish(),
    favicon: z.string().max(255).nullish(),
    adsReviveServerUrl: z.string().max(255).nullish(),
    adsZoneId: z.string().max(255).nullish(),
    adsReviveId: z.string().max(255).nullish(),
    adsVastUrl: z.string().max(255).nullish(),
    termsLinks: z.string().nullish(),
    heading: z.string().max(255).nullish(),
    subheading: z.string().max(255).nullish(),
    buttonText: z.string().max(255).nullish(),
    splashBackground: z.string().max(255).nullish(),
    splashHeading: z.string().max(255).nullish(),
    authMethods: z.array(z.enum(["free", "voucher"])),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict()
  .passthrough();
const BrandingConfigUpdateBody = z
  .object({
    ssid: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    brandPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    brandAccent: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textTertiary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    textMuted: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceCard: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceWhite: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    surfaceBorder: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonPrimaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondary: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondaryHover: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    buttonSecondaryText: z
      .string()
      .max(7)
      .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/),
    logo: z.string().min(1).max(255),
    logoWhite: z.string().min(1).max(255),
    connectCardBackground: z.string().min(1).max(255),
    bannerOverlay: z.string().max(255).nullable(),
    favicon: z.string().max(255).nullable(),
    adsReviveServerUrl: z.string().max(255).nullable(),
    adsZoneId: z.string().max(255).nullable(),
    adsReviveId: z.string().max(255).nullable(),
    adsVastUrl: z.string().max(255).nullable(),
    termsLinks: z.string().nullable(),
    heading: z.string().max(255).nullable(),
    subheading: z.string().max(255).nullable(),
    buttonText: z.string().max(255).nullable(),
    splashBackground: z.string().max(255).nullable(),
    splashHeading: z.string().max(255).nullable(),
    authMethods: z.array(z.enum(["free", "voucher"])),
  })
  .partial()
  .strict();
const BrandingConfigMultipartUpdate = z
  .object({
    json: z.string(),
    logo: z.instanceof(File),
    logoWhite: z.instanceof(File),
    connectCardBackground: z.instanceof(File),
    bannerOverlay: z.instanceof(File),
    favicon: z.instanceof(File),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  BrandingConfigCreate,
  BrandingConfigCreateResponse,
  BrandingConfig,
  BrandingConfigUpdateBody,
  BrandingConfigMultipartUpdate,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/portal/config",
    alias: "postApiportalconfig",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BrandingConfigCreate,
      },
    ],
    response: z
      .object({ id: z.number().int().gt(0) })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `Validation error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/portal/config",
    alias: "getApiportalconfig",
    requestFormat: "json",
    parameters: [
      {
        name: "ssid",
        type: "Query",
        schema: z.string().min(1),
      },
    ],
    response: z.object({ res: BrandingConfig }).strict().passthrough(),
    errors: [
      {
        status: 400,
        description: `Validation error`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/api/portal/config",
    alias: "patchApiportalconfig",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BrandingConfigUpdateBody,
      },
      {
        name: "ssid",
        type: "Query",
        schema: z.string().min(1),
      },
    ],
    response: z.object({ res: BrandingConfig }).strict().passthrough(),
    errors: [
      {
        status: 400,
        description: `Validation or file processing error`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/portal/config/image/:ssid/:slug",
    alias: "getApiportalconfigimageSsidSlug",
    requestFormat: "json",
    parameters: [
      {
        name: "ssid",
        type: "Path",
        schema: z.string().min(1),
      },
      {
        name: "slug",
        type: "Path",
        schema: z.string().min(1),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
]);

export const hotspotAPI = new Zodios("http://localhost:3000", endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
