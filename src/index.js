import '@logseq/libs';
import { ChatGPTAPI } from './api.js';

async function chatGptReply(event) {
  const currentBlock = await logseq.Editor.getBlock(event.uuid);
  if (!currentBlock) {
    console.error("No current block");
    return;
  }
  const inputText = currentBlock.content.trim();

  if (inputText.length === 0) {
    logseq.UI.showMsg("Empty Content", "warning");
    console.warn("Blank page");
    return;
  }

  const api = new ChatGPTAPI();
  await api.getPage();
  api.waitForResponse(async (responseText) => {
    console.log(`Response is: ${responseText}`)
    await logseq.Editor.insertBlock(currentBlock.uuid, responseText, {
      sibling: false,
    });
  });
  await api.sendInput(inputText);
}

const main = async () => {
  console.log('plugin loaded');
  logseq.Editor.registerSlashCommand("chatgpt-reply", chatGptReply);
}


logseq.ready(main).catch(console.error);
