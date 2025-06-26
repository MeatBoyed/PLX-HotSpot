import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { VastAdData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseVastXml(vastXml: string): VastAdData | null {
  const parser = new DOMParser();
  const xml = parser.parseFromString(vastXml, "application/xml");

  const ad = xml.querySelector("Ad");
  if (!ad) return null;

  const adId = ad.getAttribute("id") || "";
  const duration = xml.querySelector("Duration")?.textContent || "";
  const mediaFileUrl = xml.querySelector("MediaFile")?.textContent?.trim() || "";
  const clickThroughUrl = xml.querySelector("VideoClicks > ClickThrough")?.textContent?.trim() || "";

  const impressionNodes = xml.querySelectorAll("Impression");
  const impressionUrls = Array.from(impressionNodes).map((node) => node.textContent?.trim() || "");

  const trackingNodes = xml.querySelectorAll("TrackingEvents > Tracking");
  const trackingEvents: Record<string, string[]> = {};

  trackingNodes.forEach((node) => {
    const event = node.getAttribute("event") || "";
    const url = node.textContent?.trim();
    if (event && url) {
      if (!trackingEvents[event]) trackingEvents[event] = [];
      trackingEvents[event].push(url);
    }
  });

  return {
    adId,
    duration,
    mediaFileUrl,
    clickThroughUrl,
    impressionUrls,
    trackingEvents,
  };
}
