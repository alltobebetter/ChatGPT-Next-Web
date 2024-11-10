把你最改动后修改后的auth.ts的完整代码给我，这是目前的代码，getip函数不要删除

import { NextRequest } from "next/server";
import { getServerSideConfig } from "@/app/config/server";
import md5 from "spark-md5";
import { ModelProvider } from "@/app/constant";
import { FREE_MODELS } from "@/app/constant";
import { getIP } from "@/app/api/common";

function parseApiKey(token: string) {
  const parts = token.trim().split(" ").filter(Boolean);
  const isBearer = parts[0]?.toLowerCase() === "bearer";
  const apiKey = isBearer ? parts[1] : parts[0];
  const accessCode = apiKey?.trim() ?? "";

  return {
    accessCode,
    apiKey,
  };
}

export async function auth(req: NextRequest, modelProvider: ModelProvider) {
  console.log("[Auth] Start auth check");
  
  // 检查 ReCaptcha Token
  const recaptchaToken = req.headers.get("Recaptcha-Token");
  console.log("[Auth] Recaptcha token:", recaptchaToken ? "存在" : "不存在");

  // 如果设置了 SECRET_KEY 但没有 token，返回错误
  if (process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
    return {
      error: true,
      msg: "需要ReCaptcha验证",
    };
  }

  const authToken = req.headers.get("Authorization") ?? "";
  const { accessCode, apiKey } = parseApiKey(authToken);
  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  const requestedModel = req.headers.get("Model") ?? "";
  
  if (!FREE_MODELS.includes(requestedModel) && 
      serverConfig.needCode && 
      !serverConfig.codes.has(hashedCode) && 
      !apiKey) {
    return {
      error: true,
      msg: "您需要购买或者输入需要访问码才能使用此模型",
    };
  }

  if (serverConfig.hideUserApiKey && !!apiKey) {
    return {
      error: true,
      msg: "you are not allowed to access with your own api key",
    };
  }

  return { error: false };
}
