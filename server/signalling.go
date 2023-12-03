package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
	"time"
)

const (
	writeWait = 10 * time.Second
	pongWait  = 60 * time.Second
	//	pingPeriod = (pongWait * 9) / 10
)

var AllMeets MeetMap

func CreateMeetRequestHandler(responseWrite http.ResponseWriter, request *http.Request) {
	responseWrite.Header().Set("Access-Control-Allow-Origin", "*")
	meetID := AllMeets.CreateMeet()

	type response struct {
		MeetID string `json:"meet_id"`
	}

	log.Print("all meets")
	log.Println(AllMeets.Map)
	err := json.NewEncoder(responseWrite).Encode(response{MeetID: meetID})
	if err != nil {
		return
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type broadcastMessage struct {
	Message map[string]interface{}
	MeetID  string
	Client  *websocket.Conn
}

var broadcast = make(chan broadcastMessage)

func broadcaster() {

	s := new(sync.RWMutex)
	defer s.Unlock()
	for {
		message, ok := <-broadcast
		s.Lock()
		for _, client := range AllMeets.Map[message.MeetID] {

			if !ok {
				client.Conn.Close()
				fmt.Println(ok)
				return
			}

			if client.Conn != message.Client {
				client.Conn.SetWriteDeadline(time.Now().Add(writeWait))
				err := client.Conn.WriteJSON(message.Message)

				if err != nil {
					log.Fatal(err)
					client.Conn.Close()
				}
			}

		}

	}
}

func JoinMeetRequestHandler(w http.ResponseWriter, r *http.Request) {
	meetID, ok := r.URL.Query()["meetID"]

	if !ok {
		log.Println("meetID missing in URL Parameters")
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("Web Socket Upgrade Error", err)
	}

	AllMeets.InsertIntoRoom(meetID[0], false, ws)

	go broadcaster()

	for {
		var message broadcastMessage

		err := ws.ReadJSON(&message.Message)
		if err != nil {
			log.Fatal("Read Error: ", err)
		}

		message.Client = ws
		message.MeetID = meetID[0]

		log.Println(message.Message)

		broadcast <- message
	}
}
