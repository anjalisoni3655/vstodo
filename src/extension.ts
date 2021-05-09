// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { isTemplateExpression } from "typescript";
import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { HelloWorldPanel } from "./HelloWorldPanel";
import { SidebarProvider } from "./SidebarProvider";
import { TokenManager } from "./TokenManager";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  TokenManager.globalState = context.globalState;
  //console.log("token value", TokenManager.getToken());
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vstodo" is now active!');

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = "$(file-code) Add todo";
  item.command = "vstodo.addTodo";
  item.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.askQuestion", async () => {
      const answer = await vscode.window.showInformationMessage(
        "How was your day?",
        "good",
        "bad"
      );

      if (answer === "bad") {
        vscode.window.showInformationMessage("Sorry to hear that");
      } else {
        console.log({ answer });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.helloWorld", () => {

     // HelloWorldPanel.createOrShow(context.extensionUri);
      vscode.window.showInformationMessage(
        "token value"+
        TokenManager.getToken()
      );
     //  console.log("token value", TokenManager.getToken());
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.authenticate", () => {
      try {
            authenticate(() => {
             
            });
      }
      catch (err) {
        console.log(err);
        
      }
  
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.addTodo", () => {
      const { activeTextEditor } = vscode.window;
      if (!activeTextEditor) {
        vscode.window.showInformationMessage("No active text editor");
        return;
      }
      const text = activeTextEditor.document.getText(
        activeTextEditor.selection
      );
      //  vscode.window.showInformationMessage("text:"+ text);
      sidebarProvider._view?.webview.postMessage({
        type: "new-todo",
        value: text,
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.refresh", async () => {
      HelloWorldPanel.kill();
      HelloWorldPanel.createOrShow(context.extensionUri);
      await vscode.commands.executeCommand("workbench.action.closeSidebar");
      await vscode.commands.executeCommand(
        "workbench.view.extension.vstodo-sidebar-view"
      );

      setTimeout(() => {
        vscode.commands.executeCommand(
          "workbench.action.webview.openDeveloperTools"
        );
      }, 500);
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
