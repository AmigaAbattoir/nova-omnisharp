**Omnisharp - C Sharp** provides LSP stuff for C# project

It uses [Omnisharp Roslyn](https://github.com/OmniSharp/omnisharp-roslyn) V1.39.6 [release](https://github.com/OmniSharp/omnisharp-roslyn/releases/)) to try an do this LSP magic.

I am primarily focused on using it for work and it's Unity projects, so for right now it's using some options that will only work for Unity project and some basic .NET project will probably not work.

Syntaxes were converted with [Nova Mate](https://github.com/gredman/novamate) from the grammar `csharp` in [Microsoft's VSCode C# Extension](https://github.com/microsoft/vscode/blob/main/extensions/csharp/syntaxes/csharp.tmLanguage.json) and I basically added some `<symbol>` to get the outlining features to work.`

## Requirements

You may need [Mono](https://www.mono-project.com/download/stable/) installed.

## Usage

C Sharp should runs any time you open a file with ".cs" files, or if there is a *.csproj file in the workspace.

## Configuration

To configure global preferences, you'll have to wait. As of V0.3, you can only use the "omnisharp.useModernNet" (and a few others) to either set it for the extension or on a workspace setting.

## Unity and "Unity Nova"

To setup Unity to use Nova as your editor, you'll need to use the **UnityNova** executable to launch Nova with the right parameters.
Unity will send a line or column of zero, depending where it's called from. Nova isn't happy with that so this program will handle correcting it.

Once UnityNova is installed, go in Unity and go into the *Settings -> External Tools*

Change them as follows:

  * **External Script Editor:** *Select UnityNova*

    * @TODO Test the extension trying to copy to /usr/local/bin

  * **External Script Editor Args:** *"$(File)" $(Line) $(Column)*

*NOTE:* It is important to use the double quotes around `$(File)` to ensure that if the path contains spaces the command will work.

#### Additional Notes:
To make this work nicely for Unity projects, right now, we add in the following environmental variable:

```
FrameworkPathOverride=/Library/Frameworks/Mono.framework/Versions/Current
```

And add these options (again for Unity):

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