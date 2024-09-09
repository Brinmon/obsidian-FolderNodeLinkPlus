# Obsidian 示例插件

这是一个为 Obsidian（https://obsidian.md）开发的示例插件。

该项目使用 TypeScript 提供类型检查和文档注释。仓库依赖于最新的插件 API（obsidian.d.ts）的 TypeScript 定义格式，其中包含 TSDoc 注释，描述了它的功能。

**注意：** Obsidian API 仍处于早期 alpha 版本，可能随时会发生变化！

此示例插件演示了插件 API 可以执行的一些基本功能：
- 添加一个侧边栏图标，点击时显示一个通知。
- 添加一个命令 "Open Sample Modal"，用于打开一个模态框。
- 在设置页面中添加一个插件设置标签。
- 注册一个全局点击事件，并在控制台输出 "click"。
- 注册一个全局间隔事件，并每隔一段时间在控制台输出 "setInterval"。

## 第一次开发插件？

为新插件开发者提供的快速入门指南：

- 检查是否已有[类似插件](https://obsidian.md/plugins)！可能已经有一个足够相似的插件，你可以与开发者合作。
- 使用 “Use this template” 按钮复制这个仓库作为模板（如果你没看到该按钮，请先登录 GitHub）。
- 将你的仓库克隆到本地开发文件夹。为了方便，你可以将此文件夹放置在 `.obsidian/plugins/your-plugin-name` 目录中。
- 安装 NodeJS，然后在仓库文件夹下的命令行中运行 `npm i`。
- 运行 `npm run dev` 将 `main.ts` 编译成 `main.js`。
- 修改 `main.ts`（或创建新的 `.ts` 文件）。这些更改将自动编译到 `main.js` 中。
- 重新加载 Obsidian 以加载插件的新版。
- 在设置窗口中启用插件。
- 如需更新 Obsidian API，请在仓库文件夹的命令行中运行 `npm update`。

## 发布新版本

- 更新 `manifest.json` 中的新版本号，例如 `1.0.1`，以及最新版本需要的最低 Obsidian 版本。
- 更新 `versions.json` 文件，格式为 `"new-plugin-version": "minimum-obsidian-version"`，这样较旧版本的 Obsidian 可以下载与你的插件兼容的旧版本。
- 使用新版本号创建一个新的 GitHub 发布（"Tag version" 中使用确切的版本号，不要包含前缀 `v`）。可以参考示例：https://github.com/obsidianmd/obsidian-sample-plugin/releases
- 将 `manifest.json`、`main.js` 和 `styles.css` 文件作为二进制附件上传。注意：`manifest.json` 文件必须在两个地方，一是在仓库根目录，二是在发布版本中。
- 发布新版本。

> 你可以通过运行 `npm version patch`、`npm version minor` 或 `npm version major` 来简化版本号的升级过程。更新 `manifest.json` 中的 `minAppVersion` 后，命令会自动更新 `manifest.json` 和 `package.json` 中的版本号，并将新版本的条目添加到 `versions.json`。

## 将插件添加到社区插件列表

- 查看[插件指南](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)。
- 发布一个初始版本。
- 确保在你的仓库根目录中有一个 `README.md` 文件。
- 提交拉取请求至 https://github.com/obsidianmd/obsidian-releases 以添加你的插件。

## 使用方法

- 克隆此仓库。
- 确保你的 NodeJS 版本至少为 v16（运行 `node --version` 检查）。
- 运行 `npm i` 或 `yarn` 来安装依赖。
- 运行 `npm run dev` 启动编译并进入监视模式。

## 手动安装插件

- 将 `main.js`、`styles.css`、`manifest.json` 复制到你的库 `VaultFolder/.obsidian/plugins/your-plugin-id/` 目录下。

## 使用 eslint 提升代码质量（可选）

- [ESLint](https://eslint.org/) 是一个代码分析工具，用于快速查找问题。你可以使用 ESLint 来扫描你的插件代码，发现常见的错误并改善代码质量。
- 要在此项目中使用 eslint，请首先在终端中安装 eslint：
  - `npm install -g eslint`
- 要使用 eslint 分析此项目，使用以下命令：
  - `eslint main.ts`
  - eslint 将创建一个包含按文件和行号排列的代码改进建议的报告。
- 如果你的源代码位于文件夹中，例如 `src`，可以使用以下命令分析文件夹中的所有文件：
  - `eslint .\src\`

## 捐赠链接

你可以添加捐赠链接，让使用你插件的人支持你的开发工作。

简单的方法是将 `manifest.json` 文件中的 `fundingUrl` 字段设置为你的捐赠链接：

```json
{
    "fundingUrl": "https://buymeacoffee.com"
}
```

如果你有多个链接，你可以这样设置：

```json
{
    "fundingUrl": {
        "Buy Me a Coffee": "https://buymeacoffee.com",
        "GitHub Sponsor": "https://github.com/sponsors",
        "Patreon": "https://www.patreon.com/"
    }
}
```

## API 文档

参见 https://github.com/obsidianmd/obsidian-api