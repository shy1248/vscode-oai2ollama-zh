import * as vscode from 'vscode';
import { Oai2OllamaService } from './service';
import localize from './i18n/localize';

export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private service: Oai2OllamaService) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        this.statusBarItem.command = 'oai2ollama.statusBarClick';
        this.update();
        this.statusBarItem.show();

        // Listen for service status changes
        this.service.onStatusChange(() => {
            this.update();
        });
    }

    public async handleClick(): Promise<void> {
        const isRunning = this.service.isRunning();
        const config = vscode.workspace.getConfiguration('oai2ollama');
        const port = config.get<number>('port', 11434);
        const host = config.get<string>('host', 'localhost');

        // Create quick pick items based on current status
        const items: vscode.QuickPickItem[] = [];

        if (isRunning) {
            items.push(
                {
                    label: `$(debug-stop) ${localize('quick.stop', 'Stop Service')}`,
                    description: localize('quick.currentlyRunning', 'Currently running on {0}', `${host}:${port}`),
                    detail: localize('quick.stopDetail', 'Stop the Oai2Ollama service')
                },
                {
                    label: `$(debug-restart) ${localize('quick.restart', 'Restart Service')}`,
                    description: localize('quick.restartDesc', 'Restart with current configuration'),
                    detail: localize('quick.restartDetail', 'Stop and start the service again')
                },
                {
                    label: `$(info) ${localize('quick.showStatus', 'Show Status')}`,
                    description: localize('quick.showStatusDesc', 'View detailed status information'),
                    detail: localize('quick.showStatusDetail', 'Open output channel with full status')
                },
                {
                    label: `$(gear) ${localize('quick.openSettings', 'Open Settings')}`,
                    description: localize('quick.openSettingsDesc', 'Configure Oai2Ollama'),
                    detail: localize('quick.openSettingsDetail', 'Open extension settings')
                }
            );
        } else {
            items.push(
                {
                    label: `$(play) ${localize('quick.start', 'Start Service')}`,
                    description: localize('quick.willStart', 'Will start on {0}', `${host}:${port}`),
                    detail: localize('quick.startDetail', 'Start the Oai2Ollama service')
                },
                {
                    label: `$(info) ${localize('quick.showStatus', 'Show Status')}`,
                    description: localize('quick.showStatusDesc', 'View detailed status information'),
                    detail: localize('quick.showStatusDetail', 'Open output channel with full status')
                },
                {
                    label: `$(gear) ${localize('quick.openSettings', 'Open Settings')}`,
                    description: localize('quick.openSettingsDesc', 'Configure Oai2Ollama'),
                    detail: localize('quick.openSettingsDetail', 'Open extension settings')
                }
            );
        }

        // Show quick pick
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: isRunning
                ? localize('quick.placeHolder.running', 'Oai2Ollama Service is Running')
                : localize('quick.placeHolder.stopped', 'Oai2Ollama Service is Stopped'),
            title: localize('quick.title', 'Oai2Ollama Control Panel')
        });

        if (!selected) {
            return;
        }

        // Handle selection
        if (selected.label.includes(localize('quick.start', 'Start Service'))) {
            await vscode.commands.executeCommand('oai2ollama.start');
        } else if (selected.label.includes(localize('quick.stop', 'Stop Service'))) {
            await vscode.commands.executeCommand('oai2ollama.stop');
        } else if (selected.label.includes(localize('quick.restart', 'Restart Service'))) {
            await vscode.commands.executeCommand('oai2ollama.restart');
        } else if (selected.label.includes(localize('quick.showStatus', 'Show Status'))) {
            await vscode.commands.executeCommand('oai2ollama.showStatus');
        } else if (selected.label.includes(localize('quick.openSettings', 'Open Settings'))) {
            await vscode.commands.executeCommand('oai2ollama.openSettings');
        }
    }

    public update(): void {
        const config = vscode.workspace.getConfiguration('oai2ollama');
        const port = config.get<number>('port', 11434);

        if (this.service.isRunning()) {
            this.statusBarItem.text = `$(check) Oai2Ollama :${port}`;
            this.statusBarItem.tooltip = localize('statusBar.runningTooltip', 'Oai2Ollama service is running\nClick for quick actions');
            this.statusBarItem.backgroundColor = undefined;
        } else {
            this.statusBarItem.text = `$(circle-slash) Oai2Ollama`;
            this.statusBarItem.tooltip = localize('statusBar.stoppedTooltip', 'Oai2Ollama service is stopped\nClick for quick actions');
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
