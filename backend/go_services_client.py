"""
Go Services Client
Python client for communicating with Go microservices
"""

import requests
import json
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class PasswordServiceClient:
    """Client for password hashing service"""
    
    def __init__(self, base_url: str = "http://localhost:9001"):
        self.base_url = base_url
    
    def hash_password(self, password: str, salt: Optional[str] = None) -> Dict[str, str]:
        """Hash a password using the Go service"""
        try:
            payload = {"password": password}
            if salt:
                payload["salt"] = salt
            
            response = requests.post(f"{self.base_url}/hash", json=payload, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Password hashing service error: {e}")
            raise
    
    def verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify a password using the Go service"""
        try:
            payload = {"password": password, "stored_hash": stored_hash}
            response = requests.post(f"{self.base_url}/verify", json=payload, timeout=10)
            response.raise_for_status()
            result = response.json()
            return result.get("valid", False)
        except requests.RequestException as e:
            logger.error(f"Password verification service error: {e}")
            raise
    
    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False


class TelemetryServiceClient:
    """Client for telemetry/metrics service"""
    
    def __init__(self, base_url: str = "http://localhost:9002"):
        self.base_url = base_url
    
    def record_event(self, event_type: str, endpoint: str = "", message: str = "", success: bool = True) -> bool:
        """Record a telemetry event"""
        try:
            payload = {
                "event_type": event_type,
                "endpoint": endpoint,
                "message": message,
                "success": success
            }
            response = requests.post(f"{self.base_url}/record", json=payload, timeout=5)
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            logger.error(f"Telemetry service error: {e}")
            return False
    
    def get_stats(self) -> Optional[Dict[str, Any]]:
        """Get server statistics"""
        try:
            response = requests.get(f"{self.base_url}/stats", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to get stats: {e}")
            return None
    
    def get_system_info(self) -> Optional[Dict[str, Any]]:
        """Get system information"""
        try:
            response = requests.get(f"{self.base_url}/system", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to get system info: {e}")
            return None
    
    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False


class ImageServiceClient:
    """Client for image processing service"""
    
    def __init__(self, base_url: str = "http://localhost:9003"):
        self.base_url = base_url
    
    def process_image(self, image_data: str, format: str = "jpeg", width: int = 0, height: int = 0, 
                      quality: int = 85, thumbnail: bool = False) -> Optional[Dict[str, Any]]:
        """Process an image using the Go service"""
        try:
            payload = {
                "image_data": image_data,
                "format": format,
                "width": width,
                "height": height,
                "quality": quality,
                "thumbnail": thumbnail
            }
            response = requests.post(f"{self.base_url}/process", json=payload, timeout=60)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Image processing service error: {e}")
            return None
    
    def get_image_info(self, image_data: str) -> Optional[Dict[str, Any]]:
        """Get image information"""
        try:
            payload = {"image_data": image_data}
            response = requests.post(f"{self.base_url}/info", json=payload, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Image info service error: {e}")
            return None
    
    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False


class WorkerServiceClient:
    """Client for background worker service"""
    
    def __init__(self, base_url: str = "http://localhost:9004"):
        self.base_url = base_url
    
    def submit_task(self, task_type: str, payload: Dict[str, Any], task_id: Optional[str] = None) -> Optional[str]:
        """Submit a background task"""
        try:
            task = {
                "id": task_id,
                "type": task_type,
                "payload": payload
            }
            response = requests.post(f"{self.base_url}/submit", json=task, timeout=5)
            response.raise_for_status()
            result = response.json()
            return result.get("task_id")
        except requests.RequestException as e:
            logger.error(f"Worker service error: {e}")
            return None
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status"""
        try:
            response = requests.get(f"{self.base_url}/status?id={task_id}", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to get task status: {e}")
            return None
    
    def list_tasks(self) -> Optional[Dict[str, Any]]:
        """List all tasks"""
        try:
            response = requests.get(f"{self.base_url}/list", timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Failed to list tasks: {e}")
            return None
    
    def health_check(self) -> bool:
        """Check if the service is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            return False


# Singleton instances for easy access
password_service = PasswordServiceClient()
telemetry_service = TelemetryServiceClient()
image_service = ImageServiceClient()
worker_service = WorkerServiceClient()
