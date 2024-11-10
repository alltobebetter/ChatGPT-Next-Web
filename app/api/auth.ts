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

async function verifyRecaptcha(token: string) {
  try {
    const recaptchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: 'POST' }
    );

    const result = await recaptchaRes.json();
    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);

    return {
      success: result.success && result.score >= minScore,
      score: result.score
    };
  } catch (error) {
    console.error("ReCaptcha verification failed:", error);
    return {
      success: false,
      score: 0
    };
  }
}

export function auth(req: NextRequest, modelProvider: ModelProvider) {
  // 验证 ReCaptcha
  const recaptchaToken = req.headers.get("Recaptcha-Token");
  if (!recaptchaToken) {
    return {
      error: true,
      msg: "需要进行人机验证",
    };
  }

  // 先返回同步验证结果
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

  // 异步验证 ReCaptcha
  verifyRecaptcha(recaptchaToken).then(({ success }) => {
    if (!success) {
      return {
        error: true,
        msg: "人机验证失败,请重试",
      };
    }
  });

  if (!apiKey) {
    const serverConfig = getServerSideConfig();
    let systemApiKey: string | undefined;

    switch (modelProvider) {
      case ModelProvider.Stability:
        systemApiKey = serverConfig.stabilityApiKey;
        break;
      // ... 其他 case
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
