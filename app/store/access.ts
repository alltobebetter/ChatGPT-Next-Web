import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_OPENAI_URL, DEFAULT_GOOGLE_URL, DEFAULT_ANTHROPIC_URL, DEFAULT_BAIDU_URL, DEFAULT_BYTEDANCE_URL, DEFAULT_ALIBABA_URL, DEFAULT_TENCENT_URL, DEFAULT_MOONSHOT_URL, DEFAULT_IFLYTEK_URL, DEFAULT_STABILITY_URL, ServiceProvider } from "../constant";
import { GoogleSafetySettingsThreshold } from "../client/platforms/google";

export interface AccessControlStore {
  accessCode: string;
  token: string;
  needCode: boolean;
  hideUserApiKey: boolean;
  hideBalanceQuery: boolean;
  disableGPT4: boolean;
  hideGptName: boolean;
  disableFastLink: boolean;
  customModels: string;
  defaultModel: string;

  provider: ServiceProvider;

  // openai
  openaiUrl: string;
  openaiApiKey: string;

  // azure
  azureUrl: string;
  azureApiKey: string;
  azureApiVersion: string;

  // google ai studio
  googleUrl: string;
  googleApiKey: string;
  googleApiVersion: string;
  googleSafetySettings: GoogleSafetySettingsThreshold;

  // anthropic
  anthropicUrl: string;
  anthropicApiKey: string;
  anthropicApiVersion: string;

  // baidu
  baiduUrl: string;
  baiduApiKey: string;
  baiduSecretKey: string;

  // bytedance
  bytedanceUrl: string;
  bytedanceApiKey: string;

  // alibaba
  alibabaUrl: string;
  alibabaApiKey: string;

  // moonshot
  moonshotUrl: string;
  moonshotApiKey: string;

  //stability
  stabilityUrl: string;
  stabilityApiKey: string;

  // tencent
  tencentUrl: string;
  tencentSecretKey: string;
  tencentSecretId: string;

  // iflytek
  iflytekUrl: string;
  iflytekApiKey: string;
  iflytekApiSecret: string;

  // tts config
  edgeTTSVoiceName: string;

  hasEnteredAccessCode: boolean;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  updateHasEnteredAccessCode: (_: boolean) => void;
  updateOpenAIUrl: (_: string) => void;
  updateOpenAIApiKey: (_: string) => void;
  updateAzureUrl: (_: string) => void;
  updateAzureApiKey: (_: string) => void;
  updateAzureApiVersion: (_: string) => void;
  updateGoogleUrl: (_: string) => void;
  updateGoogleApiKey: (_: string) => void;
  updateGoogleApiVersion: (_: string) => void;
  updateGoogleSafetySettings: (_: GoogleSafetySettingsThreshold) => void;
  updateAnthropicUrl: (_: string) => void;
  updateAnthropicApiKey: (_: string) => void;
  updateAnthropicApiVersion: (_: string) => void;
  updateBaiduUrl: (_: string) => void;
  updateBaiduApiKey: (_: string) => void;
  updateBaiduSecretKey: (_: string) => void;
  updateBytedanceUrl: (_: string) => void;
  updateBytedanceApiKey: (_: string) => void;
  updateAlibabaUrl: (_: string) => void;
  updateAlibabaApiKey: (_: string) => void;
  updateMoonshotUrl: (_: string) => void;
  updateMoonshotApiKey: (_: string) => void;
  updateStabilityUrl: (_: string) => void;
  updateStabilityApiKey: (_: string) => void;
  updateTencentUrl: (_: string) => void;
  updateTencentSecretKey: (_: string) => void;
  updateTencentSecretId: (_: string) => void;
  updateIflytekUrl: (_: string) => void;
  updateIflytekApiKey: (_: string) => void;
  updateIflytekApiSecret: (_: string) => void;
  updateEdgeTTSVoiceName: (_: string) => void;
  updateProvider: (_: ServiceProvider) => void;
}

const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  token: "",
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
  hideGptName: false,
  disableFastLink: false,
  customModels: "",
  defaultModel: "",

  provider: ServiceProvider.OpenAI,

  // openai
  openaiUrl: DEFAULT_OPENAI_URL,
  openaiApiKey: "",

  // azure
  azureUrl: "",
  azureApiKey: "",
  azureApiVersion: "2023-08-01-preview",

  // google ai studio
  googleUrl: DEFAULT_GOOGLE_URL,
  googleApiKey: "",
  googleApiVersion: "v1",
  googleSafetySettings: GoogleSafetySettingsThreshold.BLOCK_ONLY_HIGH,

  // anthropic
  anthropicUrl: DEFAULT_ANTHROPIC_URL,
  anthropicApiKey: "",
  anthropicApiVersion: "2023-06-01",

  // baidu
  baiduUrl: DEFAULT_BAIDU_URL,
  baiduApiKey: "",
  baiduSecretKey: "",

  // bytedance
  bytedanceUrl: DEFAULT_BYTEDANCE_URL,
  bytedanceApiKey: "",

  // alibaba
  alibabaUrl: DEFAULT_ALIBABA_URL,
  alibabaApiKey: "",

  // moonshot
  moonshotUrl: DEFAULT_MOONSHOT_URL,
  moonshotApiKey: "",

  //stability
  stabilityUrl: DEFAULT_STABILITY_URL,
  stabilityApiKey: "",

  // tencent
  tencentUrl: DEFAULT_TENCENT_URL,
  tencentSecretKey: "",
  tencentSecretId: "",

  // iflytek
  iflytekUrl: DEFAULT_IFLYTEK_URL,
  iflytekApiKey: "",
  iflytekApiSecret: "",

  // tts config
  edgeTTSVoiceName: "zh-CN-YunxiNeural",

  hasEnteredAccessCode: false,
};

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ACCESS_STATE,

      updateToken(token: string) {
        set((state) => ({ token }));
      },
      updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateHasEnteredAccessCode(hasEntered: boolean) {
        set((state) => ({ hasEnteredAccessCode: hasEntered }));
      },
      updateOpenAIUrl(url: string) {
        set((state) => ({ openaiUrl: url }));
      },
      updateOpenAIApiKey(apiKey: string) {
        set((state) => ({ openaiApiKey: apiKey }));
      },
      updateAzureUrl(url: string) {
        set((state) => ({ azureUrl: url }));
      },
      updateAzureApiKey(apiKey: string) {
        set((state) => ({ azureApiKey: apiKey }));
      },
      updateAzureApiVersion(apiVersion: string) {
        set((state) => ({ azureApiVersion: apiVersion }));
      },
      updateGoogleUrl(url: string) {
        set((state) => ({ googleUrl: url }));
      },
      updateGoogleApiKey(apiKey: string) {
        set((state) => ({ googleApiKey: apiKey }));
      },
      updateGoogleApiVersion(apiVersion: string) {
        set((state) => ({ googleApiVersion: apiVersion }));
      },
      updateGoogleSafetySettings(safetySettings: GoogleSafetySettingsThreshold) {
        set((state) => ({ googleSafetySettings: safetySettings }));
      },
      updateAnthropicUrl(url: string) {
        set((state) => ({ anthropicUrl: url }));
      },
      updateAnthropicApiKey(apiKey: string) {
        set((state) => ({ anthropicApiKey: apiKey }));
      },
      updateAnthropicApiVersion(apiVersion: string) {
        set((state) => ({ anthropicApiVersion: apiVersion }));
      },
      updateBaiduUrl(url: string) {
        set((state) => ({ baiduUrl: url }));
      },
      updateBaiduApiKey(apiKey: string) {
        set((state) => ({ baiduApiKey: apiKey }));
      },
      updateBaiduSecretKey(secretKey: string) {
        set((state) => ({ baiduSecretKey: secretKey }));
      },
      updateBytedanceUrl(url: string) {
        set((state) => ({ bytedanceUrl: url }));
      },
      updateBytedanceApiKey(apiKey: string) {
        set((state) => ({ bytedanceApiKey: apiKey }));
      },
      updateAlibabaUrl(url: string) {
        set((state) => ({ alibabaUrl: url }));
      },
      updateAlibabaApiKey(apiKey: string) {
        set((state) => ({ alibabaApiKey: apiKey }));
      },
      updateMoonshotUrl(url: string) {
        set((state) => ({ moonshotUrl: url }));
      },
      updateMoonshotApiKey(apiKey: string) {
        set((state) => ({ moonshotApiKey: apiKey }));
      },
      updateStabilityUrl(url: string) {
        set((state) => ({ stabilityUrl: url }));
      },
      updateStabilityApiKey(apiKey: string) {
        set((state) => ({ stabilityApiKey: apiKey }));
      },
      updateTencentUrl(url: string) {
        set((state) => ({ tencentUrl: url }));
      },
      updateTencentSecretKey(secretKey: string) {
        set((state) => ({ tencentSecretKey: secretKey }));
      },
      updateTencentSecretId(secretId: string) {
        set((state) => ({ tencentSecretId: secretId }));
      },
      updateIflytekUrl(url: string) {
        set((state) => ({ iflytekUrl: url }));
      },
      updateIflytekApiKey(apiKey: string) {
        set((state) => ({ iflytekApiKey: apiKey }));
      },
      updateIflytekApiSecret(apiSecret: string) {
        set((state) => ({ iflytekApiSecret: apiSecret }));
      },
      updateEdgeTTSVoiceName(voiceName: string) {
        set((state) => ({ edgeTTSVoiceName: voiceName }));
      },
      updateProvider(provider: ServiceProvider) {
        set((state) => ({ provider: provider }));
      },
    }),
    {
      name: "access-store",
      version: 1,
    },
  ),
);
