import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { ModelProvider, OpenaiPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { requestOpenai } from "./common";

const ALLOWED_PATH = new Set(Object.values(OpenaiPath));

function getModels(remoteModelRes: OpenAIListModelResponse) {
  const config = getServerSideConfig();

  if (config.disableGPT4) {
    remoteModelRes.data = remoteModelRes.data.filter(
      (m) =>
        !(m.id.startsWith("gpt-4") || m.id.startsWith("chatgpt-4o")) ||
        m.id.startsWith("gpt-4o-mini"),
    );
  }

  return remoteModelRes;
}

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] 开始处理请求");
  console.log("[OpenAI Route] 请求路径:", params.path);
  console.log("[OpenAI Route] 请求方法:", req.method);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWED_PATH.has(subpath)) {
    console.log("[OpenAI Route] 禁止访问路径:", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  // 检查 ReCaptcha 配置
  const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaToken = req.headers.get("Recaptcha-Token");

  console.log("[OpenAI Route] ReCaptcha 配置检查:");
  console.log("- Secret Key:", recaptchaSecretKey ? "已配置" : "未配置");
  console.log("- Token:", recaptchaToken ? "已提供" : "未提供");

  // 只有当 SECRET_KEY 和 Token 都存在时才进行验证
  if (recaptchaSecretKey && recaptchaToken) {
    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
      const verifyRes = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${recaptchaSecretKey}&response=${recaptchaToken}`,
      });

      const verifyResult = await verifyRes.json();
      console.log("[OpenAI Route] ReCaptcha 验证结果:", verifyResult);

      if (!verifyResult.success) {
        return NextResponse.json({
          error: true,
          msg: "ReCaptcha 验证失败",
        }, { status: 403 });
      }
    } catch (err) {
      console.error("[OpenAI Route] ReCaptcha 验证出错:", err);
      return NextResponse.json({
        error: true,
        msg: "ReCaptcha 验证过程出错",
      }, { status: 500 });
    }
  } else {
    console.log("[OpenAI Route] 跳过 ReCaptcha 验证 - 配置不完整");
  }

  const authResult = await auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await requestOpenai(req);
    console.log("[OpenAI Route] OpenAI 响应状态:", response.status);

    if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
      const resJson = (await response.json()) as OpenAIListModelResponse;
      const availableModels = getModels(resJson);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    console.error("[OpenAI Route] 请求出错:", e);
    return NextResponse.json(prettyObject(e));
  }
}
