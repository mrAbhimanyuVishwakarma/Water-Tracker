# Compatibility launcher. Uses the animation reference, not Windows speech.
param([string]$Python = '', [string]$ModelDir = '')
$ErrorActionPreference = 'Stop'
if (-not $Python) {
    $localPython = Join-Path $PSScriptRoot '../../.expo/brownie-audio-env/Scripts/python.exe'
    $Python = if (Test-Path -LiteralPath $localPython) { $localPython } else { 'python' }
}
$generator = Join-Path $PSScriptRoot 'generate-brownie-voices.py'
if ($ModelDir) { & $Python $generator --model-dir $ModelDir }
else { & $Python $generator }
if ($LASTEXITCODE -ne 0) { throw 'Voice generation failed. See docs/character-interactions.md for setup.' }
