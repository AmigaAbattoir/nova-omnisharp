**C Sharp** provides LSP stuff for C# project

It uses [Omnisharp Roslyn](https://github.com/OmniSharp/omnisharp-roslyn) (using the latest [release](https://github.com/OmniSharp/omnisharp-roslyn/releases/) at the time of V1.39.4) to try an do this LSP magic.

I am primarily focused on using it for Unity projects, so for right now it's using some options that will only work for Unity project and some basic .NET project will not work.

Syntaxes were converted with [Nova Mate](https://github.com/gredman/novamate) from the grammar `csharp` in [Microsoft's VSCode C# Extension](https://github.com/microsoft/vscode/blob/main/extensions/csharp/syntaxes/csharp.tmLanguage.json) and I basically added some `<symbol>` to get the outlining features to work.`

## Requirements

You may need [Mono](https://www.mono-project.com/download/stable/) installed.

## Usage

C Sharp should runs any time you open a local project with ".cs" files, but right now, it always goes. Hey, that's what you get with stuff that is still in development!

### Configuration

To configure global preferences, you'll have to wait.

You can also configure preferences on a per-project basis but that too require you to wait

Right now, we add in the following enviromental variable:

```
FrameworkPathOverride=/Library/Frameworks/Mono.framework/Versions/Current
```

And add these options (again for Unity):

```
omnisharp.useModernNet:false
omnisharp.useGlobalMono:always
```

Take a look at:

~/.vscode/extensions/ms-dotnettools.csharp-1.25.0-darwin-arm64/.omnisharp/1.39.0/omnisharp/

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

## Unity

To setup Unity to use Nova as the editor, you'll need to use the UnityNova executable to launch Nova with the right parameters.
In order to take full use of Unity passing line and column, we need to monitor what is called and adjust it so that Nova will open it either at the right line and column, just the right line, or just open the file.

Unity will send a line or column of zero, depending where it's called from. Nova isn't happy with that so the program will handle correcting it.  go in Unity and go into the *Settings -> External Tools*

**External Script Editor:** *Select UnityNova (need to add script to copy to /usr/local/bin...)*
**External Script Editor Args:** *"$(File)" $(Line) $(Column)*

It it important to use the double quotes around `$(File)` to ensure the path (if it contains spaces) will work,