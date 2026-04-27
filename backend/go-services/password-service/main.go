package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/pbkdf2"
)

const (
	PORT            = 9001
	PBKDF2_ITERATIONS = 240000
	SALT_LENGTH     = 16
)

type HashRequest struct {
	Password string `json:"password"`
	Salt     string `json:"salt,omitempty"`
}

type HashResponse struct {
	Hash string `json:"hash"`
	Salt string `json:"salt"`
}

type VerifyRequest struct {
	Password     string `json:"password"`
	StoredHash  string `json:"stored_hash"`
}

type VerifyResponse struct {
	Valid bool `json:"valid"`
}

func generateSalt() (string, error) {
	salt := make([]byte, SALT_LENGTH)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", salt), nil
}

func hashPassword(password, salt string) string {
	key := pbkdf2.Key([]byte(password), []byte(salt), PBKDF2_ITERATIONS, 32, sha256.New)
	encoded := base64.URLEncoding.EncodeToString(key)
	return fmt.Sprintf("pbkdf2_sha256$%d$%s$%s", PBKDF2_ITERATIONS, salt, encoded)
}

func verifyPassword(password, storedHash string) bool {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 4 {
		return false
	}
	
	algorithm := parts[0]
	iterationsStr := parts[1]
	salt := parts[2]
	encoded := parts[3]
	
	if algorithm != "pbkdf2_sha256" {
		return false
	}
	
	iterations, err := strconv.Atoi(iterationsStr)
	if err != nil {
		return false
	}
	
	key := pbkdf2.Key([]byte(password), []byte(salt), iterations, 32, sha256.New)
	candidate := base64.URLEncoding.EncodeToString(key)
	
	return candidate == encoded
}

func hashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req HashRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	salt := req.Salt
	if salt == "" {
		var err error
		salt, err = generateSalt()
		if err != nil {
			http.Error(w, "Failed to generate salt", http.StatusInternalServerError)
			return
		}
	}

	hash := hashPassword(req.Password, salt)

	response := HashResponse{
		Hash: hash,
		Salt: salt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func verifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	valid := verifyPassword(req.Password, req.StoredHash)

	response := VerifyResponse{
		Valid: valid,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "healthy",
		"service": "password-service",
		"version": "1.0.0",
	})
}

func main() {
	port := PORT
	if portEnv := os.Getenv("PORT"); portEnv != "" {
		if p, err := strconv.Atoi(portEnv); err == nil {
			port = p
		}
	}

	http.HandleFunc("/hash", hashHandler)
	http.HandleFunc("/verify", verifyHandler)
	http.HandleFunc("/health", healthHandler)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Password Hashing Service starting on port %d", port)
	log.Printf("PBKDF2 iterations: %d", PBKDF2_ITERATIONS)
	
	server := &http.Server{
		Addr:         addr,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
