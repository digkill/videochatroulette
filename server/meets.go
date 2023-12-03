package main

import (
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Member struct {
	IsHost bool
	Conn   *websocket.Conn
}

type MeetMap struct {
	Mutex sync.RWMutex
	Map   map[string][]Member
}

func (meetMap *MeetMap) Init() {
	meetMap.Map = make(map[string][]Member)
}

func (meetMap *MeetMap) Get(roomID string) []Member {
	meetMap.Mutex.RLock()
	defer meetMap.Mutex.RUnlock()

	return meetMap.Map[roomID]
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
	meetMap.Map[meetID] = []Member{}

	return meetID
}

func (meetMap *MeetMap) InsertIntoRoom(meetID string, isHost bool, conn *websocket.Conn) {
	meetMap.Mutex.Lock()
	defer meetMap.Mutex.Unlock()

	member := Member{isHost, conn}

	log.Println("Inserting into Meet with meetID: ", meetID)
	meetMap.Map[meetID] = append(meetMap.Map[meetID], member)
}

func (meetMap *MeetMap) DeleteMeet(meetID string) {
	meetMap.Mutex.Lock()
	defer meetMap.Mutex.Unlock()

	delete(meetMap.Map, meetID)
}
