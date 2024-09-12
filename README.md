# Answer

这个错误的原因是 `main` 模块中没有导出名为 `PluginSettings` 的成员。错误信息建议你尝试使用 `import PluginSettings from "main"`，这意味着 `PluginSettings` 可能是一个默认导出的对象，而不是命名导出。

### 解决方案

1. **检查 `main` 模块的导出**：
   首先，你需要检查 `main` 模块的代码，确认 `PluginSettings` 是如何导出的。如果 `PluginSettings` 是默认导出，那么你应该使用默认导入语法：

   ```typescript
   import PluginSettings from 'main';
   ```

2. **如果 `PluginSettings` 是命名导出**：
   如果 `PluginSettings` 是命名导出，那么你需要确保在导入时使用正确的命名导出语法：

   ```typescript
   import { PluginSettings } from 'main';
   ```

   如果 `main` 模块中没有 `PluginSettings` 的命名导出，那么你需要修改 `main` 模块的导出部分，或者在导入时使用正确的名称。

3. **检查模块路径**：
   确保 `main` 模块的路径是正确的，并且模块确实存在。如果路径不正确，可能会导致找不到模块或导出成员。

### 示例

假设 `main` 模块的代码如下：

```typescript
// main.ts
export default class PluginSettings {
    // 类的定义
}
```

那么你应该使用默认导入：

```typescript
import PluginSettings from 'main';
```

如果 `main` 模块的代码如下：

```typescript
// main.ts
export class PluginSettings {
    // 类的定义
}
```

那么你应该使用命名导入：

```typescript
import { PluginSettings } from 'main';
```

### 总结

- 如果 `PluginSettings` 是默认导出，使用 `import PluginSettings from 'main';`。
- 如果 `PluginSettings` 是命名导出，使用 `import { PluginSettings } from 'main';`。
- 确保模块路径正确，并且模块中确实存在相应的导出。

# Question

根据我的代码,帮我写一下这个插件的Readme

# Answer

### Obsidian 插件：FolderNodeLink

#### 简介
FolderNodeLink 是一个 Obsidian 插件，旨在帮助用户自动生成和管理知识库的目录结构。该插件通过递归读取文件夹及其子文件夹的文件，生成对应的 Markdown 文件，并维护知识库的汇总结构。

#### 功能特点
- **自动生成目录结构**：插件会自动读取指定文件夹及其子文件夹的结构，并生成对应的 Markdown 文件。
- **跳过特定文件/文件夹**：用户可以配置跳过包含特定字符串的文件或文件夹。
- **维护知识库汇总**：插件会自动创建和更新知识库汇总文件夹，并生成相应的 Markdown 文件。

#### 安装方法
1. 下载插件文件夹 `FolderNodeLink` 并将其放置在 Obsidian 的插件目录中（通常位于 `.obsidian/plugins/` 下）。
2. 在 Obsidian 中启用插件。

#### 使用说明
1. **初始化知识架构汇总环境**：
   - 插件会自动检查当前文件的父级目录，并根据配置创建知识库汇总文件夹。
   - 如果当前文件的父级目录为根目录，插件会创建一个名为 `知识库汇总` 的文件夹。

2. **生成目录结构**：
   - 插件会递归读取当前文件夹及其子文件夹的结构，并生成对应的 Markdown 文件。
   - 生成的 Markdown 文件会包含子知识点和知识文档的链接。

3. **跳过特定文件/文件夹**：
   - 用户可以在插件设置中配置跳过包含特定字符串的文件或文件夹。

#### 配置选项
- **outputDirName**：知识库汇总文件夹的名称。
- **skipSpecificNames**：跳过包含特定字符串的文件或文件夹。

#### 示例代码
以下是插件的核心代码片段，展示了如何初始化目录结构并生成 Markdown 文件：

```typescript
class DirectoryStructure {
    folderName: string;
    subfolders: DirectoryStructure[];
    mdFiles: string[];

    constructor(folderName: string) {
        this.folderName = folderName;
        this.subfolders = [];
        this.mdFiles = [];
    }
}

const mySetting = (window as any).pluginSettings;

export async function CreateKnowledgeStructureSummary(currentFile: TAbstractFile) {
    // 初始化知识架构汇总环境
    let IsInitFinish = await InitKnowledgeStructureSummaryEnv(currentFile);
    if (!IsInitFinish) {
        console.error("Failed to initialize knowledge structure summary environment.");
        return;
    }

    // 初始化目录结构
    const currentFolderDirectoryStructure = await initDirectoryStructure(currentFile);
    if (!currentFolderDirectoryStructure) {
        console.error("Failed to initialize directory structure.");
        return;
    }

    console.log(currentFolderDirectoryStructure);

    // 生成对应的 Markdown 文件
    await generateMdFiles(currentFolderDirectoryStructure);
}
```

#### 贡献
欢迎提交 Issue 和 Pull Request 来改进插件功能。

#### 许可证
本插件采用 MIT 许可证。详细信息请参阅 [LICENSE](LICENSE) 文件。

---

通过以上 README，用户可以快速了解 FolderNodeLink 插件的功能、安装方法、使用说明以及配置选项。希望这能帮助用户更好地使用和理解插件。