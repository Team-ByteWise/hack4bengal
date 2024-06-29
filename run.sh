#!/bin/bash

FLASK_PID=""
EVILGINX_PID=""
CHROME_PID=""
FRONTEND_PID=""

NEW_VENV_CREATED=false

install_virtualenv() {
    NEW_VENV_CREATED=false

    if [ -d "venv" ]; then
        echo "Virtual environment found."
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        echo "Virtual environment found."
        source .venv/bin/activate
    else
        echo "No virtual environment found."
        echo "Creating venv..."
        python3 -m venv venv
        source venv/bin/activate
        NEW_VENV_CREATED=true
    fi

    echo "Virtual environment activated."
}

install_backend() {
    cd backend || exit

    install_virtualenv

    if [ "$NEW_VENV_CREATED" = true ]; then
        echo "New virtual environment created. Installing requirements..."
        pip install -r requirements.txt
    else
        echo "Using existing virtual environment. Skipping requirement installation."
    fi

    deactivate
    cd ..
}

install_evilginx() {
    cd evilginx || exit

    if [ ! -f "evilginx" ]; then
        echo "Downloading Evilginx..."
        wget https://github.com/kgretzky/evilginx2/releases/download/v3.3.0/evilginx-v3.3.0-linux-64bit.zip -O evilginx.zip

        echo "Extracting Evilginx..."
        unzip evilginx.zip
        rm evilginx.zip
        chmod +x evilginx
		sudo setcap CAP_NET_BIND_SERVICE=+eip ./evilginx
    else
        echo "Evilginx is already installed."
    fi

    cd ..
}

install_extension() {
    cd extension || exit

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for extension..."
        npm install
    else
        echo "Extension dependencies already installed."
    fi

    if [ ! -d "build" ]; then
        echo "Building extension..."
        npm run build
    else
        echo "Extension build already exists."
    fi

    cd ..
}

install_frontend() {
    cd frontend || exit

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for frontend..."
        npm install
    else
        echo "Frontend dependencies already installed."
    fi

    cd ..
}

download_and_extract_chrome_data() {
    url="https://firebasestorage.googleapis.com/v0/b/itsyourap-misc.appspot.com/o/hack4bengal%2Fchrome-data.zip?alt=media&token=958db72d-36d5-422b-901e-f2427fefefc8"
    zip_file="chrome-data.zip"
    destination="chrome-data"

    if [[ ! -f "$zip_file" && ! -d "$destination" ]]; then
        echo "Downloading Chrome data..."
        if curl -o "$zip_file" -L "$url"; then
            echo "Extracting Chrome data..."
            if unzip -o "$zip_file" -d .; then
                echo "Chrome data extraction completed."
                rm -f "$zip_file"
            else
                echo "Failed to extract Chrome data."
                return 1
            fi
        else
            echo "Failed to download Chrome data."
            return 1
        fi
    else
        if [[ -d "$destination" ]]; then
            echo "Chrome data or its extracted folder already exists. Skipping download and extraction."
        else
            echo "Extracting Chrome data..."
            if unzip -o "$zip_file" -d .; then
                echo "Chrome data extraction completed."
                rm -f "$zip_file"
            else
                echo "Failed to extract Chrome data."
                return 1
            fi
        fi
    fi
}


start_backend() {
    cd backend || exit

    install_virtualenv

    echo "Starting Flask app..."
    export FLASK_APP="main.py"
    export FLASK_ENV="development"
    export FLASK_DEBUG="0"
    python3 -m flask run --host=0.0.0.0 &
    FLASK_PID=$!

    deactivate
    cd ..

    return $FLASK_PID
}

start_evilginx() {
    cd evilginx || exit

    echo "Starting Evilginx..."
    ./evilginx -developer -c . &
    EVILGINX_PID=$!

    cd ..

    return $EVILGINX_PID
}

start_extension() {
    cd extension || exit

    EXTENSION_PATH=$(realpath build)
    DATA_PATH=$(realpath ../chrome-data)

    echo "Launching Chrome with extension..."
    google-chrome --new-window --user-data-dir="$DATA_PATH" --ignore-certificate-errors --host-resolver-rules="MAP *.localhost 127.0.0.1" --load-extension="$EXTENSION_PATH" &
	
    CHROME_PID=$!

    cd ..

    return $CHROME_PID
}

start_frontend() {
    cd frontend || exit

    echo "Starting frontend..."
    npm run dev &

    FRONTEND_PID=$!

    cd ..
}

trap 'echo "Stopping processes..."; [ -n "$FLASK_PID" ] && kill "$FLASK_PID"; [ -n "$EVILGINX_PID" ] && kill "$EVILGINX_PID"; [ -n "$CHROME_PID" ] && kill "$CHROME_PID"; [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID"; exit' INT

install_backend
install_frontend
install_evilginx
download_and_extract_chrome_data
install_extension

start_backend
start_frontend
start_evilginx
start_extension

echo "Press CTRL+C to exit..."
while true; do sleep 1; done
