import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'


const CreateMeet = (): JSX.Element => {

  useEffect(() => {
    //  const  navigate = useNavigate();
    console.log('Already!!!')
  })
  let navigate = useNavigate()

  const create = async (e: any): Promise<void> => {
    e.preventDefault()


    const resp = await axios.get('//localhost:8000/create-meet')
    console.log('resp', resp)
    const meetID = await resp.data.meet_id


    navigate(`/meet/${meetID}`, { replace: true })
  }

  return (
    <div>
      <button onClick={create}>Create Meet</button>
    </div>
  )
}

export default CreateMeet