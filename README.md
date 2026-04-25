🚨 **This repository has moved**

Active development is now on GitLab: https://gitlab.com/AmigaAbattoir/nova-omnisharp

This repo is archived and no longer maintained.

# Omnisharp - C# Extension for Nova's Panic

Extension for C# in [Nova's Panic](https://nova.app/) using [OmniSharp Roslyn](https://github.com/OmniSharp/omnisharp-roslyn) LSP.

More details in the [Omnisharp.novaextension README.md](Omnisharp.novaextension/README.md)

## Omnisharp.novaextension

The main code of the extension, which still needs some work.

## [com.unity.ide.nova](https://gitlab.com/AmigaAbattoir/com.unity.ide.nova)

A repo for a Unity package that helps with when using Nova. This can replace UnityNova and should allow Unity 2021+ projects to get completions better since it will remove links in the `.csproj` to modules in the VSCode extension.

### Older

## UnityNova

An XCode project to generate an executable to help pass the options from Unity to the proper format for Nova to open the file.

*NOTE:* This is not needed if you are using the above Unity package, which adds the ability to directly use Nova from Unity.

