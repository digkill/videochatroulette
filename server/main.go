package main

import (
	"log"
	"net/http"
)

func main() {
	AllMeets.Init()

	http.HandleFunc("/create-meet", CreateMeetRequestHandler)
	http.HandleFunc("/join-meet", JoinMeetRequestHandler)

	log.Println("Starting Server on Port 8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
