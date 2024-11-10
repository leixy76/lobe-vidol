import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { DEFAULT_CHAT_MODEL } from '@/constants/agent';
import { OPENAI_API_KEY, OPENAI_END_POINT } from '@/constants/openai';
import { speakCharacter } from '@/libs/messages/speakCharacter';
import { useGlobalStore } from '@/store/global';
import { sessionSelectors, useSessionStore } from '@/store/session';
import { configSelectors, useSettingStore } from '@/store/setting';
import { ChatMessage } from '@/types/chat';
import { ChatStreamPayload } from '@/types/openai/chat';

const createHeader = (header?: any) => {
  const config = configSelectors.currentOpenAIConfig(useSettingStore.getState());
  return {
    'Content-Type': 'application/json',
    [OPENAI_API_KEY]: config?.apikey || '',
    [OPENAI_END_POINT]: config?.endpoint || '',
    ...header,
  };
};

interface ChatCompletionPayload extends Partial<Omit<ChatStreamPayload, 'messages'>> {
  messages: ChatMessage[];
}

interface ChatCompletionOptions {
  signal?: AbortSignal;
}

export const chatCompletion = async (
  payload: ChatCompletionPayload,
  options?: ChatCompletionOptions,
) => {
  const { messages, model } = payload;

  const postMessages = messages.map((m) => ({ content: m.content, role: m.role }));

  const config = configSelectors.currentOpenAIConfig(useSettingStore.getState());
  const enableFetchOnClient = config.fetchOnClient;

  if (enableFetchOnClient) {
    const openai = new OpenAI({
      apiKey: config.apikey,
      baseURL: config.endpoint,
      // 允许在浏览器中使用
      dangerouslyAllowBrowser: true,
    });

    const completion = await openai.chat.completions.create({
      ...payload,
      messages: postMessages,
      model: model || DEFAULT_CHAT_MODEL,
      stream: true,
    });

    const stream = OpenAIStream(completion);

    return new StreamingTextResponse(stream);
  }

  // 使用服务端调用
  return await fetch('/api/chat/openai', {
    body: JSON.stringify({
      ...payload,
      messages: postMessages,
    }),
    headers: createHeader(),
    method: 'POST',
    signal: options?.signal,
  });
};

export const handleSpeakAi = async (message: string) => {
  const viewer = useGlobalStore.getState().viewer;
  const currentAgent = sessionSelectors.currentAgent(useSessionStore.getState());

  speakCharacter(
    {
      expression: 'aa',
      tts: {
        ...currentAgent?.tts,
        message: message,
      },
    },
    viewer,
  );
};

export const toggleVoice = async () => {
  const { toggleVoice, voiceOn } = useSessionStore.getState();
  if (voiceOn) {
    const viewer = useGlobalStore.getState().viewer;
    viewer.model?.stopSpeak();
  }
  toggleVoice();
};
