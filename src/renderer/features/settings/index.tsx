import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GEMINI_MODELS, LANGUAGES, OPEN_AI_MODELS } from '../../../constant';
import { LanguageType } from '../../../types';
import { isOpenAIModel, ModelType } from '../../../types/models';
import { useSyncedStore } from '../../lib/store';
import { Button } from './components/Button';

const trimmedApiKey = (key: string) => {
  if (key.length > 6) {
    return `${key.slice(0, 5)}...${key.slice(-5)}`;
  }
  return key;
};

export function Settings() {
  const {
    openAIApiKey,
    setOpenAIApiKey,
    geminiApiKey,
    setGeminiApiKey,
    solutionModel,
    setSolutionModel,
    extractionModel,
    setExtractionModel,
    language,
    setLanguage,
  } = useSyncedStore();

  const [openAiKeyHolder, setOpenAiKeyHolder] = useState('');
  const [isEditingOpenAiApiKey, setIsEditingOpenAiApiKey] = useState(false);
  const [geminiKeyHolder, setGeminiKeyHolder] = useState('');
  const [isEditingGeminiApiKey, setIsEditingGeminiApiKey] = useState(false);

  const VALID_MODELS: ModelType[] = [];
  if (openAIApiKey) {
    VALID_MODELS.push(...Object.values(OPEN_AI_MODELS));
  }
  if (geminiApiKey) {
    VALID_MODELS.push(...Object.values(GEMINI_MODELS));
  }

  useEffect(() => {
    if (!openAIApiKey) {
      if (isOpenAIModel(solutionModel)) {
        setSolutionModel(VALID_MODELS[0]);
      }

      if (isOpenAIModel(extractionModel)) {
        setExtractionModel(VALID_MODELS[0]);
      }
    }

    if (!geminiApiKey) {
      if (!isOpenAIModel(solutionModel)) {
        setSolutionModel(VALID_MODELS[0]);
      }

      if (!isOpenAIModel(extractionModel)) {
        setExtractionModel(VALID_MODELS[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAIApiKey, geminiApiKey, VALID_MODELS]);

  return (
    <div className="max-w-3xl bg-gray-900/80 py-10">
      <header>
        <div className="mx-auto w-full px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto w-full p-8 space-y-12">
          {/* General */}
          <div>
            <h2 className="text-base/7 font-semibold text-white">General</h2>

            <dl className="mt-6 text-sm/6 space-y-8">
              <div className="flex justify-between items-center">
                <div className="max-w-1/2">
                  <label
                    htmlFor="extraction-model"
                    className="block text-sm/6 font-medium text-white"
                  >
                    Default language
                  </label>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Select the default language for the application.
                  </p>
                </div>

                <div className="grid grid-cols-1">
                  <select
                    id="extraction-model"
                    name="extraction-model"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                    value={language}
                    onChange={(e) => {
                      const selectedLanguage = e.target.value as LanguageType;
                      setLanguage(selectedLanguage);
                    }}
                  >
                    {Object.values(LANGUAGES).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                  />
                </div>
              </div>
            </dl>
          </div>

          {/* Models */}
          <div>
            <h2 className="text-base/7 font-semibold text-white">Models</h2>
            <p className="mt-1 text-sm/6 text-gray-400">
              There are multiple models available for extraction and solution
              generation.
            </p>

            <dl className="mt-6 text-sm/6 space-y-8">
              <div className="flex justify-between items-center">
                <div className="max-w-1/2">
                  <label
                    htmlFor="extraction-model"
                    className="block text-sm/6 font-medium text-white"
                  >
                    Extraction Model
                  </label>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Select the model that will be used for extracting
                    information from screenshots.
                  </p>
                </div>

                <div className="grid grid-cols-1">
                  <select
                    id="extraction-model"
                    name="extraction-model"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                    value={extractionModel}
                    onChange={(e) => {
                      const selectedModel = e.target.value;
                      setExtractionModel(selectedModel as ModelType);
                    }}
                  >
                    {VALID_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="max-w-1/2">
                  <label
                    htmlFor="solution-model"
                    className="block text-sm/6 font-medium text-white"
                  >
                    Solution Model
                  </label>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Select the model that will be used for generating solutions
                    from extracted information.
                  </p>
                </div>

                <div className="grid grid-cols-1">
                  <select
                    id="solution-model"
                    name="solution-model"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                    value={solutionModel}
                    onChange={(e) => {
                      const selectedModel = e.target.value;
                      setSolutionModel(selectedModel as ModelType);
                    }}
                  >
                    {VALID_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                  />
                </div>
              </div>
            </dl>
          </div>

          {/* API Key */}
          <div>
            <h2 className="text-base/7 font-semibold text-white">API Key</h2>

            <dl className="mt-6 text-sm/6 space-y-8">
              <div className="flex justify-between items-center">
                <div className="max-w-1/2">
                  <label
                    htmlFor="open-ai-api-key"
                    className="block text-sm/6 font-medium text-white"
                  >
                    Open AI API Key
                  </label>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Please follow the{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      instructions
                    </a>{' '}
                    to get up your OpenAI API key.
                  </p>
                </div>

                <div>
                  {isEditingOpenAiApiKey || openAIApiKey === null ? (
                    <div className="flex items-center gap-x-2">
                      <input
                        id="open-ai-api-key"
                        name="open-ai-api-key"
                        type="password"
                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                        placeholder="Enter your key"
                        value={openAiKeyHolder}
                        onChange={(e) => setOpenAiKeyHolder(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          setOpenAIApiKey(openAiKeyHolder);
                          setOpenAiKeyHolder('');
                          setIsEditingOpenAiApiKey(false);
                        }}
                        title="Save"
                        variant="primary"
                      />
                      <Button
                        onClick={() => {
                          setOpenAiKeyHolder('');
                          setIsEditingOpenAiApiKey(false);
                        }}
                        title="Cancel"
                      />
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditingOpenAiApiKey(true)}
                      title={
                        openAIApiKey
                          ? trimmedApiKey(openAIApiKey)
                          : 'Update API Key'
                      }
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="max-w-1/2">
                  <label
                    htmlFor="gemini-api-key"
                    className="block text-sm/6 font-medium text-white"
                  >
                    Gemini API Key
                  </label>
                  <p className="mt-1 text-sm/6 text-gray-400">
                    Please follow the{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      instructions
                    </a>{' '}
                    to get up your Gemini API key.
                  </p>
                </div>

                <div>
                  {isEditingGeminiApiKey || geminiApiKey === null ? (
                    <div className="flex items-center gap-x-2">
                      <input
                        id="gemini-api-key"
                        name="gemini-api-key"
                        type="password"
                        className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6"
                        placeholder="Enter your key"
                        value={geminiKeyHolder}
                        onChange={(e) => setGeminiKeyHolder(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          setGeminiApiKey(geminiKeyHolder);
                          setGeminiKeyHolder('');
                          setIsEditingGeminiApiKey(false);
                        }}
                        title="Save"
                        variant="primary"
                      />
                      <Button
                        onClick={() => {
                          setGeminiKeyHolder('');
                          setIsEditingGeminiApiKey(false);
                        }}
                        title="Cancel"
                      />
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditingGeminiApiKey(true)}
                      title={
                        geminiApiKey
                          ? trimmedApiKey(geminiApiKey)
                          : 'Update API Key'
                      }
                    />
                  )}
                </div>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
