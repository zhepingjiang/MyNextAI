import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// Example: sync vs. async
// const func = () => {
//   fetch().then(resp => {})
// }
// const func  = async () => {
//   const resp = await fetch()
// }

// NOTE: change this default filePath to any of your default file name
const chat = async (filePath = "./uploads/sample-local-pdf.pdf", query) => {
  // step 1: Load PDF (Doc loading)
  const loader = new PDFLoader(filePath);

  const data = await loader.load();

  // step 2:
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, //  (in terms of number of characters)
    chunkOverlap: 0,
  });

  const splitDocs = await textSplitter.splitDocuments(data);

  // step 3

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  // Construct vector store
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // step 4: retrieval

  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );

  // step 5: qa w/ customzie the prompt
  const model = new ChatOpenAI({
    // Can change to gpt-4-turbo
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

  // vectorStore.asRetriever() does the retrieval
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;
