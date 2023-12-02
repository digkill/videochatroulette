import { useEffect, useRef } from 'react'

const Meet = (props:any) => {
  const userVideo = useRef<HTMLVideoElement>(null)
  const userStream = useRef<MediaStream>(null)
  const partnerVideo = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection>(null)
  const webSocketRef = useRef(null)


  const openCamera = async () => {
    const allDevices:MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices()
    const cameras:MediaDeviceInfo[] = allDevices.filter(
      (device:MediaDeviceInfo):boolean => device.kind == 'videoinput',
    )
    console.log(cameras)

    const constraints = {
      audio: true,
      video: {
        deviceId: cameras[1].deviceId,
      },
    }

    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      console.log(err)
    }

  }

  useEffect(() => {
    console.log('use effect')
    // @ts-ignore
    openCamera().then((stream: MediaStream) => {
      // @ts-ignore
      userVideo.current.srcObject = stream
      // @ts-ignore
      userStream.current = stream


      console.log('props.match.params.meetID', props.match)

      // @ts-ignore
      webSocketRef.current = new WebSocket(`ws://localhost:8000/join-meet?meetID=${props.match.params.meetID}`)

      // @ts-ignore
      webSocketRef.current.addEventListener("open", ():void => {
        // @ts-ignore
        webSocketRef.current.send(JSON.stringify({join: true}))
      })

      // @ts-ignore
      webSocketRef.current.addEventListener("message", async(e:any): Promise<void> => {
        const message = JSON.parse(e.data)

        if (message.join) {
          callUser()
        }

        if (message.offer) {
          handleOffer(message.offer)
        }

        if (message.answer) {
          console.log("Receiving Answer")
          // @ts-ignore
          peerRef.current.setRemoteDescription(
            new RTCSessionDescription(message.answer)
          )
        }

        if (message.iceCandidate) {
          console.log("Receiving and Adding ICE Candidate");
          try {
            // @ts-ignore
            await peerRef.current.addIceCandidate(
              message.iceCandidate
            )
          } catch (err) {
            console.log("Error Receiving ICE Candidate", err);
          }
        }

      })

    })
  })

  const handleOffer = async (offer:any) => {
    console.log("Received Offer, Creating Answer")
    // @ts-ignore
    peerRef.current = createPeer()

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    )

    // @ts-ignore
    userStream.current.getTracks().forEach((track: MediaStreamTrack):void => {
      // @ts-ignore
      peerRef.current.addTrack(track, userStream.current)
    })

    const answer:RTCSessionDescriptionInit = await peerRef.current.createAnswer()
    await peerRef.current.setLocalDescription(answer)

    // @ts-ignore
    webSocketRef.current.send(
      JSON.stringify({answer: peerRef.current.localDescription})
    )

  }

  const callUser = () => {
    console.log("Calling Other User")
    // @ts-ignore
    peerRef.current = createPeer()

    // @ts-ignore
    userStream.current.getTracks().forEach((track) => {
      // @ts-ignore
      peerRef.current.addTrack(track, userStream.current)
    })
  }

  const createPeer = ():RTCPeerConnection => {
    console.log("Creating Peer Connection");
    const peer:RTCPeerConnection = new RTCPeerConnection({
      iceServers: [{urls: "stun:stun.l.google.com:19302"}]
    })

    peer.onnegotiationneeded = handleNegotiationNeeded
    peer.onicecandidate = handleIceCandidateEvent
    peer.ontrack = handleTrackEvent

    return peer
  }

  const handleNegotiationNeeded = async ():Promise<void> => {
    console.log("Creating Offer");

    try {
      // @ts-ignore
      const myOffer = await peerRef.current.createOffer()
      // @ts-ignore
      await peerRef.current.setLocalDescription(myOffer)

      // @ts-ignore
      webSocketRef.current.send(JSON.stringify({offer: peerRef.current.localDescription}))

    } catch (err) {
      console.error(err)
    }
  }

  const handleIceCandidateEvent = (e:any): void => {
    console.log("Found Ice Candidate");
    if (e.candidate) {
      console.log(e.candidate)
      // @ts-ignore
      webSocketRef.current.send(
        JSON.stringify({iceCandidate: e.candidate})
      )
    }
  }

  const handleTrackEvent = (e:Event):void => {
    console.log("Received Tracks");
    // @ts-ignore
    partnerVideo.current.srcObject = e.streams[0]
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-6'>
          <video src='https://www.youtube.com/watch?v=CLoUY1kA4ZY&ab_channel=TOKUMAJAPAN' className='object-fit-cover'
                 ref={userVideo} autoPlay></video>
        </div>
        <div className='col-6'>
          <video src='' className='object-fit-cover' ref={partnerVideo} autoPlay></video>
        </div>
      </div>
    </div>
  )
}
export default Meet