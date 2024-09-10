import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';
import * as KnowledgeLinker from './MyPlugin';
import * as path from 'path';
import * as fs from 'fs';

// 定义插件设置的接口，包含一个设置项 `mySetting`
interface MyPluginSettings {
    mySetting: string;
    skipPrefixes: string[];
    outputDirName: string;
}

// 设置的默认值，`mySetting` 的初始值为 'default'
const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    skipPrefixes: ['1-知识架构汇总', '2-Web图片库'],
    outputDirName: '1-知识架构汇总'
}

// 插件的主类，继承自 Obsidian 的 `Plugin` 类
export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    // 插件加载时调用
    async onload() {
        // 加载插件的设置
        await this.loadSettings();

        const ribbonIconEl = this.addRibbonIcon('dice', 'MakePlugs', async (evt: MouseEvent) => {
            // setupRibbonIcon(this.app);
            // 使用示例
            // const rootPath = app.vault.adapter.basePath; // 获取 Obsidian 文档的根路径
            // const directoryStructure = readDirectoryStructure(rootPath);
            
            // console.log('目录结构:', JSON.stringify(directoryStructure, null, 2));
            const rootPath = app.vault.adapter.basePath;
            
            const directoryStructure = KnowledgeLinker.readDirectoryStructure(rootPath, this.settings.skipPrefixes);
            
            KnowledgeLinker.generateMdFiles(directoryStructure, this.settings.outputDirName);

        });

        // 为图标添加一个自定义的 CSS 类
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // 在应用的底部状态栏添加一个状态项（仅桌面应用有效）
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text'); // 设置状态栏的文字

        // 添加一个简单的命令，可以从命令面板中触发
        this.addCommand({
            id: 'open-sample-modal-simple', // 命令的唯一 ID
            name: 'Open sample modal (simple)', // 命令的名称
            callback: () => {
                // 触发时打开一个模态窗口
                new SampleModal(this.app).open();
            }
        });

        // 添加一个编辑器命令，可以操作当前编辑器实例
        this.addCommand({
            id: 'sample-editor-command', // 命令的唯一 ID
            name: 'Sample editor command', // 命令的名称
            editorCallback: (editor: Editor, view: MarkdownView) => {
                // 打印选中的文本，并将其替换为 'Sample Editor Command'
                console.log(editor.getSelection());
                editor.replaceSelection('Sample Editor Command');
            }
        });

        // 添加一个复杂的命令，只有满足特定条件时才会显示
        this.addCommand({
            id: 'open-sample-modal-complex', // 命令的唯一 ID
            name: 'Open sample modal (complex)', // 命令的名称
            checkCallback: (checking: boolean) => {
                // 获取当前活动的 Markdown 视图
                const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (markdownView) {
                    // 如果 `checking` 为 true，表示只检查命令是否可用
                    // 如果 `checking` 为 false，执行命令操作
                    if (!checking) {
                        new SampleModal(this.app).open(); // 打开模态窗口
                    }

                    // 返回 true 表示命令可用，显示在命令面板中
                    return true;
                }
            }
        });

        // 添加设置标签页，用户可以在插件设置中修改参数
        this.addSettingTab(new SampleSettingTab(this.app, this));

        // 如果插件监听全局的 DOM 事件，可以在此注册
        // 当插件禁用时，事件监听器会自动移除
        // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
        //     console.log('click  ---asd', evt); // 点击事件处理函数
        // });

        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file instanceof TFolder) {
                    console.log('Folder created ---', file.path);
                } else {
                    console.log('File created ---', file.path);
                }
            })
        );

        this.registerEvent(
            this.app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFolder) {
                    console.log('Folder renamed ---', oldPath, 'to', file.path);
                } else {
                    console.log('File renamed ---', oldPath, 'to', file.path);
                }
            })
        );

        // 注册定时器，当插件禁用时，定时器会自动清除
        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000)); // 每5分钟输出一次日志
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
class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin; // 保存插件实例的引用
    }

    // 设置页面的渲染逻辑
    display(): void {
        const { containerEl } = this;

        containerEl.empty(); // 清空当前的设置页面内容

        // 创建第一个设置项
        new Setting(containerEl)
            .setName('Setting #1') // 设置项的名称
            .setDesc('It\'s a secret') // 设置项的描述
            .addText(text => text
                .setPlaceholder('Enter your secret') // 输入框的占位符
                .setValue(this.plugin.settings.mySetting) // 设置输入框的初始值
                .onChange(async (value) => {
                    // 当用户更改设置时，更新插件的设置并保存
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Skip Prefixes')
            .setDesc('Comma-separated list of prefixes to skip')
            .addText(text => text
                .setPlaceholder('Enter prefixes')
                .setValue(this.plugin.settings.skipPrefixes.join(', '))
                .onChange(async (value) => {
                    this.plugin.settings.skipPrefixes = value.split(',').map(s => s.trim());
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Output Directory')
            .setDesc('Directory where the markdown files will be generated')
            .addText(text => text
                .setPlaceholder('Enter output directory')
                .setValue(this.plugin.settings.outputDir)
                .onChange(async (value) => {
                    this.plugin.settings.outputDir = value.trim();
                    await this.plugin.saveSettings();
                }));
    }
}
