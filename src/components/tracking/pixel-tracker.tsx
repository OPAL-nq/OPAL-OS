'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    ttq?: any;
    whop?: any;
  }
}

/**
 * Triggers a standard or custom Meta Pixel / TikTok / Whop event safely from any component
 */
export function trackPixelEvent(
  eventName: string,
  params: Record<string, any> = {}
) {
  if (typeof window === 'undefined') return;

  // 1. Meta (Facebook/Instagram) Pixel
  if (typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn('[PixelTracker] fbq error:', err);
    }
  }

  // 2. TikTok Pixel
  if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
    try {
      window.ttq.track(eventName, params);
    } catch (err) {
      console.warn('[PixelTracker] ttq error:', err);
    }
  }

  // 3. Whop Pixel
  if (typeof window.whop === 'object' && typeof window.whop.track === 'function') {
    try {
      window.whop.track(eventName, params);
    } catch (err) {
      console.warn('[PixelTracker] whop error:', err);
    }
  }
}

/**
 * Helper to track InitiateCheckout / AddToCart specifically for the 1 998 € Mentorship offer
 */
export function trackInitiateCheckout(
  contentName: string = 'OPAL Intensive Mentorship',
  value: number = 1998,
  currency: string = 'EUR'
) {
  // 1. Meta (Facebook/Instagram) & TikTok Pixel
  trackPixelEvent('InitiateCheckout', {
    content_name: contentName,
    content_category: 'Mentorship',
    value,
    currency,
  });

  // 2. Whop Pixel: Fire standard event 'add_to_cart' & custom 'initiate_checkout'
  if (typeof window !== 'undefined' && typeof window.whop === 'object' && typeof window.whop.track === 'function') {
    try {
      window.whop.track('add_to_cart', {
        value,
        currency,
        content_name: contentName,
      });
      window.whop.track('initiate_checkout', {
        value,
        currency,
        content_name: contentName,
      });
    } catch (err) {
      console.warn('[PixelTracker] Whop track error:', err);
    }
  }
}

/**
 * PixelTracker component to be injected in app layout
 * Reads NEXT_PUBLIC_META_PIXEL_ID and NEXT_PUBLIC_TIKTOK_PIXEL_ID if provided in environment
 */
export function PixelTracker() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  useEffect(() => {
    // Initial PageView event
    trackPixelEvent('PageView');
  }, []);

  return (
    <>
      {/* Meta (Facebook/Instagram) Pixel Script */}
      {metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* TikTok Pixel Script */}
      {tiktokPixelId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,s=d.createElement("script"),s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];o.parentNode.insertBefore(s,o)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
    </>
  );
}
