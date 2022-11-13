import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SimpleMDE from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import axios from "../axios"
import styles from "./AddPost.module.scss"

import { useDispatch, useSelector } from 'react-redux';
import { fetchSinglePost } from '../Redux/slices/postSlice';
const AddPost = () => {
    const navigate = useNavigate()
    const {id} = useParams()
    const isEditing = Boolean(id)
    const inputRef = React.useRef(null)
    const [imageUrl, setImageUrl] = React.useState(useSelector(state=> state.post.data?.imageUrl) || "")
    const isLoaded = useSelector(state=> {
      if(state.post.data === null || state.post.data === undefined || state.post.data.length > 1)
        return false
      return true
    })
    console.log("isLoaded", isLoaded)
    let tags = ""
    const {title, text} = useSelector(state=> {
      if(!isLoaded) {
        return {
          title:"",
          text:""
        }
      } else {
          console.log("else", state.post.data)
          tags = state.post.data.tags.map(tag=> tag.body).join(",")
          return state.post.data
      }
    })
    const dispatch = useDispatch()
    React.useEffect(()=> {
      if(isEditing)
        dispatch(fetchSinglePost(id))
    }, [])
      const options = React.useMemo(
        () => ({
          spellChecker: false,
          maxHeight: '400px',
          autofocus: true,
          placeholder: 'Введите текст...',
          autosave: {
            enabled: true,
            delay: 1000,
          },
        }),
        [],
      );
      const removeImg = ()=> {
        setImageUrl("")
        inputRef.current.value = ""
      }
      const onSubmitHandler = async () => {
        const fields = {
            title,
            tags: tags.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').replace(/\s{2,}/g," ").split(' '),
            text,
            imageUrl
        }
        console.log(fields)
        try {
          const {data} = isEditing
          ? await axios.patch(`/posts/${id}/edit`, fields)
          : await axios.post("/createPost", fields)
        const _id = isEditing ? id : data._id
        navigate(`/posts/${_id}`)
        } catch(err) {
            alert(err.response.data.message)
        }   
      }
      const uploadImage = async event=> {
        try {
            const formData = new FormData()
            const file = event.target.files[0]
            formData.append("image", file)
            const {data} = await axios.post("/uploadImage", formData)
            setImageUrl(data.url)
          } catch(err) {
            console.warn(err)
            alert("Не удалось загрузить файл")
          }
      }
  return (
    <div className="container">
        <Paper style={{ padding: 30 }}>
            <Button className={styles.addBtn} onClick={()=> {inputRef.current.click()}} variant="outlined" size="large">
                Загрузить фото
            </Button>
            {imageUrl && (
                <>
                    <Button className={styles.removeBtn} onClick={removeImg} variant="contained" color="error">
                        Убрать фото
                    </Button>
                    <div className={styles.preview}>
                      <img  src={`https://${process.env.REACT_APP_API_URL}${imageUrl}`} />
                    </div>
                    <div></div>
                </>
            )}
            <div>
              <input className={styles.titleField} placeholder="Название"  value={title} />
            </div>
            <div>
              <input className={styles.tagsField} placeholder="Теги" value={tags}/>
            </div>
            <input onChange={event=> {uploadImage(event)}} ref={inputRef} type="file" hidden/>
            <SimpleMDE options={options} value={text}  />
            <input onClick={onSubmitHandler} type="submit" value={!isEditing ? "Создать" : "Обновить"}/>
        </Paper>  
    </div>
           
  )
}

export default AddPost