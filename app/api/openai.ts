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
  console.log("[OpenAI Route] 请求头:", Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    console.log("[OpenAI Route] OPTIONS请求,直接返回");
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");
  console.log("[OpenAI Route] 子路径:", subpath);

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

  console.log("[OpenAI Route] 开始验证");
  const authResult = await auth(req, ModelProvider.GPT);
  console.log("[OpenAI Route] 验证结果:", authResult);

  if (authResult.error) {
    console.log("[OpenAI Route] 验证失败:", authResult.msg);
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    // 检查环境变量
    console.log("[OpenAI Route] 检查ReCaptcha配置");
    console.log("[OpenAI Route] RECAPTCHA_SECRET_KEY:", 
      process.env.RECAPTCHA_SECRET_KEY ? "已设置" : "未设置");
    
    const recaptchaToken = req.headers.get("Recaptcha-Token");
    console.log("[OpenAI Route] ReCaptcha Token:", 
      recaptchaToken ? "存在" : "不存在");

    // 验证 ReCaptcha Token
    if (process.env.RECAPTCHA_SECRET_KEY && recaptchaToken) {
      console.log("[OpenAI Route] 开始验证ReCaptcha");
      try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
        const verifyRes = await fetch(verifyUrl, {
          method: "POST",
        });
        const verifyResult = await verifyRes.json();
        console.log("[OpenAI Route] ReCaptcha验证结果:", verifyResult);
        
        if (!verifyResult.success) {
          return NextResponse.json({
            error: true,
            msg: "ReCaptcha验证失败",
          }, { status: 403 });
        }
      } catch (err) {
        console.error("[OpenAI Route] ReCaptcha验证出错:", err);
      }
    } else {
      console.log("[OpenAI Route] 跳过ReCaptcha验证");
    }

    console.log("[OpenAI Route] 发送请求到OpenAI");
    const response = await requestOpenai(req);
    console.log("[OpenAI Route] OpenAI响应状态:", response.status);

    // list models
    if (subpath === OpenaiPath.ListModelPath && response.status === 200) {
      console.log("[OpenAI Route] 获取模型列表");
      const resJson = (await response.json()) as OpenAIListModelResponse;
      const availableModels = getModels(resJson);
      console.log("[OpenAI Route] 可用模型:", availableModels);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    console.error("[OpenAI Route] 发生错误:", e);
    return NextResponse.json(prettyObject(e));
  }
}
