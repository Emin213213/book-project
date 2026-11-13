import {useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {Action} from "@/pages/customer/home/model/action.enum.ts";
import toast from "react-hot-toast";



const MESSAGES:Partial<Record<string, string>> = {
    [Action.UNNAUTHORIZED_PASSWORD_ACTION]:'Action canceled please sign in to continue'
}

export function useAuthActionNotice() {

    const [searchParams,setSearchParams] = useSearchParams()

    const action  = searchParams.get('action')

    useEffect(() => {
        if(!action) return

        const message = MESSAGES[action]

        if(message)  toast.success(message)

        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)

            params.delete('action')
            return params
        },{replace:true})

    },[action,setSearchParams])



}