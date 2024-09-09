import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';
// 写入内容的函数
function WriteContentToHeadMdFile(CurrentHeadmdFilePath: string, CurrentfolderPath: string) {
    console.log('插桩:.....a.',CurrentfolderPath);
    const rootPath = this.app.vault.adapter.basePath;
    const parentDir = path.dirname(CurrentfolderPath);
    console.log('插桩:......');
    // 读取当前文件夹下的所有 .md 文件
    fs.readdir(CurrentfolderPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('读取文件夹失败:', err);
            return;
        }

        let contentToWrite = '';

        // 如果当前文件夹的上一级是根文件夹
        if (parentDir === rootPath) {
            // 只添加当前文件夹下的 .md 文件链接
            files.forEach(file => {
                if (file.isFile() && path.extname(file.name) === '.md'  ) {
                    contentToWrite += `\n[[${file.name}]]`;
                }
            });
        } else {
            // 先添加上一级文件夹的 head_ 文件链接
            const parentHeadFilePath = path.join(parentDir, 'head_' + path.basename(parentDir) + '.md');
            if (fs.existsSync(parentHeadFilePath)) {
                contentToWrite += `##### 上一级文件\n[[${path.basename(parentHeadFilePath, '.md')}]]\n##### 当前目录下的文件`;
            }

            // 再添加当前文件夹下的 .md 文件链接
            files.forEach(file => {
                if (file.isFile() && path.extname(file.name) === '.md' && file.name !== path.basename(CurrentHeadmdFilePath)) {
                    contentToWrite += `\n[[${file.name}]]`;
                }
            });
        }

        // 写入内容到当前的 head_ 文件
        fs.writeFile(CurrentHeadmdFilePath, contentToWrite, (err) => {
            if (err) {
                console.error('写入内容失败:', err);
            } else {
                console.log('写入内容成功:', CurrentHeadmdFilePath);
            }
        });
    });
}

// 定义插件设置的接口，包含一个设置项 `mySetting`
interface MyPluginSettings {
    mySetting: string;
}

// 设置的默认值，`mySetting` 的初始值为 'default'
const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}

// 插件的主类，继承自 Obsidian 的 `Plugin` 类
export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    // 插件加载时调用
    async onload() {
        // 加载插件的设置
        await this.loadSettings();

        const ribbonIconEl = this.addRibbonIcon('dice', 'MakePlugs', async (evt: MouseEvent) => {
            //头文件的文件名字符串 
            const HeadMdNameString = "head_"


            // 当用户点击图标时，显示通知
            new Notice('开始扫描文件夹并创建文件...');

            // 指定要扫描的文件夹路径
            const folderPath = this.app.vault.adapter.basePath; // 获取 Obsidian 文档的根路径

            // 使用 Node.js 的 fs 模块来读取文件夹内容
            const fs = require('fs');
            const path = require('path');

            // 递归函数，用于遍历文件夹并创建对应的 .md 文件
            const createMdFiles = (currentPath) => {
                fs.readdir(currentPath, { withFileTypes: true }, (err, files) => {
                    if (err) {
                        console.error('读取文件夹失败:', err);
                        return;
                    }

                    // 遍历文件夹中的每个文件/文件夹
                    files.forEach(file => {
                        const filePath = path.join(currentPath, file.name);

                        // 检查是否是文件夹
                        if (file.isDirectory()) {
                            // 跳过以 . 或 Br开头的文件夹
                            if (file.name.startsWith('.') | file.name.startsWith('Br')) {
                                console.log('跳过隐藏文件夹:', filePath);
                                return;
                            }

                            // 创建以文件夹名命名的 .md 文件
                            const mdFilePath = path.join(filePath, HeadMdNameString + file.name + '.md');
                            console.log('创建文件:', mdFilePath);
                            // 检查是否已经存在对应的 .md 文件
                            if (!fs.existsSync(mdFilePath)) {
                                fs.writeFile(mdFilePath, `# ${file.name}`, (err) => {
                                    if (err) {
                                        console.error('创建文件失败:', err);
                                    } else {
                                        console.log('创建文件成功:', mdFilePath);
                                    }
                                });
                            } else {
                                console.log('文件已存在:', mdFilePath);
                            }

                            console.log('调用追加内容的函数:');
                            // 调用追加内容的函数
                            const AddContext = HeadMdNameString + file.name;
                            const CurrentfolderPath = filePath;
                            const CurrentHeadmdFilePath = mdFilePath;
                            WriteContentToHeadMdFile(CurrentHeadmdFilePath, CurrentfolderPath);


                            // 递归调用，继续处理子文件夹
                            createMdFiles(filePath);
                        }
                    });
                });
            };

            // 从根路径开始递归处理
            createMdFiles(folderPath);
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

        // 监听 Obsidian 的全局事件
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            // 检查点击的目标是否是“新建文件夹”按钮
            const target = evt.target as HTMLElement;
            if (target.matches('.nav-action-button[aria-label="新建文件夹"]')) {
                console.log('New folder button clicked');
            }
        });

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
    }
}
