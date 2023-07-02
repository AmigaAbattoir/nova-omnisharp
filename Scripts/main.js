var langserver = null;

exports.activate = function() {
    // Do work when the extension is activated
    langserver = new CSharpLanguageServer();
/*
    nova.commands.register("csharp.restart", (editor) => {
        console.log("Called... Omnisharp Restart!");
        langserver.start("");
    });
    */
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
    if (langserver) {
        langserver.deactivate();
        langserver = null;
    }
}

nova.commands.register("csharp.restart", (editor) => {
    console.log("Restarting Omnisharp!");
    langserver.stop();
    langserver = new CSharpLanguageServer();
});

nova.commands.register("csharp.unitynova", (editor) => {
    console.log("Copying UnityNova...");
    nova.fs.copy( nova.path.join(nova.extension.path, "UnityNova/DerivedData/UnityNova/Build/Products/Debug/UnityNova"), "/usr/local/bin/UnityNova" );
});

/**
 * Tell if the current file is being used in a workspace setting or as a independent editor window
 *
 * @see https://github.com/jasonplatts/nova-todo/blob/main/Scripts/functions.js
 * @returns {boolean}  - representing whether or not the current environment is a workspace or
 * Nova window without a workspace.
 */
function isWorkspace() {
    if (nova.workspace.path == undefined || nova.workspace.path == null) {
        // Opening single file in a Nova editor does not define a workspace. A project must exist.
        // Opening a remote server environment is also not considered a workspace.
        return false
    } else {
        // A local project is the only environment considered a Nova workspace.
        return true
    }
}

/* ---- Config Functions ---- */
function getConfig(configName) {
    return nova.config.get(configName);
}

function getWorkspaceOrGlobalConfig(configName) {
    var config = nova.config.get(configName);
    console.log("*** getWorkspaceOrGlobalConfig() Config " + configName + " is [" + config + "]");
    if(isWorkspace()) {
        workspaceConfig = nova.workspace.config.get(configName)
    console.log("*** getWorkspaceOrGlobalConfig() Workspace Config " + configName + " is [" + workspaceConfig + "]");
        if(workspaceConfig) {
            config = workspaceConfig;
        }
    }
    console.log("*** getWorkspaceOrGlobalConfig() RETURNING [" + config + "]");
    return config;
}

function setIfConfigIsSet(configName) {
    var check = getWorkspaceOrGlobalConfig(configName);
    if(check!=null) {
        return configName + ":" + check;
    }
    return null;
}

/* ---- Main Extension things...  ---- */
/*
class CSharpCommands {
    constructor(client) {
        this.client = client;
    }

    loadWorkspaceAuto() {
        console.log("[C#] Loading workspace");
        const params = {
            Directory: nova.workspace.path,
            Deep: 2,
            ExludedDirs: []
        }
    }
}
*/

class CSharpLanguageServer {
    languageClient = null;

    constructor() {
        // Observe the configuration setting for the server's location, and restart the server on change
        nova.config.observe('example.language-server-path', function(path) {
            this.start(path);
        }, this);
    }

    deactivate() {
        this.stop();
    }

    start(path) {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }

        console.log("[C#]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
        //var lspPath = nova.path.join(nova.extension.path,"omnisharp-osx");
        var lspPath = getWorkspaceOrGlobalConfig("csharp.language-server-path");
        if(lspPath==null || lspPath=="") {
            lspPath = nova.path.join(nova.extension.path,"omnisharp-osx-1.39.6");
        }
        path = lspPath + "/run";

        var solutionPath = nova.workspace.path;

        console.log("[C#] Start()    EXTENSION'S PATH: " + path );
        console.log("[C#] Start()  OmniSharp Location: " + lspPath);
        console.log("[C#] Start()   Solution Location: " + solutionPath);

        var s = getWorkspaceOrGlobalConfig("omnisharp.monoPath");

        var env = {};
        if(isUnityProject) {
//            env = {FrameworkPathOverride: "/Library/Frameworks/Mono.framework/Versions/Current"};
        }

        var args = new Array;
        args.push("-s");
        args.push(solutionPath);
/*
        args.push("-v");
        args.push("Verbose");
        args.push("-debug");
        args.push("--stdio");
        args.push("-lsp");
*/
        args.push("--languageserver");
        ///args.push("--hostPID");

        // If there is a Unity project, let's override some things

        var isUnityProject = false;
        if(getConfig("csharp.detectUnity")) {
            /** @TODO Look if we find a "Unity*.csproj" in the workspace */
            isUnityProject = true
        }
        if(isUnityProject) {
            // If we are in a workspace
            if(isWorkspace()) {
                // But make sure it's not the actual extension while we are developing!
                if(nova.workspace.path!=nova.extension.path) {
                    nova.workspace.config.set("omnisharp.useModernNet",false);
                }
            }
            args.push("omnisharp.useModernNet:false");
            args.push("omnisharp.useGlobalMono:always");
            args.push("omnisharp.useMono:true"); // ?? Needed?!
            args.push("omnisharp.monoPath:/Library/Frameworks/Mono.framework/Versions/Current");
        } else {
            args.push("omnisharp.useModernNet:" + getWorkspaceOrGlobalConfig("omnisharp.useModernNet"));
        }

        args.push("csharp.suppressHiddenDiagnostics: true");

        if(setIfConfigIsSet("omnisharp.analyzeOpenDocumentsOnly")!=null) {
            args.push(setIfConfigIsSet("omnisharp.analyzeOpenDocumentsOnly"));
        }
        if(setIfConfigIsSet("omnisharp.enableRoslynAnalyzers")!=null) {
            args.push(setIfConfigIsSet("omnisharp.enableRoslynAnalyzers"));
        }
        if(setIfConfigIsSet("omnisharp.projectFilesExcludePattern")!=null) {
            args.push(setIfConfigIsSet("omnisharp.projectFilesExcludePattern"));
        }
        if(setIfConfigIsSet("omnisharp.loggingLevel")!=null) {
            args.push(setIfConfigIsSet("omnisharp.loggingLevel"));
        }
        if(setIfConfigIsSet("omnisharp.enableAsyncCompletion")!=null) {
            args.push(setIfConfigIsSet("omnisharp.enableAsyncCompletion"));
        }
        if(setIfConfigIsSet("omnisharp.analyzeOpenDocumentsOnly")!=null) {
            args.push(setIfConfigIsSet("omnisharp.analyzeOpenDocumentsOnly"));
        }

        // @TODO Should take options and add them to the command line? Can we do a JSON file?
       if(nova.inDevMode()) {
            console.log(" *** PATH:: \\/\\/\\/\n" + path + "\n *** PATH:: /\\/\\/\\");
            var argsOut = "";
            args.forEach(a => argsOut += a + " ");
            console.log(" *** ARGS:: \\/\\/\\/\n" + argsOut + "\n *** ARGS:: /\\/\\/\\");
        }

        // Create the client
        var serverOptions = {
            path: path,
            args: args,
            env:  env,
            type: "stdio",
        };
        var clientOptions = {
            // The set of document syntaxes for which the server is valid
            syntaxes: ['csharp'],
            initializationOptions: {
                "AutomaticWorkspaceInit": true,
            },
            debug: true,
        };

        var client = new LanguageClient('CSharp', 'C Sharp Language Server', serverOptions, clientOptions);
        try {
            if (nova.inDevMode()) {
                console.log("[C#] Start() Trying...");
            }
            // Start the client
            client.start();

            client.onDidStop(function(error) {
               console.log("*** [C#] onDidStop() ERROR: " + error + " ***");
            });
/*
*/
            nova.subscriptions.add(client);
            this.languageClient = client;

            if (nova.inDevMode()) {
                console.log("[C#] Start()  Completed at ",new Date());
            }
        }
        catch (err) {
            // If the .start() method throws, it's likely because the path to the language server is invalid
            if (nova.inDevMode()) {
                console.log("[C#] Start() CATCH!");
                console.error(err);
            }
        }
    }

    stop() {
        console.log("[C#] Stop()  this.languageClient: ",this.languageClient);
        if (this.languageClient) {
            //this.languageClient.process.signal("SIGINT");
            console.log("[C#]  this.languageClient should be stopped...");
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
            this.languageClient = null;
        }
    }
}

function rangeToLspRange(document, range) {
    console.log("DOCUMENT: ");
    consoleLogObject(document);

    const fullContents = document.getTextInRange(new Range(0, document.length));

    let chars = 0;
    let startLspRange;

    const lines = fullContents.split(document.eol);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const lineLength = lines[lineIndex].length + document.eol.length;
        if (!startLspRange && chars + lineLength >= range.start) {
            const character = range.start - chars;
            startLspRange = { line: lineIndex, character };
        }
        if (startLspRange && chars + lineLength >= range.end) {
            const character = range.end - chars;
            return {
                start: startLspRange,
                end: { line: lineIndex, character },
            };
        }
        chars += lineLength;
    }
    return null;
};

function consoleLogObject(object) {
    console.log(JSON.stringify(object));
}

nova.commands.register("csharp.hovertest", (editor) => {
    if (nova.inDevMode()) { console.log("Called... csharp.hovertest"); }

    if(langserver) {
        var position = rangeToLspRange(nova.workspace.activeTextEditor.document, nova.workspace.activeTextEditor.selectedRange);
        console.log("Selectd Range:");
        console.log(nova.workspace.activeTextEditor.selectedRange);
        consoleLogObject( nova.workspace.activeTextEditor.selectedRange);
        console.log("POSITION:");
        consoleLogObject(position);

        //langserver.languageClient.sendRequest("textDocument/hover", {
        langserver.languageClient.sendRequest("textDocument/quickinfo", {
            fileName: nova.workspace.activeTextEditor.document.uri,
            //position: position.start
            line: position.start.line,
            column: position.start.character
        }).then((result) => {
            if(result!==true) {
                showNotification("Hover Test", result.contents.value);
            }
        }, (error) => {
            showNotification("Hover Test ERROR!", error);
            consoleLogObject(error);
        });
    }
});