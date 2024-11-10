import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function ReCaptcha() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      window.grecaptcha?.ready(() => {
        console.log("[ReCaptcha] ready");
      });
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) return null;

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <div 
        className="g-recaptcha"
        data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        data-size="invisible"
      />
    </>
  );
}

export async function getReCaptchaToken(): Promise<string> {
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) return "";
  
  try {
    const token = await window.grecaptcha.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      { action: 'submit' }
    );
    return token;
  } catch (err) {
    console.error("[ReCaptcha] error:", err);
    return "";
  }
}
