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
  const authToken = req.headers.get("Authorization") ?? "";
  const recaptchaToken = req.headers.get("Recaptcha-Token");
  
  // 验证 ReCaptcha
  if (!recaptchaToken) {
    return {
      error: true,
      msg: "需要进行人机验证",
    };
  }

  try {
    const verifyResult = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: 'POST' }
    );
    
    const result = await verifyResult.json();
    const minScore = process.env.RECAPTCHA_MIN_SCORE || 0.5;
    
    if (!result.success || result.score < minScore) {
      return {
        error: true,
        msg: "人机验证失败,请重试",
      };
    }
  } catch (error) {
    console.error("ReCaptcha verification failed:", error);
    return {
      error: true,
      msg: "人机验证服务异常,请稍后重试",
    };
  }

  // 原有的验证逻辑
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
      req.headers.set("Authorization", `Bearer ${systemApiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
    }
  } else {
    console.log("[Auth] use user api key");
  }

  return {
    error: false,
  };
}
