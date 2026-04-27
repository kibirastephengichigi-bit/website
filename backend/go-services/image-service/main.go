package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/disintegration/imaging"
)

const (
	PORT = 9003
	MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
)

type ProcessRequest struct {
	ImageData string `json:"image_data"` // Base64 encoded
	Format    string `json:"format"`     // "jpeg", "png", "webp"
	Width     int    `json:"width,omitempty"`
	Height    int    `json:"height,omitempty"`
	Quality   int    `json:"quality,omitempty"` // 1-100 for JPEG
	Thumbnail bool   `json:"thumbnail,omitempty"`
}

type ProcessResponse struct {
	ProcessedData string `json:"processed_data"`
	Format        string `json:"format"`
	Width         int    `json:"width"`
	Height        int    `json:"height"`
	Size          int    `json:"size"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func decodeImage(base64Data string) (image.Image, string, error) {
	// Remove data URL prefix if present
	if strings.HasPrefix(base64Data, "data:") {
		parts := strings.SplitN(base64Data, ",", 2)
		if len(parts) == 2 {
			base64Data = parts[1]
		}
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return nil, "", fmt.Errorf("failed to decode base64: %w", err)
	}

	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, "", fmt.Errorf("failed to decode image: %w", err)
	}

	return img, format, nil
}

func encodeImage(img image.Image, format string, quality int) ([]byte, string, error) {
	var buf bytes.Buffer
	var err error

	switch strings.ToLower(format) {
	case "jpeg", "jpg":
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: quality})
		format = "jpeg"
	case "png":
		err = png.Encode(&buf, img)
		format = "png"
	default:
		// Default to JPEG
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: quality})
		format = "jpeg"
	}

	if err != nil {
		return nil, "", fmt.Errorf("failed to encode image: %w", err)
	}

	return buf.Bytes(), format, nil
}

func processHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Limit request size
	r.Body = http.MaxBytesReader(w, r.Body, MAX_UPLOAD_SIZE)

	var req ProcessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Set defaults
	if req.Format == "" {
		req.Format = "jpeg"
	}
	if req.Quality == 0 || req.Quality > 100 {
		req.Quality = 85
	}

	// Decode image
	img, originalFormat, err := decodeImage(req.ImageData)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	// Resize if dimensions specified
	if req.Width > 0 || req.Height > 0 {
		bounds := img.Bounds()
		origW, origH := bounds.Dx(), bounds.Dy()

		if req.Width == 0 {
			req.Width = origW * req.Height / origH
		}
		if req.Height == 0 {
			req.Height = origH * req.Width / origW
		}

		img = imaging.Resize(img, req.Width, req.Height, imaging.Lanczos)
	}

	// Create thumbnail if requested
	if req.Thumbnail {
		img = imaging.Thumbnail(img, 200, 200, imaging.Lanczos)
	}

	// Encode image
	processedData, format, err := encodeImage(img, req.Format, req.Quality)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	bounds := img.Bounds()
	response := ProcessResponse{
		ProcessedData: base64.StdEncoding.EncodeToString(processedData),
		Format:        format,
		Width:         bounds.Dx(),
		Height:        bounds.Dy(),
		Size:          len(processedData),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ImageData string `json:"image_data"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	img, format, err := decodeImage(req.ImageData)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	bounds := img.Bounds()
	info := map[string]interface{}{
		"format": format,
		"width":  bounds.Dx(),
		"height": bounds.Dy(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"service": "image-service",
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

	http.HandleFunc("/process", processHandler)
	http.HandleFunc("/info", infoHandler)
	http.HandleFunc("/health", healthHandler)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Image Processing Service starting on port %d", port)
	log.Printf("Max upload size: %d bytes", MAX_UPLOAD_SIZE)
	
	server := &http.Server{
		Addr:         addr,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
