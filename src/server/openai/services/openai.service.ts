import { serverConfig } from "config/server.config";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: serverConfig.openai.apiKey,
});
const openaiService = new OpenAIApi(configuration);

export { openaiService };
