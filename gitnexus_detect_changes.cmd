@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\gitnexus_detect_changes.ps1" %*

