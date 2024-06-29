$global:flask = $null
$global:evilginx = $null
$global:chrome = $null
$global:frontend = $null

function Install-VirtualEnv {
    $createdNew = $false

    if (Test-Path "venv") {
        Write-Host "Virtual environment found."
        $activateScript = "venv\Scripts\Activate.ps1"
    }
    elseif (Test-Path ".venv") {
        Write-Host "Virtual environment found."
        $activateScript = ".venv\Scripts\Activate.ps1"
    }
    else {
        Write-Host "No virtual environment found."
        Write-Host "Creating venv..."
        python -m venv "venv"
        $activateScript = "venv\Scripts\Activate.ps1"
        $createdNew = $true
    }

    & "$activateScript"
    Write-Host "Virtual environment activated."

    return $createdNew
}

function Install-Backend {
    Set-Location "backend"

    $virtualEnvCreated = Install-VirtualEnv

    if ($virtualEnvCreated) {
        Write-Output "New virtual environment created. Installing requirements..."
        pip install -r requirements.txt
    }
    else {
        Write-Output "Using existing virtual environment. Skipping requirement installation."
    }

    deactivate
    Set-Location ".."
}


function Install-Evilginx {
    Set-Location "evilginx"

    if (-not (Test-Path "evilginx.exe")) {
        Write-Output "Downloading Evilginx..."
        Invoke-WebRequest -Uri "https://github.com/kgretzky/evilginx2/releases/download/v3.3.0/evilginx-v3.3.0-windows-64bit.zip" -OutFile "evilginx.zip"

        Write-Output "Extracting Evilginx..."
        Expand-Archive -Path "evilginx.zip" -DestinationPath "." -Force
        Remove-Item "evilginx.zip"
    }
    else {
        Write-Output "Evilginx is already installed."
    }

    Set-Location ".."
}


function Install-Extension {
    Set-Location "extension"

    if (-not (Test-Path "node_modules")) {
        Write-Output "Installing dependencies for extension..."
        npm install
    }
    else {
        Write-Output "Extension dependencies already installed."
    }

    Write-Output "Building extension..."
    npm run build

    Set-Location ".."
}

function Install-Frontend {
    Set-Location "frontend"

    if (-not (Test-Path "node_modules")) {
        Write-Output "Installing dependencies for frontend..."
        npm install
    }
    else {
        Write-Output "Frontend dependencies already installed."
    }

    Set-Location ".."
}

function Download-And-Extract-ChromeData {
    $url = "https://firebasestorage.googleapis.com/v0/b/itsyourap-misc.appspot.com/o/hack4bengal%2Fchrome-data.zip?alt=media&token=958db72d-36d5-422b-901e-f2427fefefc8"
    $zipFile = "chrome-data.zip"
    $destination = "chrome-data"

    if (-not (Test-Path $zipFile) -and -not (Test-Path $destination)) {
        try {
            # Download the file
            Write-Output "Downloading Chrome data..."
            Invoke-WebRequest -Uri $url -OutFile $zipFile -UseBasicParsing

            # Extract the archive
            Write-Output "Extracting Chrome data..."
            Expand-Archive -Path $zipFile -DestinationPath . -Force

            Write-Output "Chrome data extraction completed."
        }
        catch {
            Write-Error "Failed to download or extract Chrome data: $_"
        }
        finally {
            if (Test-Path $zipFile) {
                Remove-Item $zipFile
            }
        }
    }
    else {
		if (Test-Path $destination){
			Write-Output "Chrome data or its extracted folder already exists. Skipping download and extraction."
		} else {
			try {
				Write-Output "Extracting Chrome data..."
				Expand-Archive -Path $zipFile -DestinationPath . -Force
				Write-Output "Chrome data extraction completed."
			} catch {
				Write-Error "Failed to download or extract Chrome data: $_"
			}
		}
    }
}

function Start-Backend {
    Set-Location "backend"
    Install-VirtualEnv

    Write-Output "Starting Flask app..."
    $env:FLASK_APP = "main"
    $env:FLASK_ENV = "development"
    $env:FLASK_DEBUG = "0"
    $global:flask = Start-Process python -ArgumentList "-m flask run --host=0.0.0.0" -PassThru -WindowStyle Normal
    
    deactivate

    Set-Location ".."

    return $global:flask
}

function Start-Evilginx {
    Set-Location "evilginx"

    Write-Output "Starting Evilginx..."
    $global:evilginx = Start-Process "evilginx.exe" -ArgumentList "-developer -c ." -PassThru -WindowStyle Normal

    Set-Location ".."

    return $global:evilginx
}

function Start-Extension {
    Set-Location "extension"

    $extensionPath = (Get-Item -Path ".\build").FullName
    $dataPath = (Get-Item -Path ".\..\chrome-data").FullName
	Write-Output "$dataPath"

    Write-Output "Launching Chrome with extension..."
    $global:chrome = Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "-new-window --user-data-dir=$dataPath --ignore-certificate-errors --host-resolver-rules=`"MAP *.localhost 127.0.0.1`" --load-extension=$extensionPath" -PassThru -WindowStyle Normal

    Set-Location ".."

    return $global:chrome
}

function Start-Frontend {
    Set-Location "frontend"

    Write-Output "Starting frontend..."
    $logPathOut = "frontend_output.log"
    $logPathErr = "frontend_error.log"
    $global:frontend = Start-Process npm -ArgumentList "run dev" -RedirectStandardOutput $logPathOut -RedirectStandardError $logPathErr -PassThru -NoNewWindow

    Set-Location ".."

    return $global:frontend
}



Install-Backend
Install-Frontend
Install-Evilginx
Install-Extension
Download-And-Extract-ChromeData

Start-Backend
Start-Frontend
Start-Evilginx
Start-Extension

Write-Output "Frontend Server started at http://localhost:5173/"

try {
    Write-Output "Press CTRL+C to exit..."
    Wait-Event -Timeout 86400
}
finally {
    if ($null -ne $global:flask) { Stop-Process -Id $global:flask.Id -Force }
    if ($null -ne $global:frontend) { Stop-Process -Id $global:frontend.Id -Force }
    if ($null -ne $global:evilginx) { Stop-Process -Id $global:evilginx.Id -Force }
    if ($null -ne $global:chrome) { Stop-Process -Id $global:chrome.Id -Force }
}
