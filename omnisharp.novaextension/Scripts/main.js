var langserver = null;

/**
 * Show a notification with the given title and body when in dev mode.
 *
 * @param {string} title - Title of window
 * @param {string} body - Text in the body
 */
function showNotification(title, body) {
	var request = new NotificationRequest("omnisharp-for-nova-message");

	request.title = nova.localize(title);
	request.body = nova.localize(body);
	nova.notifications.add(request);
}

/**
 * Do work when the extension is activated
 */
exports.activate = function() { langserver = new OmniSharpLanguageServer(); }

/**
 * Clean up state before the extension is deactivated
 */
exports.deactivate = function() {
	if (langserver) {
		langserver.deactivate();
		langserver = null;
	}
}

nova.commands.register("omnisharp.restart", (editor) => {
	showNotification("OmniSharp", "Restarting language server...")
	langserver.stop();
	langserver = new OmniSharpLanguageServer();
});

nova.commands.register("unitynova.install", (editor) => {
	showNotification("UnityNova", "Attempting to copy UnityNova... If that doesn't work, you will need to try this from terminal:\n\n" + "sudo cp \"" + nova.path.join(nova.extension.path, "UnityNova") + "\" /usr/local/bin/UnityNova\n");
	nova.fs.copy( nova.path.join(nova.extension.path, "UnityNova"), "/usr/local/bin/UnityNova" );
});

/**
 * Stringifies an object so we can print it out in console
 * @param {object} object - The object that you want to log out
 */
function consoleLogObject(object) { console.log(JSON.stringify(object)); }

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
/**
 * Returns the configuration value
 * @param {string} configName - Which config to get
 */
function getConfig(configName) { return nova.config.get(configName); }

/**
 * Gets either the global configuration, or the one for the project in that order
 * @param {string} configName - Which configuration to get
 */
function getWorkspaceOrGlobalConfig(configName) {
	var config = nova.config.get(configName);
	if(nova.inDevMode()) {
		console.log("*** getWorkspaceOrGlobalConfig() Config " + configName + " is [" + config + "]");
	}
	if(isWorkspace()) {
		workspaceConfig = nova.workspace.config.get(configName)
		if(nova.inDevMode()) {
			console.log("*** getWorkspaceOrGlobalConfig() Workspace Config " + configName + " is [" + workspaceConfig + "]");
		}
		if(workspaceConfig) {
			config = workspaceConfig;
		}
	}

	if(config!=null) {
/*
		if(typeof config === "string" && config.indexOf(" ")!==-1) {
			config = "\"" + config + "\"";
			console.log(" --- Adding quotes around config! ---");
		}
*/
    }

    if(nova.inDevMode()) {
        console.log("*** getWorkspaceOrGlobalConfig() " + configName + " = [" + config + "]");
    }
    return config;
}

/**
 * Converts configuration to OmniSharp config
 * @param {string} configName - Which config to get
 */
function setIfConfigIsSet(configName) {
    var check = getWorkspaceOrGlobalConfig(configName);
    if(check!=null) {
        return configName + ":" + check;
    }
    return null;
}

/**
 * These are the OmniSharp setting to check and pass at startup
 * @type {Array}
 */
var settingsToCheck = [
    // "omnisharp.monoPath", // Handled before looping
    "omnisharp.analyzeOpenDocumentsOnly",
    "omnisharp.autoStart",
    //"omnisharp.defaultLaunchSolution", // @TODO Needs to be used inplace of looking through the project folder
    "omnisharp.disableMSBuildDiagnosticWarning",
    "omnisharp.dotNetCliPaths",
    "omnisharp.dotnetPath",
    "omnisharp.enableAsyncCompletion",
    "omnisharp.enableDecompilationSupport",
    //"omnisharp.enableEditorConfigSupport", // @TODO Needs more work
    "omnisharp.enableImportCompletion",
    "omnisharp.enableMsBuildLoadProjectsOnDemand",
    "omnisharp.enableRoslynAnalyzers",
    "omnisharp.loggingLevel",
    "omnisharp.maxFindSymbolsItems",
    "omnisharp.maxProjectResults",
    "omnisharp.minFindSymbolsFilterLength",
    "omnisharp.organizeImportsOnFormat",
    //"omnisharp.path", // Handled at startup
    "omnisharp.projectFilesExcludePattern",
    "omnisharp.projectLoadTimeout",
    "omnisharp.sdkIncludePrereleases",
    "omnisharp.sdkPath",
    "omnisharp.sdkVersion",
    //"omnisharp.testRunSettings", // @TODO Needs more work
    //"omnisharp.useEditorFormattingSettings", // @TODO Needs more work
    //"omnisharp.useModernNet",    // Handled with Unity Check
    //"omnisharp.waitForDebugger", // Handled with startup
]

/**
 * These are the OmniSharp setting to check but, only if we are not detecting Unity projects
 * @type {Array}
 */
var settingsToCheckNotUsingUnityCheck = [
    "omnisharp.useModernNet",
    "omnisharp.useGlobalMono",
    "omnisharp.useMono",
    "omnisharp.monoPath"
]

/**
 * The main class for our LSP!
 */
class OmniSharpLanguageServer {
    languageClient = null;

	constructor() {
		// Observe the configuration setting for the server's location, and restart the server on change
		/*
		nova.config.observe('example.language-server-path', function(path) {
			this.start(path);
		}, this);
		*/
		this.start("");
	}

	deactivate() { this.stop(); }

	start(path) {
		// Make sure that the LSP is stopped before trying to start again!
		console.log("[OmniSharp]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
		if (this.languageClient) {
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
		}

		console.log("[OmniSharp]-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
		var lspPath = getWorkspaceOrGlobalConfig("omnisharp.path");
		// If the lspPath is empty or null, use the embedded OmniSharp!
		if(lspPath==null || lspPath=="") {
			lspPath = nova.path.join(nova.extension.path,"omnisharp-osx-1.39.6");
		}
		// Use the run command
		path = lspPath + "/run";

		var solutionPath = nova.workspace.path;

		if(nova.inDevMode()) {
			console.log("[OmniSharp] Start()    EXTENSION'S PATH: " + path );
			console.log("[OmniSharp] Start()  OmniSharp Location: " + lspPath);
			console.log("[OmniSharp] Start()   Solution Location: " + solutionPath);
		}

		var solutions = [];
		var foundUnity = false;

		var skipDirectories = [ ".git",".nova","Temp"];

		/**
		* Recurses through directory to find files like the ".sln" and a project that starts with "UnityEditor"
		* @param {object} dir - The directory to search in
		*/
		function findInDir(dir) {
			nova.fs.listdir(dir).forEach(function(filename) {
				if(!skipDirectories.includes(filename)) {
					if(nova.fs.stat(dir + "/" + filename).isFile()) {
						// Check to find the .sln file to pass to OmniSharp
						if(filename.endsWith(".sln")) {
							solutions.push(dir);// + "/");// + filename);
							if(nova.inDevMode()) {
								console.log("We found the solution file: " + dir + "/" + filename + "!");
							}
						}
						// Checks to see if we have an .csproj files with UnityEditor, so we know how to change settings!
						if(filename.startsWith("UnityEditor") && filename.endsWith(".csproj")) {
							foundUnity = true;
							if(nova.inDevMode()) {
								console.log(" We found the a UnityEditor project file!");
							}
						}
					} else {
						findInDir(dir + "/" + filename);
					}
				}
			});
		}
		findInDir(nova.workspace.path);

		// If no solution is found, just use the project path
		if(nova.inDevMode()) {
			consoleLogObject(solutions);
		}
		if(solutions.length<1) {
			solutions.push(nova.workspace.path);
		}

		var env = {};
		var args = new Array;
		args.push("-s");
		args.push(solutions[0]);
        //args.push( "\"" + solutions[0] + "\"");
/*
		args.push("-v");
		args.push("Verbose");
		args.push("-debug");
		args.push("--stdio");
		args.push("-lsp");
*/
		var waitForDebugger = getWorkspaceOrGlobalConfig("omnisharp.waitForDebugger");
		if(waitForDebugger) {
			args.push("-debug");
		}

		args.push("--languageserver");
		//args.push("--hostPID");

		// Unity detection
		var isUnityProject = false;
		if(getConfig("csharp.detectUnity")) {
			if(nova.inDevMode()) { console.log("Use detectUnity! " + foundUnity); }
			isUnityProject = foundUnity;
		}

		// If there is a Unity project, and the config for detectUnity is set, let's override some things
		if(isUnityProject) {
			// If we are in a real workspace (not developing)
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
			showNotification("OmniSharp for Nova","Unity project detected. This may take a long time before issues complete and code completion is available!");
		} else {
			var settingCheck;
			// Loop through all the non-Unity settings and add them to the list
			settingsToCheckNotUsingUnityCheck.forEach(function(setting) {
				settingCheck = setIfConfigIsSet(setting);
				if(settingCheck!=null) {
					args.push(settingCheck);
				}
			});
		}

		// Can't remember why I added this...
		//args.push("csharp.suppressHiddenDiagnostics: true");

		var settingCheck;
		// Loop through all the other OmniSharp setting to push to args
		settingsToCheck.forEach(function(setting) {
			settingCheck = setIfConfigIsSet(setting);
			if(settingCheck!=null) {
				args.push(settingCheck);
			}
		});

		// @TODO Should take options and add them to the command line? Can we do a JSON file?
		if(nova.inDevMode()) {
			console.log("[OmniSharp] start()\n PATH:: \n" + path + "\n ::PATH");
			var argsOut = "";
			args.forEach(a => argsOut += a + " ");
			console.log("[OmniSharp] start()\n ARGS:: \n" + argsOut + "\n ::ARGS");
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
			//debug: true,
		};

		var client = new LanguageClient('CSharp', 'OmniSharp Language Server', serverOptions, clientOptions);
		try {
			if (nova.inDevMode()) { console.log("[OmniSharp] start() Trying..."); }
			// Start the client
			client.start();
			client.onDidStop(function(error) { console.log("*** [OmniSharp] onDidStop() ERROR: " + error + " ***"); });
			nova.subscriptions.add(client);
			this.languageClient = client;

			if (nova.inDevMode()) { console.log("[OmniSharp] start()  Completed at ",new Date()); }
		} catch (err) {
			// If the .start() method throws, it's likely because the path to the language server is invalid
			if (nova.inDevMode()) {
				console.error("[OmniSharp] start() Error caught:",err);
			}
		}
	}

	stop() {
		if(nova.inDevMode()) { console.log("[OmniSharp] stop() this.languageClient: ",this.languageClient); }
		if (this.languageClient) {
			if(nova.inDevMode()) { console.log("[OmniSharp] this.languageClient should be stopped..."); }
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
			this.languageClient = null;
		}
	}
}
