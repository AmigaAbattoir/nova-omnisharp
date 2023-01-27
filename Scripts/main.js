var langserver = null;

exports.activate = function() {
    // Do work when the extension is activated
    langserver = new CSharpLanguageServer();
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
    if (langserver) {
        langserver.deactivate();
        langserver = null;
    }
}

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

class CSharpLanguageServer {
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
        //var omniSharpLocation = nova.path.join(nova.extension.path,"omnisharp-osx");
        var omniSharpLocation = nova.path.join(nova.extension.path,"omnisharp-osx-1.39.4");
        //var omniSharpLocation = nova.extension.path + "/ms-dotnettools.csharp-1.21.17/.omnisharp/1.35.0";

        if (!path) {
            path = omniSharpLocation + "/run";
        }

        var isUnityProject = true;

        var solutionPath = nova.workspace.path;

        console.log("[C#] Start()    EXTENSION'S PATH: " + path );
        console.log("[C#] Start()  OmniSharp Location: " + omniSharpLocation);
        console.log("[C#] Start()   Solution Location: " + solutionPath);

        var env = {};
        if(isUnityProject) {
            env = {FrameworkPathOverride: "/Library/Frameworks/Mono.framework/Versions/Current"};
        }

        var args = new Array;
        args.push("-s");
        args.push(solutionPath);
/*
        args.push("-v");
        args.push("Verbose");
        args.push("-debug");
        args.push("--stdio");
*/
        args.push("-lsp");
        ///args.push("--hostPID");

        if(isUnityProject) {
            args.push("omnisharp.useModernNet:false");
            args.push("omnisharp.useGlobalMono:always");
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
            syntaxes: ['c#'],
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

