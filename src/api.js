import puppeteer from 'puppeteer-web';
import assert from 'assert';

export class ChatGPTAPI {
  async getWsURL() {
    const response = await fetch('http://127.0.0.1:9222/json/version');
    return JSON.parse(await response.text())["webSocketDebuggerUrl"];
  }

  async getPage() {
    // Connect to an existing instance of Chrome
    this.browser = await puppeteer.connect({
      browserWSEndpoint: await this.getWsURL(),
      defaultViewport: null
    });

    const pages = await this.browser.pages();
    await Promise.all(pages.map(async (page, index) => {
      const url = page.url();
      if (url.startsWith("https://chat.openai.com/chat")) {
        this.page = pages[index]
      }
    }));
  };

  // Chrome has bugs in logging server-sent events, see
  // - https://github.com/Azure/fetch-event-source/issues/3  
  // - https://stackoverflow.com/q/55201372/2142577  
  // - https://bugs.chromium.org/p/chromium/issues/detail?id=1025893  
  //
  // That's why we have to use a suboptimal way to acquire the response:
  //
  // ChatGPT sends both user input and server response text for moderation,
  // payload of the 1st moderation request contains user's input,
  // payload of the 2nd request contains several things
  // - input of the *previous* user input
  // - response of the *previous* server response 
  // - current user input
  // - current server response 
  //
  // So, we read the payload of the 1st request (current user input), 
  // and find the position of the its appearance in the 2nd payload, say `pos`. 
  // Starting from `pos+1` to the end, is the current server response.
  //
  // Example
  // - user input: hi
  // - server response: hello
  // - user input: foo
  // - server response: bar
  // moderation request payload (sent after receiving `bar`)
  // - 1st: foo
  // - 2nd: hi\n\nhello\n\nfoo\n\nbar
  //
  // This is suboptimal because we can't stream server responses to Logseq, like
  // what we see from the ChatGPT web UI. Also, ChatGPT may change this behavior at any
  // point. If this happens, we need to change the code accordingly.
  waitForResponse(callback) {
    let moderationPayloads = [];
    this.page.on('request', request => {
      if (request.url() == "https://chat.openai.com/backend-api/moderations") {
        const payLoad = JSON.parse(request.postData());
        moderationPayloads.push(payLoad["input"]);
      }
      if (moderationPayloads.length == 2) {
        assert(moderationPayloads[1].includes(moderationPayloads[0]),
          `Precondition failed: ${moderationPayloads}`);
        const inputText = moderationPayloads[0];
        const outputText = moderationPayloads[1];
        const responsePosInOutput = outputText.lastIndexOf(inputText) + inputText.length;
        const responseText = outputText.slice(responsePosInOutput).trimStart();
        callback(responseText);
        this.browser.disconnect();
      }
    });
  }

  async sendInput(inputText) {
    const textareaSelector = 'textarea';
    const input = await this.page.$(textareaSelector);
    await input.type(inputText);
    const button = await this.page.evaluateHandle(el => el.nextElementSibling, input);
    await button.click();
  }
}