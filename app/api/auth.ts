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

export function auth(req: NextRequest, modelProvider: ModelProvider) {
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

  // if user does not provide an api key, inject system api key
  if (!apiKey) {
    const serverConfig = getServerSideConfig();

    let systemApiKey: string | undefined;
    switch (modelProvider) {
      case ModelProvider.Stability:
        systemApiKey = serverConfig.stabilityApiKey;
        break;
      case ModelProvider.GeminiPro:
        systemApiKey = serverConfig.googleApiKey;
        break;
      case ModelProvider.Claude:
        systemApiKey = serverConfig.anthropicApiKey;
        break;
      case ModelProvider.Doubao:
        systemApiKey = serverConfig.bytedanceApiKey;
        break;
      case ModelProvider.Ernie:
        systemApiKey = serverConfig.baiduApiKey;
        break;
      case ModelProvider.Qwen:
        systemApiKey = serverConfig.alibabaApiKey;
        break;
      case ModelProvider.Moonshot:
        systemApiKey = serverConfig.moonshotApiKey;
        break;
      case ModelProvider.Iflytek:
        systemApiKey =
          serverConfig.iflytekApiKey + ":" + serverConfig.iflytekApiSecret;
        break;
      case ModelProvider.XAI:
        systemApiKey = serverConfig.xaiApiKey;
        break;
      case ModelProvider.ChatGLM:
        systemApiKey = serverConfig.chatglmApiKey;
        break;
      case ModelProvider.GPT:
      default:
        if (req.nextUrl.pathname.includes("azure/deployments")) {
          systemApiKey = serverConfig.azureApiKey;
        } else {
          systemApiKey = serverConfig.apiKey;
        }
    }

    if (systemApiKey) {
      console.log("[Auth] use system api key");
      return {
        error: false,
        apiKey: systemApiKey,
      };
    }

    return {
      error: true,
      msg: "no valid api key",
    };
  }

  return {
    error: false,
    apiKey: apiKey,
  };
}
