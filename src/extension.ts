declare const process: any;
declare const setTimeout: any;
import * as vscode from 'vscode';
import { Oai2OllamaService } from './service';
import { StatusBarManager } from './statusBar';
import localize from './i18n/localize';

let service: Oai2OllamaService;
let statusBar: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
    console.log(localize('extension.activated', 'Oai2Ollama extension is now active'));

    // Initialize service and status bar
    service = new Oai2OllamaService();
    statusBar = new StatusBarManager(service);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.start', async () => {
            await service.start();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.stop', async () => {
            await service.stop();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.restart', async () => {
            await service.restart();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.showStatus', async () => {
            await service.showStatus();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'oai2ollama');
        })
    );

    // Register status bar click handler
    context.subscriptions.push(
        vscode.commands.registerCommand('oai2ollama.statusBarClick', async () => {
            await statusBar.handleClick();
        })
    );

    // Auto-start if configured
    const config = vscode.workspace.getConfiguration('oai2ollama');
    if (config.get<boolean>('autoStart')) {
        service.start();
    }

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
            if (e.affectsConfiguration('oai2ollama')) {
                statusBar.update();

                // If service is running, prompt to restart
                if (service.isRunning()) {
                    vscode.window.showInformationMessage(
                        localize('configuration.changed.message', 'Oai2Ollama configuration changed. Restart service to apply changes?'),
                        localize('action.restart', 'Restart'),
                        localize('action.later', 'Later')
                    ).then((selection: string | undefined) => {
                        if (selection === localize('action.restart', 'Restart')) {
                            service.restart();
                        }
                    });
                }
            }
        })
    );

    context.subscriptions.push(service);
    context.subscriptions.push(statusBar);
}

export function deactivate() {
    if (service) {
        service.dispose();
    }
    if (statusBar) {
        statusBar.dispose();
    }
}
