import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';
import * as KnowledgeLinker from './FolderNodeLink/FolderNodeLink';

// 保存原始的 console.log
const originalLog = console.log;

// 关闭 console.log
console.log = function() {};

// 恢复 console.log
console.log = originalLog;


// 定义插件设置的接口，包含一个设置项 `mySetting`
export interface PluginSettings {
    knowledgeSummary: string;
    subKnowledgePoints: string;
    knowledgeDocuments: string;
    skipSpecificNames: string[];
    outputDirName: string;
}

// 设置的默认值，`mySetting` 的初始值为 'default'
const DEFAULT_SETTINGS: PluginSettings = {
    knowledgeSummary: "# 知识汇总",
    subKnowledgePoints: "# relationship 子知识点",
    knowledgeDocuments: "# relationship 知识文档",
    skipSpecificNames: ['图片库','未命名'],
    outputDirName: "0-知识库汇总"
};


// 插件的主类，继承自 Obsidian 的 `Plugin` 类
export default class MyPlugin extends Plugin {
    settings: PluginSettings;

    // 插件加载时调用
    async onload() {
        // 加载插件的设置
        await this.loadSettings();

        // 通过全局对象传递设置
        (window as any).pluginSettings = this.settings;

        //为文件目录的菜单添加功能
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                //创建知识架构汇总菜单
              menu.addItem((item) => {
                item
                  .setTitle("创建知识架构汇总👈") //设置标题
                  .setIcon("archive-restore")    //设置图标
                  .onClick(async () => {
                    KnowledgeLinker.CreateKnowledgeStructureSummary(file)
                  });
              });
            })
        );
        // 添加设置标签页，用户可以在插件设置中修改参数
        this.addSettingTab(new MyPluginSettingsTab(this.app, this));
    }

    // 插件卸载时调用
    onunload() {
        // 插件卸载时的清理操作可以放在这里
    }

    // 加载插件的设置
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); // 从存储中加载设置，并使用默认设置作为后备
    }

    // 保存插件的设置
    async saveSettings() {
        await this.saveData(this.settings); // 将设置保存到存储中
    }
}

// 自定义模态窗口类，继承自 Obsidian 的 `Modal` 类
class SampleModal extends Modal {
    constructor(app: App) {
        super(app); // 调用父类的构造函数
    }

    // 模态窗口打开时调用
    onOpen() {
        const { contentEl } = this;
        contentEl.setText('Woah!'); // 设置模态窗口的内容
    }

    // 模态窗口关闭时调用
    onClose() {
        const { contentEl } = this;
        contentEl.empty(); // 清空模态窗口的内容
    }
}

// 自定义设置页面，继承自 Obsidian 的 `PluginSettingTab`
class MyPluginSettingsTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const isChinese = navigator.language.startsWith('zh');
    
        containerEl.empty();
        containerEl.createEl('h2', { text: isChinese ? '知识汇总插件设置' : 'Knowledge Summary Plugin Settings' });
    
        // Knowledge Summary 部分
        new Setting(containerEl)
            .setName(isChinese ? '知识汇总' : 'Knowledge Summary')
            .setDesc(isChinese ? '知识汇总部分的文本' : 'Text for the knowledge summary section')
            .addText(text => text
                .setPlaceholder(isChinese ? '输入知识汇总文本' : 'Enter knowledge summary text')
                .setValue(this.plugin.settings.knowledgeSummary)
                .onChange(async (value) => {
                    this.plugin.settings.knowledgeSummary = value;
                    await this.plugin.saveSettings();
                }));
    
        // Relationship 子知识点部分
        new Setting(containerEl)
            .setName(isChinese ? 'Relationship 子知识点' : 'Relationship Sub Knowledge Points')
            .setDesc(isChinese ? 'Relationship 子知识点部分的文本' : 'Text for the relationship sub-knowledge points section')
            .addText(text => text
                .setPlaceholder(isChinese ? '输入 Relationship 子知识点文本' : 'Enter relationship sub-knowledge points text')
                .setValue(this.plugin.settings.subKnowledgePoints)
                .onChange(async (value) => {
                    this.plugin.settings.subKnowledgePoints = value;
                    await this.plugin.saveSettings();
                }));
    
        // Relationship 知识文档部分
        new Setting(containerEl)
            .setName(isChinese ? 'Relationship 知识文档' : 'Relationship Knowledge Documents')
            .setDesc(isChinese ? 'Relationship 知识文档部分的文本' : 'Text for the relationship knowledge documents section')
            .addText(text => text
                .setPlaceholder(isChinese ? '输入 Relationship 知识文档文本' : 'Enter relationship knowledge documents text')
                .setValue(this.plugin.settings.knowledgeDocuments)
                .onChange(async (value) => {
                    this.plugin.settings.knowledgeDocuments = value;
                    await this.plugin.saveSettings();
                }));
    
        // Skip Specific Folder Names (跳过特定名称的文件夹)
        new Setting(containerEl)
            .setName(isChinese ? '跳过特定文件夹名称' : 'Skip Specific Folder Names')
            .setDesc(isChinese ? '处理过程中将跳过具有这些名称的文件夹' : 'Folders with these names will be skipped during processing')
            .addTextArea(textArea => textArea
                .setPlaceholder(isChinese ? '输入用逗号分隔的文件夹名称' : 'Enter folder names separated by commas')
                .setValue(this.plugin.settings.skipSpecificNames.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.skipSpecificNames = value.split(',').map(name => name.trim());
                    await this.plugin.saveSettings();
                }));
    
        // Output Directory Name (输出文件夹名称)
        new Setting(containerEl)
            .setName(isChinese ? '输出文件夹名称' : 'Output Directory Name')
            .setDesc(isChinese ? '将生成摘要文件的目录名称' : 'Name of the directory where the summary files will be created')
            .addText(text => text
                .setPlaceholder(isChinese ? '输入输出目录名称' : 'Enter the output directory name')
                .setValue(this.plugin.settings.outputDirName)
                .onChange(async (value) => {
                    this.plugin.settings.outputDirName = value;
                    await this.plugin.saveSettings();
                }));
    }
}

