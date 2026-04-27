package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

const (
	PORT = 9004
	MAX_WORKERS = 10
)

type Task struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	Payload   map[string]interface{} `json:"payload"`
	CreatedAt time.Time              `json:"created_at"`
}

type TaskResult struct {
	ID        string                 `json:"id"`
	Status    string                 `json:"status"` // "pending", "processing", "completed", "failed"
	Result    map[string]interface{} `json:"result,omitempty"`
	Error     string                 `json:"error,omitempty"`
	StartedAt time.Time              `json:"started_at,omitempty"`
	CompletedAt time.Time            `json:"completed_at,omitempty"`
}

type WorkerPool struct {
	tasks    map[string]*TaskResult
	queue    chan *Task
	workers  int
	mu       sync.RWMutex
}

func NewWorkerPool(workers int) *WorkerPool {
	return &WorkerPool{
		tasks:   make(map[string]*TaskResult),
		queue:   make(chan *Task, 100),
		workers: workers,
	}
}

func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workers; i++ {
		go wp.worker()
	}
	log.Printf("Started %d workers", wp.workers)
}

func (wp *WorkerPool) worker() {
	for task := range wp.queue {
		wp.processTask(task)
	}
}

func (wp *WorkerPool) processTask(task *Task) {
	wp.mu.Lock()
	result := wp.tasks[task.ID]
	result.Status = "processing"
	result.StartedAt = time.Now()
	wp.mu.Unlock()

	log.Printf("Processing task %s of type %s", task.ID, task.Type)

	// Simulate processing based on task type
	var taskResult map[string]interface{}
	var err error

	switch task.Type {
	case "email":
		taskResult, err = wp.processEmail(task.Payload)
	case "report":
		taskResult, err = wp.processReport(task.Payload)
	case "cleanup":
		taskResult, err = wp.processCleanup(task.Payload)
	case "backup":
		taskResult, err = wp.processBackup(task.Payload)
	default:
		err = fmt.Errorf("unknown task type: %s", task.Type)
	}

	wp.mu.Lock()
	if err != nil {
		result.Status = "failed"
		result.Error = err.Error()
	} else {
		result.Status = "completed"
		result.Result = taskResult
	}
	result.CompletedAt = time.Now()
	wp.mu.Unlock()

	log.Printf("Task %s completed with status: %s", task.ID, result.Status)
}

func (wp *WorkerPool) processEmail(payload map[string]interface{}) (map[string]interface{}, error) {
	// Simulate email sending
	time.Sleep(100 * time.Millisecond)
	return map[string]interface{}{
		"sent":     true,
		"recipient": payload["to"],
	}, nil
}

func (wp *WorkerPool) processReport(payload map[string]interface{}) (map[string]interface{}, error) {
	// Simulate report generation
	time.Sleep(500 * time.Millisecond)
	return map[string]interface{}{
		"generated": true,
		"report_id": fmt.Sprintf("report-%d", time.Now().Unix()),
	}, nil
}

func (wp *WorkerPool) processCleanup(payload map[string]interface{}) (map[string]interface{}, error) {
	// Simulate cleanup operation
	time.Sleep(200 * time.Millisecond)
	return map[string]interface{}{
		"cleaned": true,
		"files_removed": 42,
	}, nil
}

func (wp *WorkerPool) processBackup(payload map[string]interface{}) (map[string]interface{}, error) {
	// Simulate backup operation
	time.Sleep(1 * time.Second)
	return map[string]interface{}{
		"backed_up": true,
		"size_mb":  1024,
	}, nil
}

func (wp *WorkerPool) AddTask(task *Task) string {
	wp.mu.Lock()
	defer wp.mu.Unlock()

	result := &TaskResult{
		ID:     task.ID,
		Status: "pending",
	}
	wp.tasks[task.ID] = result
	wp.queue <- task

	return task.ID
}

func (wp *WorkerPool) GetTask(id string) *TaskResult {
	wp.mu.RLock()
	defer wp.mu.RUnlock()
	return wp.tasks[id]
}

func (wp *WorkerPool) ListTasks() []*TaskResult {
	wp.mu.RLock()
	defer wp.mu.RUnlock()

	results := make([]*TaskResult, 0, len(wp.tasks))
	for _, result := range wp.tasks {
		results = append(results, result)
	}
	return results
}

var pool *WorkerPool

func submitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var task Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if task.ID == "" {
		task.ID = fmt.Sprintf("task-%d", time.Now().UnixNano())
	}
	task.CreatedAt = time.Now()

	taskID := pool.AddTask(&task)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"task_id": taskID, "status": "queued"})
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("id")
	if taskID == "" {
		http.Error(w, "Task ID required", http.StatusBadRequest)
		return
	}

	result := pool.GetTask(taskID)
	if result == nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	tasks := pool.ListTasks()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tasks": tasks,
		"count": len(tasks),
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "healthy",
		"service":  "worker-service",
		"version":  "1.0.0",
		"workers":  pool.workers,
		"queued":   len(pool.queue),
	})
}

func main() {
	port := PORT
	if portEnv := os.Getenv("PORT"); portEnv != "" {
		if p, err := strconv.Atoi(portEnv); err == nil {
			port = p
		}
	}

	workers := MAX_WORKERS
	if workersEnv := os.Getenv("MAX_WORKERS"); workersEnv != "" {
		if w, err := strconv.Atoi(workersEnv); err == nil && w > 0 {
			workers = w
		}
	}

	pool = NewWorkerPool(workers)
	pool.Start()

	http.HandleFunc("/submit", submitHandler)
	http.HandleFunc("/status", statusHandler)
	http.HandleFunc("/list", listHandler)
	http.HandleFunc("/health", healthHandler)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Background Worker Service starting on port %d", port)
	log.Printf("Workers: %d", workers)
	
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
