# OmniSharp - C# for Nova

This extension provides language support for C# (and helpful options for using with Unity) using [OmniSharp Roslyn](https://github.com/OmniSharp/omnisharp-roslyn) with the [V1.39.8 release](https://github.com/OmniSharp/omnisharp-roslyn/releases/) to try an do this LSP magic.

It provides for C#:

 * **Syntax highlighting**
 * **Symbols**

If you have a Nova project, which contains the *.sln or *.csproj file, this extension will also provide:

 * **Language intelligence**
   * Issues
   * Completions. (Requires Nova 11.3+. Nova 11.4, it formats it better)

In order for the language intelligence part, you need that *.sln or *.csproj file. This is part of the design of Omnisharp.

## Notes

I am primarily focused on using it for work with Unity projects, so for right now it's using some options that will only work for Unity project and some basic .NET project may not work as expected.

Syntaxes were converted with [Nova Mate](https://github.com/gredman/novamate) from the grammar `csharp` in [Microsoft's VSCode C# Extension](https://github.com/microsoft/vscode/blob/main/extensions/csharp/syntaxes/csharp.tmLanguage.json) and I basically added some `<symbol>` to get the outlining features to work.

## Ominsharp release modification

While you can change setting to use a different omnisharp release, for this extension I modify the `run` file of the package **omnisharp-osx** to help handle spacing in the name of the path. I add `:q` to the variables for `base_dir`,`omnisharp_dir` and to creating the `omnisharp_cmd`.

## Known Issues

* Does not honor all the OmniSharp options properly.

## Requirements

1) You will need to have complete install of [Mono](https://www.mono-project.com/download/stable/) (including MSBuild) in order to provide the language services.

2) You will need a version of [.NET SDK](https://dotnet.microsoft.com/en-us/download) installed.

## Usage

OmniSharp for Nova should runs any time you open a file with ".cs" files, or if there is a "*.csproj" file in the workspace.

## Configuration

While configuration options are there, not all are "hooked up" or work as expected. Still working on that.

## Unity and "Unity Nova"

To use Nova and this extension with a Unity project, you **need** to add a project to Nova with either in the root of the Unity project's folder or the parent folder.

To setup Unity to use Nova as your editor, you'll need to use the **UnityNova** executable to launch Nova with the right parameters.
Unity will send a line or column of zero, depending where it's called from.
Nova isn't happy with that so this program will handle passing parameters to Nova that it will know either to just open a file, go to a particular line, or to go to a line and column of a file.

*NOTE:* Still working on making the extension install it. Right now, it will show a notification with a command to copy and paste in Terminal.
You could probably go through Finder and Show Package Content to get to the same location:

`~/Library/Application Support/Nova/Extensions/Omnisharp.novaextension/UnityNova`

Once UnityNova is installed, go in Unity and go into the *Settings -> External Tools*

Change them as follows:

  * **External Script Editor:** *Select UnityNova*

    * _@TODO_ Figure out how to copy to /usr/local/bin

  * **External Script Editor Args:** *"$(File)" $(Line) $(Column)*

*NOTE:* It is important to use the double quotes around `$(File)` to ensure that if the path contains spaces the command will work.

## Additional Notes for Unity:

To make this work nicely for Unity projects, right now, we add in the following environmental variable and options automatically if using the **Auto Detect Unity project** setting (enabled by default):

```
FrameworkPathOverride=/Library/Frameworks/Mono.framework/Versions/Current
```

and add these options when starting up the OmniSharp LSP for the project:

```
omnisharp.useModernNet:false
omnisharp.useGlobalMono:always
```


<!--
### What happens?

Who knows... but here's some notes for me...

Take a look at:

`~/.vscode/extensions/ms-dotnettools.csharp-1.25.0-darwin-arm64/.omnisharp/1.39.0/omnisharp/`

Default [RoslynExtensionOptions](https://github.com/OmniSharp/omnisharp-roslyn/blob/master/src/OmniSharp.Shared/Options/RoslynExtensionsOptions.cs)

```
{
	"RoslynExtensionsOptions":{
		"EnableDecompilationSupport":false,
		"EnableAnalyzersSupport":false,
		"EnableImportCompletion":false,
		"EnableAsyncCompletion":false,
		"DocumentAnalysisTimeoutMs":30000,
		"DiagnosticWorkersThreadCount":15,
		"AnalyzeOpenDocumentsOnly":false,
		"InlayHintsOptions":{
			"EnableForParameters":false,
			"ForLiteralParameters":false,
			"ForIndexerParameters":false,
			"ForObjectCreationParameters":false,
			"ForOtherParameters":false,
			"SuppressForParametersThatDifferOnlyBySuffix":false,
			"SuppressForParametersThatMatchMethodIntent":false,
			"SuppressForParametersThatMatchArgumentName":false,
			"EnableForTypes":false,
			"ForImplicitVariableTypes":false,
			"ForLambdaParameterTypes":false,
			"ForImplicitObjectCreation":false
		},
		"LocationPaths":null
	},
	"FormattingOptions":{
		"OrganizeImports":false,
		"EnableEditorConfigSupport":false,
		"NewLine":"\\n",
		"UseTabs":false,
		"TabSize":4,
		"IndentationSize":4,
		"SpacingAfterMethodDeclarationName":false,
		"SeparateImportDirectiveGroups":false,
		"SpaceWithinMethodDeclarationParenthesis":false,
		"SpaceBetweenEmptyMethodDeclarationParentheses":false,
		"SpaceAfterMethodCallName":false,
		"SpaceWithinMethodCallParentheses":false,
		"SpaceBetweenEmptyMethodCallParentheses":false,
		"SpaceAfterControlFlowStatementKeyword":true,
		"SpaceWithinExpressionParentheses":false,
		"SpaceWithinCastParentheses":false,
		"SpaceWithinOtherParentheses":false,
		"SpaceAfterCast":false,
		"SpaceBeforeOpenSquareBracket":false,
		"SpaceBetweenEmptySquareBrackets":false,
		"SpaceWithinSquareBrackets":false,
		"SpaceAfterColonInBaseTypeDeclaration":true,
		"SpaceAfterComma":true,
		"SpaceAfterDot":false,
		"SpaceAfterSemicolonsInForStatement":true,
		"SpaceBeforeColonInBaseTypeDeclaration":true,
		"SpaceBeforeComma":false,
		"SpaceBeforeDot":false,
		"SpaceBeforeSemicolonsInForStatement":false,
		"SpacingAroundBinaryOperator":"single",
		"IndentBraces":false,
		"IndentBlock":true,
		"IndentSwitchSection":true,
		"IndentSwitchCaseSection":true,
		"IndentSwitchCaseSectionWhenBlock":true,
		"LabelPositioning":"oneLess",
		"WrappingPreserveSingleLine":true,
		"WrappingKeepStatementsOnSingleLine":true,
		"NewLinesForBracesInTypes":true,
		"NewLinesForBracesInMethods":true,
		"NewLinesForBracesInProperties":true,
		"NewLinesForBracesInAccessors":true,
		"NewLinesForBracesInAnonymousMethods":true,
		"NewLinesForBracesInControlBlocks":true,
		"NewLinesForBracesInAnonymousTypes":true,
		"NewLinesForBracesInObjectCollectionArrayInitializers":true,
		"NewLinesForBracesInLambdaExpressionBody":true,
		"NewLineForElse":true,
		"NewLineForCatch":true,
		"NewLineForFinally":true,
		"NewLineForMembersInObjectInit":true,
		"NewLineForMembersInAnonymousTypes":true,
		"NewLineForClausesInQuery":true
	},
	"FileOptions":{
		"SystemExcludeSearchPatterns":[
			"**/node_modules/**/*",
			"**/bin/**/*",
			"**/obj/**/*",
			"**/.git/**/*"
		],
		"ExcludeSearchPatterns":[
		]
	},
	"RenameOptions":{
		"RenameOverloads":false,
		"RenameInStrings":false,
		"RenameInComments":false
	},
	"ImplementTypeOptions":{
		"InsertionBehavior":0,
		"PropertyGenerationBehavior":0
	},
	"DotNetCliOptions":{
		"LocationPaths":null
	},
	"Plugins":{
		"LocationPaths":null
	}
}
```
-->