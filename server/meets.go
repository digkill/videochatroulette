package main

import (
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Participant struct {
	Host bool
	Conn *websocket.Conn
}

type MeetMap struct {
	Mutex sync.RWMutex
	Map   map[string][]Participant
}

func (meetMap *MeetMap) Init() {
	meetMap.Map = make(map[string][]Participant)
}

func (meetMap *MeetMap) CreateMeet() string {
	meetMap.Mutex.Lock()
	defer meetMap.Mutex.Unlock()

	rand.New(rand.NewSource(time.Now().UnixNano()))

	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
	slug := make([]rune, 8)

	for i := range slug {
		slug[i] = letters[rand.Intn(len(letters))]
	}

	meetID := string(slug)
	meetMap.Map[meetID] = []Participant{}

	return meetID
}
