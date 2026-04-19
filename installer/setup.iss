; Inno Setup Script for My Home
; Creates a complete Windows installer with integrated Windows service

#define MyAppName "My Home"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "adelesse"
#define MyAppURL "https://github.com/adelesse/my-home"
#define MyAppExeName "MyHome.exe"
#define ServiceName "MyHome"
#define ServiceDisplayName "My Home"
#define ServiceDescription "Personal dashboard with Express backend and Angular frontend"

[Setup]
; Application information
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Default installation directory
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=no
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Output file
OutputDir=..\dist-installer
OutputBaseFilename=MyHome-Setup-{#MyAppVersion}
SetupIconFile=..\frontend\public\favicon.ico

; Compression
Compression=lzma2
SolidCompression=yes

; 64-bit mode
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible

; Administrator privileges required to create the service
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; Interface
WizardStyle=modern
DisableWelcomePage=no

; License (optional)
;LicenseFile=..\LICENSE.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Backend application
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,daemon,*.log"

; Frontend application (pre-built)
Source: "..\frontend\dist\my-home\browser\*"; DestDir: "{app}\frontend\dist\my-home\browser"; Flags: ignoreversion recursesubdirs createallsubdirs

; Service management scripts
Source: "..\backend\service.js"; DestDir: "{app}\backend"; Flags: ignoreversion
Source: "..\backend\uninstall-service.js"; DestDir: "{app}\backend"; Flags: ignoreversion

; Package.json
Source: "..\backend\package.json"; DestDir: "{app}\backend"; Flags: ignoreversion

; README files
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "http://localhost:3000"; IconFilename: "{app}\frontend\dist\my-home\browser\favicon.ico"
Name: "{group}\Stop {#MyAppName}"; Filename: "net"; Parameters: "stop ""{#ServiceDisplayName}"""; IconFilename: "{sys}\shell32.dll"; IconIndex: 238
Name: "{group}\Start {#MyAppName}"; Filename: "net"; Parameters: "start ""{#ServiceDisplayName}"""; IconFilename: "{sys}\shell32.dll"; IconIndex: 137
Name: "{group}\Service Logs"; Filename: "{app}\backend\daemon"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "http://localhost:3000"; IconFilename: "{app}\frontend\dist\my-home\browser\favicon.ico"; Tasks: desktopicon

[Run]
; Node.js verification
Filename: "cmd.exe"; Parameters: "/c node --version > nul 2>&1 || (echo Node.js is not installed! && pause)"; StatusMsg: "Checking Node.js..."; Flags: runhidden waituntilterminated

; Install backend dependencies
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\backend"" && npm install --omit=dev"; StatusMsg: "Installing backend dependencies..."; Flags: runhidden waituntilterminated

; Install node-windows
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\backend"" && npm install node-windows"; StatusMsg: "Installing node-windows..."; Flags: runhidden waituntilterminated

; Install and start the service
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\backend"" && node service.js"; StatusMsg: "Installing Windows service..."; Flags: runhidden waituntilterminated

; Open browser at the end
Filename: "http://localhost:3000"; Description: "Open My Home in browser"; Flags: shellexec postinstall skipifsilent nowait

[UninstallRun]
; Stop and uninstall the service before removing files
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}\backend"" && node uninstall-service.js"; Flags: runhidden waituntilterminated; RunOnceId: "UninstallService"

[UninstallDelete]
Type: filesandordirs; Name: "{app}\backend\node_modules"
Type: filesandordirs; Name: "{app}\backend\daemon"
Type: files; Name: "{app}\backend\*.log"

[Code]
var
  NodeJsInstalled: Boolean;
  NodeJsVersion: String;
  DownloadPage: TDownloadWizardPage;

function OnDownloadProgress(const Url, FileName: String; const Progress, ProgressMax: Int64): Boolean;
begin
  if Progress = ProgressMax then
    Log(Format('Download completed: %s', [FileName]));
  Result := True;
end;

function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
  NodePath: String;
begin
  Result := True;
  NodeJsInstalled := False;
  
  // Check if Node.js is installed
  if Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ResultCode = 0 then
    begin
      NodeJsInstalled := True;
      Log('Node.js is installed');
    end;
  end;
  
  if not NodeJsInstalled then
  begin
    if MsgBox('Node.js is not installed on your system.' + #13#10 + #13#10 +
              'Node.js is required to run My Home.' + #13#10 + #13#10 +
              'Would you like to download and install Node.js now?' + #13#10 +
              '(The installation will open the Node.js website)', 
              mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi', '', '', SW_SHOW, ewNoWait, ResultCode);
      MsgBox('Please install Node.js then run this installer again.', mbInformation, MB_OK);
      Result := False;
    end
    else
    begin
      MsgBox('Installation cannot continue without Node.js.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    Log('Service installation completed');
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    Log('Service uninstallation completed');
  end;
end;
