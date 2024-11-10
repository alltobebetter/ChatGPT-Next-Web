import { useEffect } from 'react';
import Script from 'next/script';

export function ReCaptcha() {
  useEffect(() => {
    if (process.env.RECAPTCHA_SITE_KEY) {
      window.grecaptcha?.ready(() => {
        console.log("ReCaptcha ready");
      });
    }
  }, []);

  if (!process.env.RECAPTCHA_SITE_KEY) return null;

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <div 
        className="g-recaptcha"
        data-sitekey={process.env.RECAPTCHA_SITE_KEY}
        data-size="invisible"
      />
    </>
  );
}

// 获取 token 的辅助函数
export async function getReCaptchaToken(): Promise<string> {
  if (!process.env.RECAPTCHA_SITE_KEY) return "";
  
  try {
    const token = await window.grecaptcha.execute(
      process.env.RECAPTCHA_SITE_KEY,
      { action: 'submit' }
    );
    return token;
  } catch (err) {
    console.error("ReCaptcha error:", err);
    return "";
  }
}
