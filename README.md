**DISCLAIMER: The code needs some serious testing and polishing, and it's far from feature complete. All feedbacks welcome.** I'll submit it to the marketplace once it becomes more mature.

# logseq-chatgpt

logseq-chatgpt is a [Logseq](https://github.com/logseq/logseq) plugin that lets you interact with [ChatGPT](https://chat.openai.com/chat) directly from Logseq, similar to the [Logseq GPT3 plugin](https://github.com/briansunter/logseq-plugin-gpt3-openai).

## Usage

In Logseq, enable developer mode in `Settings > Advanced`. [Download](https://github.com/laike9m/logseq-chatgpt/archive/refs/heads/main.zip) the repo, unzip it, and load the plugin manually by choosing the "logseq-chatgpt" folder.

![](https://user-images.githubusercontent.com/2592205/209804322-9346d64a-da20-44e1-856d-4dee0725c377.png)

In Logseq, type `/` to find and run the `chatgpt-reply` command, then wait for the response from ChatGPT to show up. Here's a demo:

![](https://user-images.githubusercontent.com/2592205/209801153-f0b1f1bc-f211-45f6-a50c-028aab4b65d3.gif)

The plugin only works for Chrome (probably other Chromium-based browsers as well) at the moment.

## Setup

To use this plugin, some setup is needed, but I assure you it's very simple:

* Close Chrome, and launch it with a command line argument `--remote-debugging-port=9222`
  It's recommended to create a shortcut to always run Chrome with this option, see the [guidance](https://stackoverflow.com/a/58457229/2142577), but you can also do it manually:

  * Windows 
    ```
    /path/to/chrome.exe --remote-debugging-port=9222
    ```

  * Mac
    ```
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
    ```

  * Linux
    ```
    chrome --remote-debugging-port=9222
    ```

- Login to ChatGPT and keep tab open  
  https://chat.openai.com/chat
  
  Make sure you're logged in while using this plugin (refresh the page if the session expires).
  

## How it works

As I'm writing this, there's no official API for ChatGPT. Though there are some reverse-engineered APIs out there, there's no guarantee that they'll always work reliably, as I've seen OpenAI trying very hard to kill some of these efforts.

Therefore, logseq-chatgpt takes a different yet more straightforward approach: it assumes users have already logged into ChatGPT, so it only needs to automate the process of entering inputs, and fetching responses. I use [puppeteer-web](https://github.com/entrptaher/puppeteer-web) to do it, the communication is done via the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/), and that's we need to run Chrome with `--remote-debugging-port`.
