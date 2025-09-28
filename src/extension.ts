import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

interface DocumentData {
    file_path: string;
    file_type: string;
    pages?: Array<{
        page_number: number;
        text: string;
        char_count: number;
    }>;
    paragraphs?: Array<{
        paragraph_number: number;
        text: string;
        char_count: number;
        style: string;
    }>;
    full_text: string;
    metadata: Record<string, any>;
    page_count?: number;
    paragraph_count?: number;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('PDF/DOCX Reader extension loaded');

    // Register commands
    const commands = [
        vscode.commands.registerCommand('pdfDocxReader.readFile', () => readFile('default')),
        vscode.commands.registerCommand('pdfDocxReader.readFileAsText', () => readFile('text')),
        vscode.commands.registerCommand('pdfDocxReader.readFileAsJson', () => readFile('json')),
        vscode.commands.registerCommand('pdfDocxReader.batchProcessFiles', batchProcessFiles),
        // AI-specific commands
        vscode.commands.registerCommand('pdfDocxReader.readFileForAI', (filePath: string) => readFileForAI(filePath)),
        vscode.commands.registerCommand('pdfDocxReader.getDocumentSummary', (filePath: string) => getDocumentSummary(filePath))
    ];

    commands.forEach(command => context.subscriptions.push(command));

    // Watch for new PDF/DOCX files
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{pdf,docx}');
    fileWatcher.onDidCreate(uri => {
        vscode.window.showInformationMessage(`Found new PDF/DOCX file: ${path.basename(uri.fsPath)}`);
    });
    context.subscriptions.push(fileWatcher);
}

async function readFile(outputFormat: 'default' | 'text' | 'json' = 'default') {
    try {
        // Get file from user selection or current editor
        let fileUri: vscode.Uri | undefined;

        if (vscode.window.activeTextEditor) {
            const currentFile = vscode.window.activeTextEditor.document.uri;
            const ext = path.extname(currentFile.fsPath).toLowerCase();
            if (ext === '.pdf' || ext === '.docx') {
                fileUri = currentFile;
            }
        }

        if (!fileUri) {
            fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectMany: false,
                filters: {
                    'Documents': ['pdf', 'docx']
                },
                title: 'Select PDF or DOCX file to read'
            }).then(uris => uris?.[0]);
        }

        if (!fileUri) {
            return;
        }

        const filePath = fileUri.fsPath;
        const fileName = path.basename(filePath);

        // Check file size
        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        const maxSize = vscode.workspace.getConfiguration('pdfDocxReader').get<number>('maxFileSize', 50);

        if (fileSizeMB > maxSize) {
            const proceed = await vscode.window.showWarningMessage(
                `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxSize}MB). Continue anyway?`,
                'Yes', 'No'
            );
            if (proceed !== 'Yes') {
                return;
            }
        }

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Reading ${fileName}...`,
            cancellable: true
        }, async (progress, token) => {
            try {
                const data = await readDocumentFile(filePath, outputFormat, progress, token);
                await displayDocumentContent(data, fileName, outputFormat);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to read file: ${error}`);
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}

async function readDocumentFile(
    filePath: string, 
    outputFormat: string, 
    progress: vscode.Progress<{ message?: string; increment?: number }>,
    token: vscode.CancellationToken
): Promise<DocumentData> {
    return new Promise((resolve, reject) => {
        const config = vscode.workspace.getConfiguration('pdfDocxReader');
        const pythonPath = config.get<string>('pythonPath', 'python');
        const format = outputFormat === 'default' ? config.get<string>('outputFormat', 'json') : outputFormat;

        // Call the Python script
        const scriptPath = path.join(__dirname, '..', '..', 'pdf_docx_reader.py');
        
        progress.report({ message: 'Starting Python process...' });

        const pythonProcess = spawn(pythonPath, [scriptPath, filePath, '--output-format', format], {
            cwd: path.dirname(scriptPath)
        });

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const data = JSON.parse(stdout);
                    resolve(data);
                } catch (parseError) {
                    reject(new Error(`Failed to parse output: ${parseError}`));
                }
            } else {
                reject(new Error(`Python process failed: ${stderr}`));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(new Error(`Failed to start Python process: ${error.message}`));
        });

        // Handle cancellation
        token.onCancellationRequested(() => {
            pythonProcess.kill();
            reject(new Error('Operation cancelled'));
        });
    });
}

async function displayDocumentContent(data: DocumentData, fileName: string, outputFormat: string) {
    const config = vscode.workspace.getConfiguration('pdfDocxReader');
    const showMetadata = config.get<boolean>('showMetadata', true);

    let content = '';
    let language = 'plaintext';

    if (outputFormat === 'json' || outputFormat === 'default') {
        // Create a formatted JSON display
        const displayData = {
            file: fileName,
            type: data.file_type,
            content: data.full_text,
            ...(showMetadata && { metadata: data.metadata }),
            ...(data.file_type === 'PDF' && { pageCount: data.page_count }),
            ...(data.file_type === 'DOCX' && { paragraphCount: data.paragraph_count })
        };

        content = JSON.stringify(displayData, null, 2);
        language = 'json';
    } else {
        // Create a formatted text display
        content = `File: ${fileName}\n`;
        content += `Type: ${data.file_type}\n`;
        
        if (data.file_type === 'PDF') {
            content += `Pages: ${data.page_count}\n`;
        } else if (data.file_type === 'DOCX') {
            content += `Paragraphs: ${data.paragraph_count}\n`;
        }

        if (showMetadata && data.metadata) {
            content += `\nMetadata:\n`;
            for (const [key, value] of Object.entries(data.metadata)) {
                if (value) {
                    content += `  ${key}: ${value}\n`;
                }
            }
        }

        content += `\nContent:\n${data.full_text}`;
    }

    // Create and show document
    const doc = await vscode.workspace.openTextDocument({
        content: content,
        language: language
    });

    await vscode.window.showTextDocument(doc);

    // Show summary
    const summary = `Successfully read ${fileName}: ${data.full_text.length} characters`;
    vscode.window.showInformationMessage(summary);
}

async function batchProcessFiles() {
    try {
        const files = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: true,
            filters: {
                'Documents': ['pdf', 'docx']
            },
            title: 'Select PDF/DOCX files to process'
        });

        if (!files || files.length === 0) {
            return;
        }

        const results: Array<{file: string, success: boolean, error?: string, contentLength?: number}> = [];

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Processing ${files.length} files...`,
            cancellable: true
        }, async (progress, token) => {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = path.basename(file.fsPath);
                
                progress.report({
                    message: `Processing ${fileName} (${i + 1}/${files.length})`,
                    increment: 100 / files.length
                });

                try {
                    const data = await readDocumentFile(file.fsPath, 'json', progress, token);
                    results.push({
                        file: fileName,
                        success: true,
                        contentLength: data.full_text.length
                    });
                } catch (error) {
                    results.push({
                        file: fileName,
                        success: false,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }

                if (token.isCancellationRequested) {
                    break;
                }
            }
        });

        // Display results
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        let resultContent = `Batch Processing Results\n`;
        resultContent += `========================\n\n`;
        resultContent += `Total files: ${results.length}\n`;
        resultContent += `Successful: ${successCount}\n`;
        resultContent += `Failed: ${failureCount}\n\n`;

        resultContent += `Details:\n`;
        results.forEach(result => {
            if (result.success) {
                resultContent += `✓ ${result.file}: ${result.contentLength} characters\n`;
            } else {
                resultContent += `✗ ${result.file}: ${result.error}\n`;
            }
        });

        const doc = await vscode.workspace.openTextDocument({
            content: resultContent,
            language: 'plaintext'
        });

        await vscode.window.showTextDocument(doc);

        vscode.window.showInformationMessage(
            `Batch processing complete: ${successCount} successful, ${failureCount} failed`
        );

    } catch (error) {
        vscode.window.showErrorMessage(`Batch processing failed: ${error}`);
    }
}

// AI-specific functions for easier integration
async function readFileForAI(filePath: string): Promise<DocumentData | null> {
    try {
        const data = await readDocumentFile(filePath, 'json', 
            { report: () => {} }, 
            { isCancellationRequested: false, onCancellationRequested: () => { return { dispose: () => {} }; } }
        );
        return data;
    } catch (error) {
        console.error(`AI read error: ${error}`);
        return null;
    }
}

async function getDocumentSummary(filePath: string): Promise<string> {
    try {
        const data = await readFileForAI(filePath);
        if (!data) return 'Failed to read document';
        
        const summary = {
            file: path.basename(filePath),
            type: data.file_type,
            size: data.full_text.length,
            pages: data.page_count || data.paragraph_count || 0,
            metadata: data.metadata
        };
        
        return JSON.stringify(summary, null, 2);
    } catch (error) {
        return `Error: ${error}`;
    }
}

export function deactivate() {
    console.log('PDF/DOCX Reader extension is now deactivated');
}
