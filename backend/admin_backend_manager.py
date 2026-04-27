#!/usr/bin/env python3
"""
Admin Backend Manager
Manages the Python backend server lifecycle based on admin sessions.
Starts the backend when needed and stops it when no admins are logged in.
"""

import os
import sys
import subprocess
import time
import signal
import sqlite3
from pathlib import Path
from typing import Optional

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from config import DATA_DIR, PORT

class BackendManager:
    def __init__(self):
        self.db_path = DATA_DIR / "users.db"
        self.backend_process: Optional[subprocess.Popen] = None
        self.pid_file = backend_dir / ".backend.pid"
        self.log_file = backend_dir / "backend_manager.log"

    def log(self, message: str):
        """Log messages to file and stdout"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_line = f"[{timestamp}] {message}\n"
        print(log_line.strip())
        with open(self.log_file, "a") as f:
            f.write(log_line)

    def get_active_session_count(self) -> int:
        """Count active admin sessions in the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("""
                SELECT COUNT(*) FROM user_sessions 
                WHERE is_active = 1 AND expires_at > datetime('now')
            """)
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except Exception as e:
            self.log(f"Error checking sessions: {e}")
            return 0

    def is_backend_running(self) -> bool:
        """Check if backend process is running"""
        if self.pid_file.exists():
            try:
                with open(self.pid_file, "r") as f:
                    pid = int(f.read().strip())
                # Check if process exists
                os.kill(pid, 0)
                return True
            except (ProcessLookupError, ValueError, OSError):
                # Process not running, clean up stale pid file
                self.pid_file.unlink(missing_ok=True)
                return False
        return False

    def start_backend(self) -> bool:
        """Start the backend server"""
        if self.is_backend_running():
            self.log("Backend is already running")
            return True

        self.log("Starting backend server...")
        try:
            # Start the backend server with nohup to keep it running
            self.backend_process = subprocess.Popen(
                [sys.executable, "-m", "backend"],
                cwd=backend_dir.parent,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True  # Detach from parent process
            )

            # Wait a moment to ensure process started
            time.sleep(1)

            # Check if process is still running
            if self.backend_process.poll() is None:
                # Save PID
                with open(self.pid_file, "w") as f:
                    f.write(str(self.backend_process.pid))

                self.log(f"Backend started with PID {self.backend_process.pid}")
                return True
            else:
                self.log("Backend process exited immediately")
                return False
        except Exception as e:
            self.log(f"Failed to start backend: {e}")
            return False

    def stop_backend(self) -> bool:
        """Stop the backend server"""
        if not self.is_backend_running():
            self.log("Backend is not running")
            return True

        try:
            with open(self.pid_file, "r") as f:
                pid = int(f.read().strip())

            self.log(f"Stopping backend (PID {pid})...")
            
            # Kill the process group
            os.killpg(os.getpgid(pid), signal.SIGTERM)
            
            # Wait for process to terminate
            time.sleep(2)
            
            # Force kill if still running
            try:
                os.killpg(os.getpgid(pid), signal.SIGKILL)
            except ProcessLookupError:
                pass  # Process already terminated

            self.pid_file.unlink(missing_ok=True)
            self.log("Backend stopped successfully")
            return True
        except Exception as e:
            self.log(f"Failed to stop backend: {e}")
            return False

    def monitor_and_stop_if_no_sessions(self) -> bool:
        """Check sessions and stop backend if no active sessions"""
        session_count = self.get_active_session_count()
        self.log(f"Active sessions: {session_count}")

        if session_count == 0 and self.is_backend_running():
            self.log("No active sessions, stopping backend...")
            return self.stop_backend()
        return True

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Admin Backend Manager")
    parser.add_argument("action", choices=["start", "stop", "status", "monitor"], 
                       help="Action to perform")
    args = parser.parse_args()

    manager = BackendManager()

    if args.action == "start":
        success = manager.start_backend()
        sys.exit(0 if success else 1)
    elif args.action == "stop":
        success = manager.stop_backend()
        sys.exit(0 if success else 1)
    elif args.action == "status":
        running = manager.is_backend_running()
        sessions = manager.get_active_session_count()
        print(f"Backend running: {running}")
        print(f"Active sessions: {sessions}")
        sys.exit(0)
    elif args.action == "monitor":
        # Monitor mode: check sessions and stop if none
        manager.monitor_and_stop_if_no_sessions()
        sys.exit(0)

if __name__ == "__main__":
    main()
