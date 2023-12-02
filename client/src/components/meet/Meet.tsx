import { useEffect, useRef } from 'react'

const Meet = () => {
  const userVideo = useRef<HTMLVideoElement>(null)
  const userStream = useRef<MediaStream>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null)

  const openCamera = async () => {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const cameras = allDevices.filter(
      (device) => device.kind == "videoinput"
    );
    console.log(cameras);
  }

  useEffect(() => {
    console.log('use effect')
    // @ts-ignore
    openCamera().then((stream: MediaStream)=> {
      // @ts-ignore
      userVideo.current.srcObject = stream;
      // @ts-ignore
      userStream.current = stream;

    })
  })

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