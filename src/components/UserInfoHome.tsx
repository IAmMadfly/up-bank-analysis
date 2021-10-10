import { useEffect, SetStateAction } from 'react'

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

        let listener = window.Main.on("user_information_response", (_event, accountInfo) => {
            console.log("Got account info:", accountInfo);
        })
        
        return () => {
            window.Main.off(listener);
        }
    }, [])


    return (
    <div>
        <p>User information: Id {userId}</p>
    </div>
    )
}
