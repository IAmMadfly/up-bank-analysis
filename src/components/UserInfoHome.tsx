import { JSXElementConstructor } from 'hoist-non-react-statics/node_modules/@types/react';
import { useEffect, useState, SetStateAction } from 'react'
import { AccountData } from '../../electron/database_handler';

interface Arguments {
    userId: SetStateAction<null | number>
}

export default function ({userId} : Arguments) {
    const [accounts, setAccounts] = useState(new Array<AccountData>());

    useEffect(() => {
        window.Main.sendMessage({
            name: "set_user_event",
            data: userId
        });
        window.Main.sendMessage({
            name: "user_information_request",
            data: {
                userId:     userId,
                dateType:   'accounts'
            }
        })

        let listener = window.Main.on("user_information_response", (_event, accountInfo: Array<AccountData>) => {
            console.log("Got account info:", accountInfo);
            setAccounts(accountInfo);
        })
        
        return () => {
            window.Main.off(listener);
        }
    }, [])

    const accountElements = () => {
        let accountRows = new Array<JSX.Element>();

        for (let account of accounts) {
            accountRows.push(<div>
                <span>{account.name}</span>
                <span>{account.type}</span>
                <span>{account.balance}</span>
                <span>{account.created.$d.toDateString()}</span>
            </div>);

            console.log("Pushed account:", account.created);

        }
        
        return accountRows;
    }


    return (
    <div>
        <p>User information: Id {userId}</p>
        {accountElements()}
    </div>
    )
}
