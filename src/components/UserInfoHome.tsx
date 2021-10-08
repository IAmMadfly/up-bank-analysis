import { useEffect, SetStateAction } from 'react'
import dayjs from 'dayjs'


interface Arguments {
    userId: SetStateAction<null | number>
}

export default function ({userId} : Arguments) {
    useEffect(() => {
        window.Main.sendMessage({
            name: "user_information_request",
            data: {
                userId:     userId,
                dateType:   'accounts'
            }
        })
        
        return () => {
            
        }
    }, [])


    return (
    <div>
        <p>User information: Id {userId}</p>
    </div>
    )
}
