import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider, FREE_MODELS } from "../constant";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isApiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isApiKey ? token : "",
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
