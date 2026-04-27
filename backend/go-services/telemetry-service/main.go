package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"sync"
	"time"
)

const (
	PORT = 9002
)

type ServerStats struct {
	StartTime         time.Time `json:"start_time"`
	TotalRequests     int64     `json:"total_requests"`
	AuthAttempts      int64     `json:"auth_attempts"`
	SuccessfulLogins  int64     `json:"successful_logins"`
	FailedLogins      int64     `json:"failed_logins"`
	ActiveSessions    int64     `json:"active_sessions"`
	LastRequestTime   time.Time `json:"last_request_time"`
	EndpointsAccessed map[string]int64 `json:"endpoints_accessed"`
	Errors            []ErrorEntry `json:"errors"`
	mu                sync.RWMutex
}

type ErrorEntry struct {
	Timestamp time.Time `json:"timestamp"`
	Message   string    `json:"message"`
	Endpoint  string    `json:"endpoint"`
}

type SystemInfo struct {
	Platform       string  `json:"platform"`
	GoVersion      string  `json:"go_version"`
	ProcessID      int     `json:"process_id"`
	ThreadCount    int     `json:"thread_count"`
	CPUCount       int     `json:"cpu_count"`
	MemoryStats    MemoryStats `json:"memory_stats"`
	DiskTotal      uint64  `json:"disk_total"`
	DiskFree       uint64  `json:"disk_free"`
	DiskUsagePercent float64 `json:"disk_usage_percent"`
}

type MemoryStats struct {
	Alloc      uint64 `json:"alloc"`
	TotalAlloc uint64 `json:"total_alloc"`
	Sys        uint64 `json:"sys"`
	NumGC      uint32 `json:"num_gc"`
}

type RecordRequest struct {
	EventType string `json:"event_type"`
	Endpoint  string `json:"endpoint,omitempty"`
	Message   string `json:"message,omitempty"`
	Success   bool   `json:"success,omitempty"`
}

var stats = &ServerStats{
	StartTime:         time.Now(),
	EndpointsAccessed: make(map[string]int64),
	Errors:            make([]ErrorEntry, 0),
}

func recordEvent(eventType, endpoint, message string, success bool) {
	stats.mu.Lock()
	defer stats.mu.Unlock()

	stats.TotalRequests++
	stats.LastRequestTime = time.Now()

	switch eventType {
	case "auth_attempt":
		stats.AuthAttempts++
		if success {
			stats.SuccessfulLogins++
		} else {
			stats.FailedLogins++
		}
	case "session_created":
		stats.ActiveSessions++
	case "session_destroyed":
		if stats.ActiveSessions > 0 {
			stats.ActiveSessions--
		}
	}

	if endpoint != "" {
		stats.EndpointsAccessed[endpoint]++
	}

	if !success && message != "" {
		stats.Errors = append(stats.Errors, ErrorEntry{
			Timestamp: time.Now(),
			Message:   message,
			Endpoint:  endpoint,
		})
		// Keep only last 100 errors
		if len(stats.Errors) > 100 {
			stats.Errors = stats.Errors[1:]
		}
	}
}

func recordHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RecordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	recordEvent(req.EventType, req.Endpoint, req.Message, req.Success)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "recorded"})
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	stats.mu.RLock()
	defer stats.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

func systemInfoHandler(w http.ResponseWriter, r *http.Request) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	info := SystemInfo{
		Platform:    runtime.GOOS,
		GoVersion:   runtime.Version(),
		ProcessID:   os.Getpid(),
		ThreadCount: runtime.NumGoroutine(),
		CPUCount:    runtime.NumCPU(),
		MemoryStats: MemoryStats{
			Alloc:      m.Alloc,
			TotalAlloc: m.TotalAlloc,
			Sys:        m.Sys,
			NumGC:      m.NumGC,
		},
	}

	// Get disk usage (simplified - would need proper disk stats library)
	info.DiskTotal = 100 * 1024 * 1024 * 1024 // 100GB placeholder
	info.DiskFree = 50 * 1024 * 1024 * 1024   // 50GB placeholder
	info.DiskUsagePercent = ((float64(info.DiskTotal) - float64(info.DiskFree)) / float64(info.DiskTotal)) * 100

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "healthy",
		"service":   "telemetry-service",
		"version":   "1.0.0",
		"uptime":    time.Since(stats.StartTime).String(),
		"requests":  stats.TotalRequests,
	})
}

func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	stats.mu.Lock()
	stats.TotalRequests = 0
	stats.AuthAttempts = 0
	stats.SuccessfulLogins = 0
	stats.FailedLogins = 0
	stats.ActiveSessions = 0
	stats.EndpointsAccessed = make(map[string]int64)
	stats.Errors = make([]ErrorEntry, 0)
	stats.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "reset"})
}

func main() {
	port := PORT
	if portEnv := os.Getenv("PORT"); portEnv != "" {
		if p, err := strconv.Atoi(portEnv); err == nil {
			port = p
		}
	}

	http.HandleFunc("/record", recordHandler)
	http.HandleFunc("/stats", statsHandler)
	http.HandleFunc("/system", systemInfoHandler)
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/reset", resetHandler)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Telemetry Service starting on port %d", port)
	log.Printf("Runtime: %s", runtime.Version())
	
	server := &http.Server{
		Addr:         addr,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
