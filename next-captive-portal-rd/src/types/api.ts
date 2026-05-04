import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type UpdateSiteStatusRequest = Partial<{
  status: SiteStatus;
}>;
type SiteStatus = number;

const WeatherForecast = z
  .object({
    date: z.string(),
    temperatureC: z.union([z.number(), z.string()]),
    temperatureF: z.union([z.number(), z.string()]),
    summary: z.union([z.null(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateAdsConfigRequest = z
  .object({
    reviveServerUrl: z.union([z.null(), z.string()]),
    reviveZoneId: z.union([z.null(), z.string()]),
    reviveId: z.union([z.null(), z.string()]),
    vastUrl: z.union([z.null(), z.string()]),
    isEnabled: z.union([z.null(), z.boolean()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateBrandingRequest = z
  .object({
    brandPrimary: z.union([z.null(), z.string()]),
    brandPrimaryHover: z.union([z.null(), z.string()]),
    brandSecondary: z.union([z.null(), z.string()]),
    brandAccent: z.union([z.null(), z.string()]),
    textPrimary: z.union([z.null(), z.string()]),
    textSecondary: z.union([z.null(), z.string()]),
    textTertiary: z.union([z.null(), z.string()]),
    textMuted: z.union([z.null(), z.string()]),
    surfaceCard: z.union([z.null(), z.string()]),
    surfaceWhite: z.union([z.null(), z.string()]),
    surfaceBorder: z.union([z.null(), z.string()]),
    buttonPrimary: z.union([z.null(), z.string()]),
    buttonPrimaryHover: z.union([z.null(), z.string()]),
    buttonPrimaryText: z.union([z.null(), z.string()]),
    buttonSecondary: z.union([z.null(), z.string()]),
    buttonSecondaryHover: z.union([z.null(), z.string()]),
    buttonSecondaryText: z.union([z.null(), z.string()]),
    logoUrl: z.union([z.null(), z.string()]),
    logoWhiteUrl: z.union([z.null(), z.string()]),
    connectCardBgUrl: z.union([z.null(), z.string()]),
    bannerOverlayUrl: z.union([z.null(), z.string()]),
    faviconUrl: z.union([z.null(), z.string()]),
    splashBgUrl: z.union([z.null(), z.string()]),
    heading: z.union([z.null(), z.string()]),
    subheading: z.union([z.null(), z.string()]),
    buttonText: z.union([z.null(), z.string()]),
    termsLinks: z.union([z.null(), z.string()]),
    venueLabel: z.union([z.null(), z.string()]),
    venueRoute: z.union([z.null(), z.string()]),
    sortOrder: z.union([z.null(), z.number(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateColorsRequest = z
  .object({
    brandPrimary: z.union([z.null(), z.string()]),
    brandPrimaryHover: z.union([z.null(), z.string()]),
    brandSecondary: z.union([z.null(), z.string()]),
    brandAccent: z.union([z.null(), z.string()]),
    textPrimary: z.union([z.null(), z.string()]),
    textSecondary: z.union([z.null(), z.string()]),
    textTertiary: z.union([z.null(), z.string()]),
    textMuted: z.union([z.null(), z.string()]),
    surfaceCard: z.union([z.null(), z.string()]),
    surfaceWhite: z.union([z.null(), z.string()]),
    surfaceBorder: z.union([z.null(), z.string()]),
    buttonPrimary: z.union([z.null(), z.string()]),
    buttonPrimaryHover: z.union([z.null(), z.string()]),
    buttonPrimaryText: z.union([z.null(), z.string()]),
    buttonSecondary: z.union([z.null(), z.string()]),
    buttonSecondaryHover: z.union([z.null(), z.string()]),
    buttonSecondaryText: z.union([z.null(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateImagesRequest = z
  .object({
    logoUrl: z.union([z.null(), z.string()]),
    logoWhiteUrl: z.union([z.null(), z.string()]),
    connectCardBgUrl: z.union([z.null(), z.string()]),
    bannerOverlayUrl: z.union([z.null(), z.string()]),
    faviconUrl: z.union([z.null(), z.string()]),
    splashBgUrl: z.union([z.null(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateContentRequest = z
  .object({
    heading: z.union([z.null(), z.string()]),
    subheading: z.union([z.null(), z.string()]),
    buttonText: z.union([z.null(), z.string()]),
    termsLinks: z.union([z.null(), z.string()]),
    venueLabel: z.union([z.null(), z.string()]),
    venueRoute: z.union([z.null(), z.string()]),
    sortOrder: z.union([z.null(), z.number(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const CreateSiteRequest = z
  .object({
    ssid: z.string(),
    name: z.string(),
    domain: z.union([z.null(), z.string()]),
    sortOrder: z.union([z.number(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const UpdateSiteRequest = z
  .object({
    ssid: z.string(),
    name: z.string(),
    domain: z.union([z.null(), z.string()]),
    sortOrder: z.union([z.number(), z.string()]),
  })
  .partial()
  .strict()
  .passthrough();
const SiteStatus = z.number();
const UpdateSiteStatusRequest: z.ZodType<UpdateSiteStatusRequest> = z
  .object({ status: SiteStatus.int() })
  .partial()
  .strict()
  .passthrough();
const CreateTenantRequest = z
  .object({ name: z.string(), slug: z.string() })
  .partial()
  .strict()
  .passthrough();
const UpdateTenantRequest = z
  .object({ name: z.string(), slug: z.string() })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  WeatherForecast,
  UpdateAdsConfigRequest,
  UpdateBrandingRequest,
  UpdateColorsRequest,
  UpdateImagesRequest,
  UpdateContentRequest,
  CreateSiteRequest,
  UpdateSiteRequest,
  SiteStatus,
  UpdateSiteStatusRequest,
  CreateTenantRequest,
  UpdateTenantRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/api/admin/sites/:siteId",
    alias: "getApiadminsitesSiteId",
    requestFormat: "json",
    parameters: [
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId",
    alias: "putApiadminsitesSiteId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateSiteRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "delete",
    path: "/api/admin/sites/:siteId",
    alias: "deleteApiadminsitesSiteId",
    requestFormat: "json",
    parameters: [
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/admin/sites/:siteId/ads",
    alias: "getApiadminsitesSiteIdads",
    requestFormat: "json",
    parameters: [
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/ads",
    alias: "putApiadminsitesSiteIdads",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateAdsConfigRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/admin/sites/:siteId/branding",
    alias: "getApiadminsitesSiteIdbranding",
    requestFormat: "json",
    parameters: [
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/branding",
    alias: "putApiadminsitesSiteIdbranding",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateBrandingRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/branding/colors",
    alias: "putApiadminsitesSiteIdbrandingcolors",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateColorsRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/branding/content",
    alias: "putApiadminsitesSiteIdbrandingcontent",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateContentRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/branding/images",
    alias: "putApiadminsitesSiteIdbrandingimages",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateImagesRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/sites/:siteId/status",
    alias: "putApiadminsitesSiteIdstatus",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateSiteStatusRequest,
      },
      {
        name: "siteId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/admin/tenants",
    alias: "getApiadmintenants",
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/admin/tenants",
    alias: "postApiadmintenants",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateTenantRequest,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/admin/tenants/:id",
    alias: "getApiadmintenantsId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "put",
    path: "/api/admin/tenants/:id",
    alias: "putApiadmintenantsId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateTenantRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "delete",
    path: "/api/admin/tenants/:id",
    alias: "deleteApiadmintenantsId",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/admin/tenants/:tenantId/sites",
    alias: "getApiadmintenantsTenantIdsites",
    requestFormat: "json",
    parameters: [
      {
        name: "tenantId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/admin/tenants/:tenantId/sites",
    alias: "postApiadmintenantsTenantIdsites",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateSiteRequest,
      },
      {
        name: "tenantId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/WeatherForecast",
    alias: "GetWeatherForecast",
    requestFormat: "json",
    response: z.array(WeatherForecast),
  },
]);

export const api = new Zodios(
  "http://localhost:5299/openapi/v1.json",
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
