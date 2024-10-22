import md5 from "spark-md5";
import { DEFAULT_MODELS, DEFAULT_GA_ID } from "../constant";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROXY_URL?: string; // docker only

      OPENAI_API_KEY?: string;
      CODE?: string;
      PUBLIC_MODELS?: string;

      BASE_URL?: string;
      OPENAI_ORG_ID?: string; // openai only

      VERCEL?: string;
      BUILD_MODE?: "standalone" | "export";
      BUILD_APP?: string; // is building desktop app

      HIDE_USER_API_KEY?: string; // disable user's api key input
      DISABLE_GPT4?: string; // allow user to use gpt-4 or not
      ENABLE_BALANCE_QUERY?: string; // allow user to query balance or not
      DISABLE_FAST_LINK?: string; // disallow parse settings from url or not
      CUSTOM_MODELS?: string; // to control custom models
      DEFAULT_MODEL?: string; // to control default model in every new chat window

      // stability only
      STABILITY_URL?: string;
      STABILITY_API_KEY?: string;

      // azure only
      AZURE_URL?: string; // https://{azure-url}/openai/deployments/{deploy-name}
      AZURE_API_KEY?: string;
      AZURE_API_VERSION?: string;

      // google only
      GOOGLE_API_KEY?: string;
      GOOGLE_URL?: string;

      // google tag manager
      GTM_ID?: string;

      // anthropic only
      ANTHROPIC_URL?: string;
      ANTHROPIC_API_KEY?: string;
      ANTHROPIC_API_VERSION?: string;

      // baidu only
      BAIDU_URL?: string;
      BAIDU_API_KEY?: string;
      BAIDU_SECRET_KEY?: string;

      // bytedance only
      BYTEDANCE_URL?: string;
      BYTEDANCE_API_KEY?: string;

      // alibaba only
      ALIBABA_URL?: string;
      ALIBABA_API_KEY?: string;

      // tencent only
      TENCENT_URL?: string;
      TENCENT_SECRET_KEY?: string;
      TENCENT_SECRET_ID?: string;

      // moonshot only
      MOONSHOT_URL?: string;
      MOONSHOT_API_KEY?: string;

      // iflytek only
      IFLYTEK_URL?: string;
      IFLYTEK_API_KEY?: string;
      IFLYTEK_API_SECRET?: string;

      // custom template for preprocessing user input
      DEFAULT_INPUT_TEMPLATE?: string;
    }
  }
}

const ACCESS_CODES = (function getAccessCodes(): Set<string> {
  const code = process.env.CODE;

  try {
    const codes = (code?.split(",") ?? [])
      .filter((v) => !!v)
      .map((v) => md5.hash(v.trim()));
    return new Set(codes);
  } catch (e) {
    return new Set();
  }
})();

function getApiKey(keys?: string) {
  const apiKeyEnvVar = keys ?? "";
  const apiKeys = apiKeyEnvVar.split(",").map((v) => v.trim());
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  const apiKey = apiKeys[randomIndex];
  if (apiKey) {
    console.log(
      `[Server Config] using ${randomIndex + 1} of ${
        apiKeys.length
      } api key - ${apiKey}`,
    );
  }

  return apiKey;
}

export const getServerSideConfig = () => {
  const apiKey = getApiKey(process.env.OPENAI_API_KEY);

  const publicModels = (process.env.PUBLIC_MODELS ?? "").split(",").filter(v => v.trim().length > 0);

  return {
    apiKey,
    code: ACCESS_CODES,
    codes: ACCESS_CODES,
    needCode: ACCESS_CODES.size > 0,
    baseUrl: process.env.BASE_URL,
    openaiOrgId: process.env.OPENAI_ORG_ID,
    isVercel: !!process.env.VERCEL,
    hideUserApiKey: !!process.env.HIDE_USER_API_KEY,
    disableGPT4: !!process.env.DISABLE_GPT4,
    hideBalanceQuery: !process.env.ENABLE_BALANCE_QUERY,
    disableFastLink: !!process.env.DISABLE_FAST_LINK,
    customModels: process.env.CUSTOM_MODELS ?? "",
    defaultModel: process.env.DEFAULT_MODEL ?? DEFAULT_MODELS[0],
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleUrl: process.env.GOOGLE_URL,
    gtmId: process.env.GTM_ID,

    // azure
    azureUrl: process.env.AZURE_URL,
    azureApiKey: process.env.AZURE_API_KEY,
    azureApiVersion: process.env.AZURE_API_VERSION,

    // anthropic
    anthropicUrl: process.env.ANTHROPIC_URL,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicApiVersion: process.env.ANTHROPIC_API_VERSION,

    // stability
    stabilityUrl: process.env.STABILITY_URL,
    stabilityApiKey: process.env.STABILITY_API_KEY,

    // baidu
    baiduUrl: process.env.BAIDU_URL,
    baiduApiKey: process.env.BAIDU_API_KEY,
    baiduSecretKey: process.env.BAIDU_SECRET_KEY,

    // bytedance
    bytedanceUrl: process.env.BYTEDANCE_URL,
    bytedanceApiKey: process.env.BYTEDANCE_API_KEY,

    // alibaba
    alibabaUrl: process.env.ALIBABA_URL,
    alibabaApiKey: process.env.ALIBABA_API_KEY,

    // tencent
    tencentUrl: process.env.TENCENT_URL,
    tencentSecretKey: process.env.TENCENT_SECRET_KEY,
    tencentSecretId: process.env.TENCENT_SECRET_ID,

    // moonshot
    moonshotUrl: process.env.MOONSHOT_URL,
    moonshotApiKey: process.env.MOONSHOT_API_KEY,

    // iflytek
    iflytekUrl: process.env.IFLYTEK_URL,
    iflytekApiKey: process.env.IFLYTEK_API_KEY,
    iflytekApiSecret: process.env.IFLYTEK_API_SECRET,

    publicModels,
  };
};
