import { log } from 'console';
import { Notice,TFolder,TAbstractFile,TFile } from 'obsidian';

// 全局调试标志
let debugEnabled = true;

// 自定义日志函数
function logMessage(...args: any[]) {
    if (!debugEnabled) return; // 如果禁用了调试，直接返回
    console.log("[FolderNodeLinkPlus] info: ",...args); // 使用展开语法输出多个参数
}

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
    // 通过全局对象访问设置
    logMessage("CreateKnowledgeStructureSummary:开始汇总知识库信息!");
    // 初始化知识架构汇总环境
    let IsInitFinish =   await InitKnowledgeStructureSummaryEnv(currentFile);
    
    if (!IsInitFinish) {
        console.error("Failed to initialize knowledge structure summary environment.");
        return;
    }

    // 初始化目录结构
    const currentFolderDirectoryStructure = await initDirectoryStructure(currentFile);
    if (!currentFolderDirectoryStructure) {
        console.error("Failed to initialize directory structure.", 'error');
        return;
    }

    logMessage(currentFolderDirectoryStructure);

    // 生成对应的 Markdown 文件
    await generateMdFiles(currentFolderDirectoryStructure);
}


// 初始化知识架构汇总环境
export async function InitKnowledgeStructureSummaryEnv(currentFile: TAbstractFile) {
    // 在这里实现创建知识架构汇总的逻辑
    logMessage("InitKnowledgeStructureSummaryEnv:初始化知识架构汇总环境");
    
    const rootPath = '/'; // 根目录路径
    const knowledgeBaseFolderName = mySetting.outputDirName   ; // 知识库汇总文件夹名称
    const knowledgeBaseFolderPath = `${knowledgeBaseFolderName}`;// 知识库汇总文件夹路径没有/

    logMessage("知识库汇总文件夹路径", knowledgeBaseFolderPath);
    // 检查 currentFile.parent 是否为 null
    if (currentFile.parent == null) {
        new Notice("当前文件没有父级目录，无法继续操作。");
        return false;
    }

    const currentFolderName = currentFile.name; // 当前文件/文件夹的名称
    logMessage("当前获取的文件/文件夹名称",currentFile.name);
    // 检查当前文件是否是“知识库汇总”目录
    if (currentFolderName === mySetting.outputDirName) {
        new Notice(`非"${mySetting.outputDirName}"目录下的文件夹才可以创建知识库汇总文件`);
        return false;
    }
    
    logMessage("当前文件/文件夹的父级目录",currentFile.parent.path);
    // 如果文件或文件夹名包含跳过的特定字符串，则跳过
    const shouldSkip = mySetting.skipSpecificNames.some((skipName: string) => currentFolderName.includes(skipName));
    if (shouldSkip) {
        new Notice(`文件/文件夹 "${currentFolderName}" 被跳过，因为它包含跳过的名称.`);
        return false; // 跳过这个文件夹
    }

    const currentFolder = currentFile.parent.path; // 当前文件的父级目录
    logMessage("当前文件的父级目录",currentFolder);
    // 检查当前文件的父级目录是否为根目录
    if (currentFolder !== rootPath) {
        new Notice("只有根目录下的文件夹才可以创建知识库汇总文件");
        return false;
    }


    // 检查是否已经存在“知识库汇总”文件夹
    const knowledgeBaseFolder = this.app.vault.getAbstractFileByPath(mySetting.outputDirName);
    logMessage("知识库汇总文件夹", knowledgeBaseFolder);
    if (!knowledgeBaseFolder) {
        // 如果不存在，创建文件夹
        try {
            await this.app.vault.createFolder(knowledgeBaseFolderPath);
            new Notice(`成功创建知识架构汇总文件夹：${knowledgeBaseFolderName}`);
        } catch (error) {
            console.error("创建知识架构汇总文件夹失败: ", error);
            new Notice("创建知识架构汇总文件夹失败");
        }
    } else {
        // new Notice(`文件夹 "${knowledgeBaseFolderName}" 已经存在`);
    }

    // 在此处可以继续添加关于创建知识架构汇总的其他逻辑
    logMessage("初始化知识架构汇总环境完成Finsih!");
    return true;
}

// 初始化目录结构体
export async function initDirectoryStructure(currentFile: TAbstractFile): Promise<DirectoryStructure | null> {
    console.log("初始化目录结构体");

    // 检查传入的文件是否为文件夹
    const currentFolder = currentFile;
    
    if (!(currentFolder instanceof TFolder)) {
        console.error("currentFile's parent is not a folder.");
        return null;
    }

    // 初始化目录结构
    const directoryStructure = new DirectoryStructure(currentFolder.name);

    // 递归读取文件夹及其子文件夹
    await traverseFolder(currentFolder, directoryStructure,mySetting.skipSpecificNames);

    console.log("Directory structure initialized: ", directoryStructure);
    return directoryStructure;
}

// 递归读取文件夹及其子文件夹的文件
async function traverseFolder(folder: TFolder, directoryStructure: DirectoryStructure, skipSpecificNames: string[]): Promise<void> {
    console.log("递归读取文件夹及其子文件夹的文件");

    for (let child of folder.children) {
        // 如果文件或文件夹名包含跳过的特定字符串，则跳过
        let shouldSkip = skipSpecificNames.some(skipName => child.name.includes(skipName));
        
        if (shouldSkip) {
            console.log(`跳过文件/文件夹: ${child.name}`);
            continue;
        }
        console.log(shouldSkip);

        console.log(`未跳过的文件/文件夹: ${child.name}`);

        if (child instanceof TFile && child.extension === 'md') {
            // 如果是 Markdown 文件，则添加到 mdFiles 数组中
            // 去除 .md 后缀
            const fileNameWithoutExtension = child.name.substring(0, child.name.length - 3); 
            // 添加到 mdFiles 数组中
            directoryStructure.mdFiles.push(fileNameWithoutExtension);
        } else if (child instanceof TFolder) {
            // 如果是子文件夹，则创建子文件夹结构体并递归读取其内容
            const subfolderStructure = new DirectoryStructure(child.name);
            directoryStructure.subfolders.push(subfolderStructure);
            await traverseFolder(child, subfolderStructure, skipSpecificNames);
        }
    }
}

// 生成对应的 Markdown 文件
export async function generateMdFiles(directoryStructure: DirectoryStructure, parentPath: string = "") {
    const knowledgeBaseRoot = mySetting.outputDirName ; // 固定的文件夹名称
    const summaryFolderPath = parentPath ? `${parentPath}/${directoryStructure.folderName}` : `${knowledgeBaseRoot}/${directoryStructure.folderName}`; // 继承父路径

    // 检查是否存在“0-知识库汇总”文件夹及其子文件夹，不存在则创建
    let summaryFolder = this.app.vault.getAbstractFileByPath(summaryFolderPath);
    if (!summaryFolder) {
        await this.app.vault.createFolder(summaryFolderPath);
    }

    // 生成对应的 Markdown 文件
    await createOrUpdateMdFile(directoryStructure, summaryFolderPath);
    
    // 如果存在子文件夹，递归生成子文件夹的 Markdown 文件
    for (let subfolder of directoryStructure.subfolders) {
        await generateMdFiles(subfolder, summaryFolderPath); // 递归传递父文件夹路径
    }
}


// 创建或更新 Markdown 文件
async function createOrUpdateMdFile(directoryStructure: DirectoryStructure, summaryFolderPath: string) {
    const mdFileName = `${summaryFolderPath}/${directoryStructure.folderName}.md`; // 使用完整路径生成 Markdown 文件
    // 检查是否存在目标 Markdown 文件，不存在则创建
    let file = this.app.vault.getAbstractFileByPath(mdFileName);
    if (!file) {
        await this.app.vault.create(mdFileName, '');
        file = this.app.vault.getAbstractFileByPath(mdFileName);
    }

    // 如果文件存在，读取其内容并保留“知识汇总”部分
    let knowledgeSummary = `${mySetting.knowledgeSummary}\n`; // 固定部分
    let fileContent = await this.app.vault.read(file);
    if (file) {
        const existingSummary = extractKnowledgeSummary(fileContent);
        if (existingSummary) {
            knowledgeSummary = knowledgeSummary + existingSummary;
        }
    }

    // 更新“relationship子知识点”和“relationship知识文档”部分
    const subKnowledgePoints = generateSubKnowledgePoints(directoryStructure.subfolders);
    const knowledgeDocuments = generateKnowledgeDocuments(directoryStructure.mdFiles);

    // 合并内容并写回文件
    const newContent = `${knowledgeSummary}\n\n${subKnowledgePoints}\n\n${knowledgeDocuments}`;
    await this.app.vault.modify(file, newContent);
}


function escapeRegExp(string: string): string {
    // 对正则表达式中特殊字符进行转义
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractKnowledgeSummary(content: string): string | null {
    // 对标题进行转义，防止正则表达式中的特殊字符导致问题
    const escapedKnowledgeSummary = escapeRegExp(mySetting.knowledgeSummary);
    const escapedSubKnowledgePoints = escapeRegExp(mySetting.subKnowledgePoints);

    // 构建正则表达式来匹配知识汇总部分
    const summaryRegex = new RegExp(`${escapedKnowledgeSummary}([\\s\\S]*?)${escapedSubKnowledgePoints}`);
    
    // 进行正则匹配
    const match = content.match(summaryRegex);
    
    // 打印调试信息
    console.log("match: ", match);
    console.log("summaryRegex: ", summaryRegex);

    // 返回匹配的内容或 null
    return match ? match[1].trim() : null;
}


// 生成“relationship子知识点”部分
function generateSubKnowledgePoints(subfolders: DirectoryStructure[]): string {
    let subKnowledgePoints = `${mySetting.subKnowledgePoints}\n`; // 使用插件设置中的值
    for (let subfolder of subfolders) {
        subKnowledgePoints += `- [[${subfolder.folderName}]]\n`;
    }
    return subKnowledgePoints;
}

// 生成“relationship知识文档”部分
function generateKnowledgeDocuments(mdFiles: string[]): string {
    let knowledgeDocuments = `${mySetting.knowledgeDocuments}\n`;
    for (let mdFile of mdFiles) {
        knowledgeDocuments += `- [[${mdFile}]]\n`;
    }
    return knowledgeDocuments;
}

