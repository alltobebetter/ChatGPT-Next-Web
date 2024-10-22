import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";
import { ModelProvider } from "./providers";
import { getIP } from "../utils/ip";

function getClientIp(req: NextRequest) {
  let ip = getIP(req);
  if (Array.isArray(ip)) {
    ip = ip[0];
  }
  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = token.startsWith("sk-");

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

export function auth(req: NextRequest, modelProvider: ModelProvider) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey } = parseApiKey(authToken);

  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getClientIp(req));
  console.log("[Time] ", new Date().toLocaleString());

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode) && !apiKey) {
    return {
      error: true,
      msg: !accessCode ? "empty access code" : "wrong access code",
    };
  }

  if (serverConfig.hideUserApiKey && !!apiKey) {
    return {
      error: true,
      msg: "you are not allowed to access with your own api key",
    };
  }

  // if user does not provide an api key, inject system api key
  if (!apiKey) {
    const serverConfig = getServerSideConfig();

    let systemApiKey: string | undefined;

    switch (modelProvider) {
      case ModelProvider.GeminiPro:
        systemApiKey = serverConfig.googleApiKey;
        break;
      case ModelProvider.Azure:
        systemApiKey = serverConfig.azureApiKey;
        break;
      case ModelProvider.OpenAI:
        systemApiKey = serverConfig.apiKey;
        break;
      case ModelProvider.Anthropic:
        systemApiKey = serverConfig.anthropicApiKey;
        break;
      case ModelProvider.Stability:
        systemApiKey = serverConfig.stabilityApiKey;
        break;
      case ModelProvider.Baidu:
        systemApiKey = serverConfig.baiduApiKey;
        break;
      case ModelProvider.ByteDance:
        systemApiKey = serverConfig.bytedanceApiKey;
        break;
      case ModelProvider.Alibaba:
        systemApiKey = serverConfig.alibabaApiKey;
        break;
      case ModelProvider.Tencent:
        systemApiKey = serverConfig.tencentSecretKey;
        break;
      case ModelProvider.Moonshot:
        systemApiKey = serverConfig.moonshotApiKey;
        break;
      case ModelProvider.Iflytek:
        systemApiKey = serverConfig.iflytekApiKey;
        break;
      default:
        break;
    }

    if (!systemApiKey) {
      return {
        error: true,
        msg: "you need to add your api key in settings page",
      };
    }

    return {
      error: false,
      msg: "access code correct",
      accessCode,
      apiKey: systemApiKey,
    };
  }

  // use user's api key
  return {
    error: false,
    msg: "access code correct",
    accessCode,
    apiKey,
  };
}

export function authWithPublicModels(req: NextRequest) {
  const serverConfig = getServerSideConfig();
  const authToken = req.headers.get("Authorization") ?? "";
  const { accessCode } = parseApiKey(authToken);
  const hashedCode = md5.hash(accessCode ?? "").trim();

  if (serverConfig.needCode && !serverConfig.codes.has(hashedCode)) {
    return {
      error: false,
      msg: "access without code",
      accessCode: "",
      apiKey: "",
      availableModels: serverConfig.publicModels,
    };
  }

  return auth(req, ModelProvider.OpenAI);
}
