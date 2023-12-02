import axios from "axios";

const CreateMeet = (props:any):JSX.Element => {
  const create = async (e:any):Promise<void> => {
    e.preventDefault()

    const resp= await axios.get("//localhost:8000/create-meet")
    // @ts-ignore
    const {meetID} = await resp.json()

    props.history.push(`/meet/${meetID}`)
  }

  return (
    <div>
      <button onClick={create}>Create Meet</button>
    </div>
  )
}

export default CreateMeet