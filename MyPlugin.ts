// MyPlugin.ts
import { Notice } from 'obsidian';
import * as path from 'path';
import * as fs from 'fs';

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

export function readDirectoryStructure(rootPath: string, skipPrefixes: string[]): DirectoryStructure {
    const directory = new DirectoryStructure(path.basename(rootPath));

    const files = fs.readdirSync(rootPath, { withFileTypes: true });
    files.forEach(file => {
        const filePath = path.join(rootPath, file.name);
        if (file.isDirectory()) {
            // 跳过以 `.` 开头的文件夹
            if (file.name.startsWith('.')) {
                return;
            }
            // 跳过以特定前缀开头的文件夹
            if (skipPrefixes.some(prefix => file.name.startsWith(prefix))) {
                return;
            }
            // 递归读取子文件夹的结构
            const subDirectory = readDirectoryStructure(filePath, skipPrefixes);
            directory.subfolders.push(subDirectory);
        } else if (file.isFile() && path.extname(file.name) === '.md') {
            directory.mdFiles.push(file.name);
        }
    });

    return directory;
}

export function generateMdFiles(directoryStructure: DirectoryStructure, outputDirName: string) {
    const rootPath = app.vault.adapter.basePath;
    console.log(`开始生成文件: ${outputDirName}`);
    const outputDir = path.join(rootPath, outputDirName);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, directoryStructure.folderName + '.md');
    let existingContent = '';
    let introSection = '';

    // 检查文件是否存在，并提取现有的 ## 简介 部分的内容
    if (fs.existsSync(outputPath)) {
        existingContent = fs.readFileSync(outputPath, 'utf8');
        const introStart = existingContent.indexOf('## 简介\n');
        if (introStart !== -1) {
            const introEnd = existingContent.indexOf('\n## relationship', introStart + 5);
            introSection = introEnd === -1 ? existingContent.substring(introStart) : existingContent.substring(introStart, introEnd);
        }
    }

    let content = `# ${directoryStructure.folderName}\n\n`;
    content += introSection || '## 简介\n\n'; // 如果没有简介，提供一个默认部分

    if (directoryStructure.subfolders.length > 0) {
        content += '\n## relationship子文件夹\n';
        directoryStructure.subfolders.forEach(subfolder => {
            content += `- [[${subfolder.folderName}]]\n`;
        });
        content += '\n';
    }

    if (directoryStructure.mdFiles.length > 0) {
        content += '\n## relationship文件\n';
        directoryStructure.mdFiles.forEach(mdFile => {
            content += `- [[${mdFile}]]\n`;
        });
        content += '\n';
    }

    directoryStructure.subfolders.forEach(subfolder => {
        generateMdFiles(subfolder, outputDirName);
    });

    fs.writeFileSync(outputPath, content);
    console.log(`生成文件并且触发修改事件: ${outputPath}`);
    app.vault.trigger('modify', outputPath);
}
